import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import {
  CcrSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { from, Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import {
  crossChainSwapContractAddresses,
  SupportedCrossChainSwapBlockchain,
  supportedCrossChainSwapBlockchains
} from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/constants/crossChainSwapContract/crossChainSwapContractAddresses';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';
import {
  TransitTokens,
  transitTokensWithMode
} from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/constants/transitTokens';
import { QuickSwapService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/polygon/quick-swap-service/quick-swap.service';
import { PancakeSwapService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/bsc/pancake-swap-service/pancake-swap.service';
import { UniSwapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v2-service/uni-swap-v2.service';
import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';
import { CROSS_CHAIN_ROUTING_SWAP_METHOD } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/models/CROSS_CHAIN_ROUTING_SWAP_METHOD';
import { CrossChainRoutingTrade } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/models/CrossChainRoutingTrade';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import { crossChainSwapContractAbi } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/constants/crossChainSwapContract/crossChainSwapContractAbi';
import { CrossChainRoutingModule } from 'src/app/features/cross-chain-routing/cross-chain-routing.module';
import { UniswapV2ProviderAbstract } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/abstract-provider/uniswap-v2-provider.abstract';

@Injectable({
  providedIn: CrossChainRoutingModule
})
export class CrossChainRoutingService {
  private contractAbi = crossChainSwapContractAbi;

  private contractAddresses: Record<SupportedCrossChainSwapBlockchain, string>;

  private transitTokens: TransitTokens;

  private uniswapProviders: Record<SupportedCrossChainSwapBlockchain, UniswapV2ProviderAbstract>;

  private toBlockchainsInContract: Record<SupportedCrossChainSwapBlockchain, number>;

  private settings: CcrSettingsForm;

  private static isSupportedBlockchain(
    blockchain: BLOCKCHAIN_NAME
  ): blockchain is SupportedCrossChainSwapBlockchain {
    return (supportedCrossChainSwapBlockchains as readonly BLOCKCHAIN_NAME[]).includes(blockchain);
  }

  private static checkBlockchains(
    fromBlockchain: BLOCKCHAIN_NAME,
    toBlockchain: BLOCKCHAIN_NAME
  ): void | never {
    if (
      !CrossChainRoutingService.isSupportedBlockchain(fromBlockchain) ||
      !CrossChainRoutingService.isSupportedBlockchain(toBlockchain)
    ) {
      throw Error('Not supported blockchains');
    }
  }

  constructor(
    private readonly uniSwapV2Service: UniSwapV2Service,
    private readonly pancakeSwapService: PancakeSwapService,
    private readonly quickSwapService: QuickSwapService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly settingsService: SettingsService,
    private readonly web3PublicService: Web3PublicService,
    private readonly web3PrivateService: Web3PrivateService,
    private readonly useTestingModeService: UseTestingModeService
  ) {
    this.setUniswapProviders();
    this.setToBlockchainsInContract();

    this.settingsService.crossChainRoutingValueChanges
      .pipe(startWith(this.settingsService.crossChainRoutingValue))
      .subscribe(settings => {
        this.settings = settings;
      });

    this.contractAddresses = crossChainSwapContractAddresses.mainnet;
    this.transitTokens = transitTokensWithMode.mainnet;

    this.initTestingMode();
  }

  private initTestingMode(): void {
    this.useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.contractAddresses = crossChainSwapContractAddresses.testnet;
        this.transitTokens = transitTokensWithMode.testnet;
      }
    });
  }

  private setUniswapProviders(): void {
    this.uniswapProviders = {
      [BLOCKCHAIN_NAME.ETHEREUM]: this.uniSwapV2Service,
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: this.pancakeSwapService,
      [BLOCKCHAIN_NAME.POLYGON]: this.quickSwapService
    };
  }

  private setToBlockchainsInContract(): void {
    this.toBlockchainsInContract = {
      [BLOCKCHAIN_NAME.ETHEREUM]: 2,
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 1,
      [BLOCKCHAIN_NAME.POLYGON]: 3
    };
  }

  public needApprove(token: BlockchainToken): Observable<boolean> {
    const web3Public: Web3Public = this.web3PublicService[token.blockchain];
    if (web3Public.isNativeAddress(token.address)) {
      return of(false);
    }

    const contractAddress = this.contractAddresses[token.blockchain];
    return from(
      web3Public.getAllowance(token.address, this.providerConnectorService.address, contractAddress)
    ).pipe(map(allowance => allowance.eq(0)));
  }

  public approve(
    token: BlockchainToken,
    options: TransactionOptions = {}
  ): Observable<TransactionReceipt> {
    const contractAddress = this.contractAddresses[token.blockchain];
    return from(
      this.web3PrivateService.approveTokens(token.address, contractAddress, 'infinity', options)
    );
  }

  public async getMinMaxAmounts(fromToken: BlockchainToken): Promise<{
    minAmount: number;
    maxAmount: number;
  }> {
    const fromBlockchain = fromToken.blockchain;
    if (!CrossChainRoutingService.isSupportedBlockchain(fromBlockchain)) {
      throw Error('Not supported blockchain');
    }

    const web3Public: Web3Public = this.web3PublicService[fromBlockchain];
    const minTransitTokenAmountAbsolute = (await web3Public.callContractMethod(
      this.contractAddresses[fromBlockchain],
      this.contractAbi,
      'minTokenAmount'
    )) as string;
    const transitToken = this.transitTokens[fromBlockchain];
    const minTransitTokenAmount = Web3Public.fromWei(
      minTransitTokenAmountAbsolute,
      transitToken.decimals
    );

    const minAmountAbsolute = minTransitTokenAmount.gt(0)
      ? await this.uniswapProviders[fromBlockchain].getFromAmount(
          fromBlockchain,
          fromToken.address,
          transitToken,
          minTransitTokenAmount
        )
      : 0;
    const minAmount = Web3Public.fromWei(minAmountAbsolute, fromToken.decimals).toNumber();

    const maxAmount = Infinity;

    return {
      minAmount,
      maxAmount
    };
  }

  public async calculateTrade(
    fromToken: BlockchainToken,
    fromAmount: BigNumber,
    toToken: BlockchainToken
  ): Promise<CrossChainRoutingTrade> {
    const fromBlockchain = fromToken.blockchain;
    const toBlockchain = toToken.blockchain;
    CrossChainRoutingService.checkBlockchains(fromBlockchain, toBlockchain);

    const firstTransitToken = this.transitTokens[fromBlockchain];
    const secondTransitToken = this.transitTokens[toBlockchain];

    const { path: firstPath, toAmount: firstTransitTokenAmount } = await this.getPathAndToAmount(
      fromBlockchain,
      fromToken,
      fromAmount,
      firstTransitToken
    );

    const secondTransitTokenAmount = await this.getSecondTransitAmount(
      toBlockchain,
      firstTransitTokenAmount
    );

    const { path: secondPath, toAmount } = await this.getPathAndToAmount(
      toBlockchain,
      secondTransitToken,
      secondTransitTokenAmount,
      toToken
    );

    return {
      fromBlockchain,
      toBlockchain,
      tokenIn: fromToken,
      tokenInAmount: fromAmount,
      firstPath,
      rbcTokenOutAmountAbsolute: Web3Public.toWei(
        firstTransitTokenAmount,
        firstTransitToken.decimals
      ),
      tokenOut: toToken,
      secondPath,
      tokenOutAmount: toAmount
    };
  }

  private async getPathAndToAmount(
    blockchain: BLOCKCHAIN_NAME,
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken
  ): Promise<{ path: string[]; toAmount: BigNumber }> {
    if (fromToken.address.toLowerCase() !== toToken.address.toLowerCase()) {
      const instantTrade = await this.uniswapProviders[blockchain].calculateTrade(
        fromToken,
        fromAmount,
        toToken,
        false
      );
      return { path: instantTrade.options.path, toAmount: instantTrade.to.amount };
    }
    return { path: [fromToken.address], toAmount: fromAmount };
  }

  private async getSecondTransitAmount(
    toBlockchain: BLOCKCHAIN_NAME,
    firstTransitTokenAmount: BigNumber
  ): Promise<BigNumber> {
    const contractAddress = this.contractAddresses[toBlockchain];
    const web3PublicFromBlockchain: Web3Public = this.web3PublicService[toBlockchain];
    const toBlockchainInContract = this.toBlockchainsInContract[toBlockchain];
    const feeOfToBlockchainAbsolute = (await web3PublicFromBlockchain.callContractMethod(
      contractAddress,
      this.contractAbi,
      'feeAmountOfBlockchain',
      {
        methodArguments: [toBlockchainInContract]
      }
    )) as string;
    const feeOfToBlockchain = parseInt(feeOfToBlockchainAbsolute) / 10000; // to %
    return firstTransitTokenAmount.multipliedBy(100 - feeOfToBlockchain).dividedBy(100);
  }

  public createTrade(
    trade: CrossChainRoutingTrade,
    options: TransactionOptions = {}
  ): Observable<TransactionReceipt> {
    return from(
      (async () => {
        this.providerConnectorService.checkSettings(trade.fromBlockchain);

        const web3PublicFromBlockchain: Web3Public = this.web3PublicService[trade.fromBlockchain];
        const walletAddress = this.providerConnectorService.address;

        const slippageTolerance = this.settings.slippageTolerance / 100;
        const tokenInAmountMax = trade.tokenInAmount.multipliedBy(1 + slippageTolerance);
        await web3PublicFromBlockchain.checkBalance(trade.tokenIn, tokenInAmountMax, walletAddress);

        const contractAddress = this.contractAddresses[trade.fromBlockchain];
        const web3PublicToBlockchain: Web3Public = this.web3PublicService[trade.toBlockchain];
        const toBlockchainInContract = this.toBlockchainsInContract[trade.toBlockchain];

        const blockchainCryptoFee = (await web3PublicFromBlockchain.callContractMethod(
          contractAddress,
          this.contractAbi,
          'blockchainCryptoFee',
          {
            methodArguments: [toBlockchainInContract]
          }
        )) as string;

        const isFromTokenNative = web3PublicFromBlockchain.isNativeAddress(trade.tokenIn.address);
        const methodName = isFromTokenNative
          ? CROSS_CHAIN_ROUTING_SWAP_METHOD.SWAP_CRYPTO
          : CROSS_CHAIN_ROUTING_SWAP_METHOD.SWAP_TOKENS;

        const tokenInAmountAbsolute = Web3Public.toWei(tokenInAmountMax, trade.tokenIn.decimals);
        const tokenOutMinAbsolute = Web3Public.toWei(
          trade.tokenOutAmount.multipliedBy(1 - slippageTolerance),
          trade.tokenOut.decimals
        );
        const methodArguments = [
          [
            toBlockchainInContract,
            tokenInAmountAbsolute,
            trade.firstPath,
            trade.secondPath,
            trade.rbcTokenOutAmountAbsolute,
            tokenOutMinAbsolute,
            walletAddress,
            web3PublicToBlockchain.isNativeAddress(trade.tokenOut.address)
          ]
        ];

        const value = new BigNumber(blockchainCryptoFee)
          .plus(isFromTokenNative ? tokenInAmountAbsolute : 0)
          .toFixed(0);

        return this.web3PrivateService.executeContractMethod(
          contractAddress,
          this.contractAbi,
          methodName,
          methodArguments,
          {
            ...options,
            value
          }
        );
      })()
    );
  }
}
