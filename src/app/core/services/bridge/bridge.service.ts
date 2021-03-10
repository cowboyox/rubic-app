import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { List } from 'immutable';
import { HttpClient } from '@angular/common/http';
import BigNumber from 'bignumber.js';
import { map, catchError, flatMap } from 'rxjs/operators';
import { IBridgeToken, ITableTransaction } from './types';
import { Web3PrivateService } from '../blockchain/web3-private-service/web3-private.service';
import { BridgeTransaction } from './BridgeTransaction';
import { NetworkError } from '../../../shared/models/errors/bridge/NetworkError';
import { RubicError } from '../../../shared/models/errors/RubicError';
import { OverQueryLimitError } from '../../../shared/models/errors/bridge/OverQueryLimitError';
import { BackendApiService } from '../backend/backend-api/backend-api.service';

interface BinanceResponse {
  code: number;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class BridgeService {
  private apiUrl = 'https://api.binance.org/bridge/api/v2/';

  private _tokens: BehaviorSubject<List<IBridgeToken>> = new BehaviorSubject(List([]));

  private _transactions: BehaviorSubject<List<ITableTransaction>> = new BehaviorSubject(List([]));

  public walletAddress: string;

  public readonly tokens: Observable<List<IBridgeToken>> = this._tokens.asObservable();

  public readonly transactions: Observable<
    List<ITableTransaction>
  > = this._transactions.asObservable();

  constructor(
    private httpClient: HttpClient,
    private web3Api: Web3PrivateService,
    private backendApiService: BackendApiService
  ) {
    this.getTokensList();
    this.updateTransactionsList();
    this.walletAddress = web3Api.address;
  }

  private getTokensList(): void {
    this.httpClient.get(`${this.apiUrl}tokens`).subscribe(
      (res: BinanceResponse) => {
        if (res.code !== 20000) {
          console.log(`Error retrieving Todos, code ${res.code}`);
        } else {
          const tokensWithUpdatedImages = this.getTokensImages(List(res.data.tokens));
          this._tokens.next(tokensWithUpdatedImages);
        }
      },
      err => console.log(`Error retrieving tokens ${err}`)
    );
  }

  private getTokensImages(tokens: List<IBridgeToken>): List<IBridgeToken> {
    // @ts-ignore
    const allTokensList = window.coingecko_tokens;

    return tokens
      .filter(token => token.ethContractAddress || token.symbol === 'ETH')
      .map(token => {
        const tokenInfo = allTokensList.find(item => item.token_short_title === token.symbol);
        token.icon = (tokenInfo && tokenInfo.image_link) || '/assets/images/icons/coins/empty.svg';
        return token;
      });
  }

  public getFee(tokenSymbol: string, networkName: string): Observable<number> {
    return this.httpClient.get(`${this.apiUrl}tokens/${tokenSymbol}/networks`).pipe(
      // eslint-disable-next-line consistent-return
      map((res: BinanceResponse) => {
        if (res.code !== 20000) {
          console.log(`Error retrieving tokens, code ${res.code}`);
        } else {
          return res.data.networks.find(network => network.name === networkName).networkFee;
        }
      }),
      catchError(err => {
        console.log(`Error retrieving tokens ${err}`);
        return throwError(err);
      })
    );
  }

  public createTrade(
    token: IBridgeToken,
    fromNetwork: string,
    toNetwork: string,
    amount: BigNumber,
    toAddress: string,
    onTransactionHash?: (hash: string) => void
  ): Observable<string> {
    /* if (this.web3Api.error) {
      return throwError(this.web3Api.error);
    } */

    if (!this.web3Api.network || this.web3Api.network.name !== fromNetwork) {
      return throwError(new NetworkError(fromNetwork));
    }

    const body = {
      amount: amount.toString(),
      fromNetwork,
      source: 921,
      symbol: token.symbol,
      toAddress,
      toAddressLabel: '',
      toNetwork,
      walletAddress: this.web3Api.address,
      walletNetwork: toNetwork
    };

    return this.httpClient.post(`${this.apiUrl}swaps/`, body).pipe(
      flatMap((res: BinanceResponse) => {
        if (res.code !== 20000) {
          console.log(`Bridge POST error, code ${res.code}`);
          return throwError(new OverQueryLimitError());
        }
        const { data } = res;
        const tx = new BridgeTransaction(
          data.id,
          fromNetwork,
          token,
          data.status,
          data.depositAddress,
          amount,
          data.toAddress,
          this.web3Api
        );
        return from(this.sendDeposit(tx, onTransactionHash));
      }),
      catchError(err => {
        console.error(`Error bridge post ${err}`);
        return throwError(err instanceof RubicError ? err : new RubicError());
      })
    );
  }

  private async sendDeposit(
    tx: BridgeTransaction,
    onTransactionHash?: (hash: string) => void
  ): Promise<string> {
    const onTxHash = async (hash: string): Promise<void> => {
      if (onTransactionHash && typeof onTransactionHash === 'function') {
        onTransactionHash(hash);
      }

      await this.sendTransactionInfo(tx);
      await this.updateTransactionsList();
      this.backendApiService.notifyBridgeBot(tx, this.web3Api.address);
    };

    await tx.sendDeposit(onTxHash);

    return tx.binanceId;
  }

  public async updateTransactionsList(): Promise<void> {
    const txArray = await this.backendApiService.getTransactions(
      this.web3Api.address.toLowerCase()
    );
    this._transactions.next(List(txArray));
  }

  private async sendTransactionInfo(tx: BridgeTransaction): Promise<void> {
    return this.backendApiService.postTransaction(
      tx.binanceId,
      tx.token.ethSymbol,
      tx.token.bscSymbol
    );
  }
}
