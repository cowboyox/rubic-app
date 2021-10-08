import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export const MULTICALL_ADDRESSES = {
  [BLOCKCHAIN_NAME.ETHEREUM]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x15dc8b5ed578AA7a019dd0139B330cfD625cA795',
  [BLOCKCHAIN_NAME.POLYGON]: '0x176730799C812d70C6608F51aEa6C7e5cdA7eA50',
  [BLOCKCHAIN_NAME.HARMONY]: '0xdDCbf776dF3dE60163066A5ddDF2277cB445E0F3',
  [BLOCKCHAIN_NAME.AVALANCHE]: '0xdDCbf776dF3dE60163066A5ddDF2277cB445E0F3',

  [BLOCKCHAIN_NAME.ETHEREUM_TESTNET]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696'
};

export const MULTICALL_ADDRESSES_TESTNET = {
  [BLOCKCHAIN_NAME.ETHEREUM]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  [BLOCKCHAIN_NAME.ETHEREUM_TESTNET]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',

  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xA6949B8FBa9DF546b9c66F98CFCa960A96E3b68e',
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET]: '0xA6949B8FBa9DF546b9c66F98CFCa960A96E3b68e',

  [BLOCKCHAIN_NAME.POLYGON]: '0xB69f3A80c4C779E4cBA94797B18f501283A3BB24',
  [BLOCKCHAIN_NAME.POLYGON_TESTNET]: '0xB69f3A80c4C779E4cBA94797B18f501283A3BB24'
};
