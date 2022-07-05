import { BLOCKCHAIN_NAME } from 'rubic-sdk';

export const STAKE_LIMIT_MAX = {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 100000,
  [BLOCKCHAIN_NAME.ETHEREUM]: 100100,
  [BLOCKCHAIN_NAME.POLYGON]: 100100
};

export const STAKE_LIMIT_MIN = {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 1000,
  [BLOCKCHAIN_NAME.ETHEREUM]: 1100,
  [BLOCKCHAIN_NAME.POLYGON]: 1100
};

export const STAKE_LIMIT_MAX_WHITELIST = {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 5000,
  [BLOCKCHAIN_NAME.ETHEREUM]: 5100,
  [BLOCKCHAIN_NAME.POLYGON]: 5100
};

export const STAKE_LIMIT_MIN_WHITELIST = {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 1000,
  [BLOCKCHAIN_NAME.ETHEREUM]: 1100,
  [BLOCKCHAIN_NAME.POLYGON]: 1100
};
