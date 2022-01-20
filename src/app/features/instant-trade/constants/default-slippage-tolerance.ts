import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';
import { SupportedCrossChainBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';

export const DEFAULT_SLIPPAGE_TOLERANCE: Record<
  SupportedCrossChainBlockchain,
  Partial<Record<INSTANT_TRADES_PROVIDERS, number>>
> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: {
    [INSTANT_TRADES_PROVIDERS.ONEINCH]: 2,
    [INSTANT_TRADES_PROVIDERS.UNISWAP_V2]: 2,
    [INSTANT_TRADES_PROVIDERS.UNISWAP_V3]: 2,
    [INSTANT_TRADES_PROVIDERS.SUSHISWAP]: 2,
    [INSTANT_TRADES_PROVIDERS.ZRX]: 2
  },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
    [INSTANT_TRADES_PROVIDERS.ONEINCH]: 2,
    [INSTANT_TRADES_PROVIDERS.PANCAKESWAP]: 2,
    [INSTANT_TRADES_PROVIDERS.SUSHISWAP]: 2
  },
  [BLOCKCHAIN_NAME.POLYGON]: {
    [INSTANT_TRADES_PROVIDERS.ONEINCH]: 2,
    [INSTANT_TRADES_PROVIDERS.QUICKSWAP]: 2,
    [INSTANT_TRADES_PROVIDERS.SUSHISWAP]: 2,
    [INSTANT_TRADES_PROVIDERS.ALGEBRA]: 2
  },
  [BLOCKCHAIN_NAME.HARMONY]: {
    [INSTANT_TRADES_PROVIDERS.ONEINCH]: 2,
    [INSTANT_TRADES_PROVIDERS.QUICKSWAP]: 2,
    [INSTANT_TRADES_PROVIDERS.SUSHISWAP]: 2
  },
  [BLOCKCHAIN_NAME.AVALANCHE]: {
    [INSTANT_TRADES_PROVIDERS.SUSHISWAP]: 2,
    [INSTANT_TRADES_PROVIDERS.PANGOLIN]: 2,
    [INSTANT_TRADES_PROVIDERS.JOE]: 2
  },
  [BLOCKCHAIN_NAME.MOONRIVER]: {
    [INSTANT_TRADES_PROVIDERS.SOLARBEAM]: 2,
    [INSTANT_TRADES_PROVIDERS.SUSHISWAP]: 2
  },
  [BLOCKCHAIN_NAME.FANTOM]: {
    [INSTANT_TRADES_PROVIDERS.SUSHISWAP]: 2,
    [INSTANT_TRADES_PROVIDERS.SPOOKYSWAP]: 2,
    [INSTANT_TRADES_PROVIDERS.SPIRITSWAP]: 2
  },
  [BLOCKCHAIN_NAME.SOLANA]: {
    [INSTANT_TRADES_PROVIDERS.RAYDIUM]: 2
  },
  [BLOCKCHAIN_NAME.NEAR]: {
    [INSTANT_TRADES_PROVIDERS.REF]: 2
  }
};
