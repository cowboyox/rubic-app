import { BLOCKCHAIN_NAME, LimitOrderSupportedBlockchain } from 'rubic-sdk';

export const spotPriceContractAddress: Record<
  Exclude<
    LimitOrderSupportedBlockchain,
    typeof BLOCKCHAIN_NAME.FANTOM | typeof BLOCKCHAIN_NAME.AURORA
  >,
  string
> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: '0x07D91f5fb9Bf7798734C3f606dB065549F6893bb',
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xfbD61B037C325b959c0F6A7e69D8f37770C2c550',
  [BLOCKCHAIN_NAME.POLYGON]: '0x7F069df72b7A39bCE9806e3AfaF579E54D8CF2b9',
  [BLOCKCHAIN_NAME.OPTIMISM]: '0x11DEE30E710B8d4a8630392781Cc3c0046365d4c',
  [BLOCKCHAIN_NAME.ARBITRUM]: '0x735247fb0a604c0adC6cab38ACE16D0DbA31295F',
  [BLOCKCHAIN_NAME.GNOSIS]: '0x142DB045195CEcaBe415161e1dF1CF0337A4d02E',
  [BLOCKCHAIN_NAME.AVALANCHE]: '0xBd0c7AaF0bF082712EbE919a9dD94b2d978f79A9'
};
