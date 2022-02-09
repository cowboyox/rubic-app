import { INSTANT_TRADES_PROVIDERS } from '@shared//models/instant-trade/instant-trade-providers';

export const INSTANT_TRADES_PRESWAP_TEXT: Record<INSTANT_TRADES_PROVIDERS, string> = {
  [INSTANT_TRADES_PROVIDERS.ONEINCH]: 'Approve',
  [INSTANT_TRADES_PROVIDERS.UNISWAP_V2]: 'Approve',
  [INSTANT_TRADES_PROVIDERS.UNISWAP_V3]: 'Approve',
  [INSTANT_TRADES_PROVIDERS.PANCAKESWAP]: 'Approve',
  [INSTANT_TRADES_PROVIDERS.QUICKSWAP]: 'Approve',
  [INSTANT_TRADES_PROVIDERS.SUSHISWAP]: 'Approve',
  [INSTANT_TRADES_PROVIDERS.ZRX]: 'Approve',
  [INSTANT_TRADES_PROVIDERS.PANGOLIN]: 'Approve',
  [INSTANT_TRADES_PROVIDERS.JOE]: 'Approve',
  [INSTANT_TRADES_PROVIDERS.SOLARBEAM]: 'Approve',
  [INSTANT_TRADES_PROVIDERS.SPOOKYSWAP]: 'Approve',
  [INSTANT_TRADES_PROVIDERS.SPIRITSWAP]: 'Approve',
  [INSTANT_TRADES_PROVIDERS.WRAPPED]: 'Approve',
  [INSTANT_TRADES_PROVIDERS.RAYDIUM]: 'Approve',
  [INSTANT_TRADES_PROVIDERS.ALGEBRA]: 'Approve',
  [INSTANT_TRADES_PROVIDERS.VIPER]: 'Approve',
  [INSTANT_TRADES_PROVIDERS.REF]: 'Deposit',
  [INSTANT_TRADES_PROVIDERS.TRISOLARIS]: 'Approve',
  [INSTANT_TRADES_PROVIDERS.WANNASWAP]: 'Approve'
};
