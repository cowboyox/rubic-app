import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import BigNumber from 'bignumber.js';
import { BlockchainName, EvmWeb3Pure, OnChainTrade } from 'rubic-sdk';
import { SdkService } from '@core/services/sdk/sdk.service';
import { RubicError } from '@core/errors/models/rubic-error';
import { cryptoCode } from '@features/swaps/features/onramper-exchange/constants/crypto-code';
import { OnramperRateResponse } from '@features/swaps/features/onramper-exchange/services/onramper-calculation-service/models/onramper-rate-response';
import { onramperApiKey } from '@features/swaps/shared/constants/onramper/onramper-api-key';
import { SwapFormInputFiats } from '@core/services/swaps/models/swap-form-fiats';
import {
  OnramperSupportedBlockchain,
  onramperSupportedBlockchains
} from '@features/swaps/features/onramper-exchange/models/onramper-supported-blockchain';
import { GasService } from '@core/services/gas-service/gas.service';
import { onChainProxyMaxGasLimit } from '@core/services/onramper/constants/on-chain-proxy-max-gas-limit';

@Injectable()
export class OnramperCalculationService {
  public static isSupportedBlockchain(
    blockchain: BlockchainName
  ): blockchain is OnramperSupportedBlockchain {
    return onramperSupportedBlockchains.some(
      supportedBlockchain => supportedBlockchain === blockchain
    );
  }

  constructor(
    private readonly httpClient: HttpClient,
    private readonly sdkService: SdkService,
    private readonly gasService: GasService
  ) {}

  public async getOutputTokenAmount(input: SwapFormInputFiats): Promise<BigNumber | null> {
    const receivedNativeAmount = await this.getOutputNativeAmount(input);
    if (EvmWeb3Pure.isNativeAddress(input.toToken.address)) {
      return receivedNativeAmount;
    }

    const gasPrice = await this.gasService.getGasPriceInEthUnits(input.toBlockchain);
    const gasFee = gasPrice.multipliedBy(onChainProxyMaxGasLimit);
    const onChainTrades = await this.sdkService.instantTrade.calculateTrade(
      {
        address: EvmWeb3Pure.nativeTokenAddress,
        blockchain: input.toToken.blockchain
      },
      receivedNativeAmount.minus(gasFee).toFixed(),
      input.toToken.address,
      {
        gasCalculation: 'disabled'
      }
    );
    const bestTrade = onChainTrades[onChainTrades.length - 1];
    if (bestTrade instanceof OnChainTrade) {
      return bestTrade.to.tokenAmount;
    } else {
      throw bestTrade.error;
    }
  }

  private async getOutputNativeAmount(input: SwapFormInputFiats): Promise<BigNumber> {
    const fromFiat = input.fromFiat.symbol;
    const toCrypto = cryptoCode[input.toToken.blockchain as OnramperSupportedBlockchain];
    const fromAmount = input.fromAmount.toFixed();

    const trades = await firstValueFrom(
      this.httpClient.get<OnramperRateResponse>(
        `https://onramper.tech/rate/${fromFiat}/${toCrypto}/creditCard/${fromAmount}`,
        {
          headers: { Authorization: `Basic ${onramperApiKey}` }
        }
      )
    );
    const bestTrade = trades
      .filter(trade => trade.available)
      .sort((a, b) => {
        if (a.receivedCrypto === b.receivedCrypto) {
          return 0;
        }
        return a.receivedCrypto > b.receivedCrypto ? -1 : 1;
      })[0];
    if (!bestTrade?.receivedCrypto) {
      throw new RubicError('Trade is not available');
    }
    return new BigNumber(bestTrade.receivedCrypto);
  }
}
