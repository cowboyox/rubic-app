import { Injectable } from '@angular/core';
import { Observable, Subject, zip } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { EthereumBinanceBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-binance-bridge-provider/ethereum-binance-bridge-provider.service';
import { EthereumBinanceRubicBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-binance-bridge-provider/rubic-bridge-provider/ethereum-binance-rubic-bridge-provider.service';
import { EthereumPolygonBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-polygon-bridge-provider/ethereum-polygon-bridge-provider.service';
import { EthereumTronBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-tron-bridge-provider/ethereum-tron-bridge-provider.service';
import { EthereumXdaiBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-xdai-bridge-provider/ethereum-xdai-bridge-provider.service';
import { BinanceTronBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/binance-tron-bridge-provider/binance-tron-bridge-provider.service';
import { BlockchainsBridgeProvider } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/blockchains-bridge-provider';
import { BlockchainsBridgeTokens } from 'src/app/features/bridge/models/BlockchainsBridgeTokens';
import { first, map } from 'rxjs/operators';

@Injectable()
export class BridgeService {
  private blockchainsProviders;

  private tokens$ = new Subject<BlockchainsBridgeTokens[]>();

  public get tokens(): Observable<BlockchainsBridgeTokens[]> {
    return this.tokens$.asObservable();
  }

  constructor(
    private ethereumBinanceBridgeProviderService: EthereumBinanceBridgeProviderService,
    private rubicBridgeProviderService: EthereumBinanceRubicBridgeProviderService,
    private ethereumPolygonBridgeProviderService: EthereumPolygonBridgeProviderService,
    private ethereumTronBridgeProviderService: EthereumTronBridgeProviderService,
    private ethereumXdaiBridgeProviderService: EthereumXdaiBridgeProviderService,
    private binanceTronBridgeProviderService: BinanceTronBridgeProviderService
  ) {
    this.setBlockchainsProviders();
    this.setTokens();
  }

  private setBlockchainsProviders(): void {
    this.blockchainsProviders = {
      [BLOCKCHAIN_NAME.ETHEREUM]: {
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: this.ethereumBinanceBridgeProviderService,
        [BLOCKCHAIN_NAME.POLYGON]: this.ethereumPolygonBridgeProviderService,
        [BLOCKCHAIN_NAME.TRON]: this.ethereumTronBridgeProviderService,
        [BLOCKCHAIN_NAME.XDAI]: this.ethereumXdaiBridgeProviderService
      },
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        [BLOCKCHAIN_NAME.ETHEREUM]: this.ethereumBinanceBridgeProviderService,
        [BLOCKCHAIN_NAME.TRON]: this.binanceTronBridgeProviderService
      },
      [BLOCKCHAIN_NAME.POLYGON]: {
        [BLOCKCHAIN_NAME.ETHEREUM]: this.ethereumPolygonBridgeProviderService
      },
      [BLOCKCHAIN_NAME.TRON]: {
        [BLOCKCHAIN_NAME.ETHEREUM]: this.ethereumTronBridgeProviderService,
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: this.binanceTronBridgeProviderService
      },
      [BLOCKCHAIN_NAME.XDAI]: {
        [BLOCKCHAIN_NAME.ETHEREUM]: this.ethereumXdaiBridgeProviderService
      }
    };
  }

  private setTokens(): void {
    const tokensObservables: Observable<BlockchainsBridgeTokens>[] = [];

    Object.values(BLOCKCHAIN_NAME).forEach((fromBlockchain, indexFrom) => {
      Object.values(BLOCKCHAIN_NAME).forEach((toBlockchain, indexTo) => {
        if (
          indexFrom >= indexTo ||
          fromBlockchain.includes('_TESTNET') ||
          toBlockchain.includes('_TESTNET')
        ) {
          return;
        }

        const provider: BlockchainsBridgeProvider =
          this.blockchainsProviders[fromBlockchain]?.[toBlockchain];

        if (provider) {
          tokensObservables.push(
            provider.tokens.pipe(
              map(bridgeTokens => {
                return {
                  fromBlockchain,
                  toBlockchain,
                  bridgeTokens
                };
              })
            )
          );
        }
      });
    });

    zip(...tokensObservables)
      .pipe(first())
      .subscribe(tokens => this.tokens$.next(tokens));
  }
}
