import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { INSTANT_TRADE_STATUS } from '@features/instant-trade/models/instant-trades-trade-status';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { InstantTradeProviderData } from '@features/instant-trade/models/providers-controller-data';
import { instantTradesLabels } from '@shared/constants/instant-trade/instant-trades-labels';

const defaultState: InstantTradeProviderData = {
  trade: null,
  tradeState: INSTANT_TRADE_STATUS.CALCULATION,
  providerInfo: null,
  isSelected: false,
  needApprove: null
};

function getDefaultStateByProviders(
  providers: INSTANT_TRADE_PROVIDER[]
): InstantTradeProviderData[] {
  return providers.map(provider => ({
    ...defaultState,
    providerInfo: {
      label: instantTradesLabels[provider],
      name: provider
    }
  }));
}

export const INSTANT_TRADE_PROVIDERS: Partial<Record<BLOCKCHAIN_NAME, InstantTradeProviderData[]>> =
  {
    [BLOCKCHAIN_NAME.ETHEREUM]: getDefaultStateByProviders([
      INSTANT_TRADE_PROVIDER.UNISWAP_V3,
      INSTANT_TRADE_PROVIDER.ONEINCH,
      INSTANT_TRADE_PROVIDER.UNISWAP_V2,
      INSTANT_TRADE_PROVIDER.SUSHISWAP,
      INSTANT_TRADE_PROVIDER.ZRX
    ]),
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: getDefaultStateByProviders([
      INSTANT_TRADE_PROVIDER.ONEINCH,
      INSTANT_TRADE_PROVIDER.PANCAKESWAP,
      INSTANT_TRADE_PROVIDER.SUSHISWAP
    ]),
    [BLOCKCHAIN_NAME.POLYGON]: getDefaultStateByProviders([
      INSTANT_TRADE_PROVIDER.UNISWAP_V3,
      INSTANT_TRADE_PROVIDER.ALGEBRA,
      INSTANT_TRADE_PROVIDER.ONEINCH,
      INSTANT_TRADE_PROVIDER.QUICKSWAP,
      INSTANT_TRADE_PROVIDER.SUSHISWAP
    ]),
    [BLOCKCHAIN_NAME.HARMONY]: getDefaultStateByProviders([
      INSTANT_TRADE_PROVIDER.SUSHISWAP,
      INSTANT_TRADE_PROVIDER.VIPER
    ]),
    [BLOCKCHAIN_NAME.AVALANCHE]: getDefaultStateByProviders([
      INSTANT_TRADE_PROVIDER.SUSHISWAP,
      INSTANT_TRADE_PROVIDER.PANGOLIN,
      INSTANT_TRADE_PROVIDER.JOE
    ]),
    [BLOCKCHAIN_NAME.MOONRIVER]: getDefaultStateByProviders([
      INSTANT_TRADE_PROVIDER.SUSHISWAP,
      INSTANT_TRADE_PROVIDER.SOLARBEAM
    ]),
    [BLOCKCHAIN_NAME.FANTOM]: getDefaultStateByProviders([
      INSTANT_TRADE_PROVIDER.SPOOKYSWAP,
      INSTANT_TRADE_PROVIDER.SPIRITSWAP,
      INSTANT_TRADE_PROVIDER.SUSHISWAP
    ]),
    [BLOCKCHAIN_NAME.ARBITRUM]: getDefaultStateByProviders([
      INSTANT_TRADE_PROVIDER.ONEINCH,
      INSTANT_TRADE_PROVIDER.SUSHISWAP,
      INSTANT_TRADE_PROVIDER.UNISWAP_V3
    ]),
    [BLOCKCHAIN_NAME.AURORA]: getDefaultStateByProviders([
      INSTANT_TRADE_PROVIDER.TRISOLARIS,
      INSTANT_TRADE_PROVIDER.WANNASWAP
    ]),
    [BLOCKCHAIN_NAME.SOLANA]: getDefaultStateByProviders([INSTANT_TRADE_PROVIDER.RAYDIUM]),
    [BLOCKCHAIN_NAME.NEAR]: getDefaultStateByProviders([INSTANT_TRADE_PROVIDER.REF])
  };
