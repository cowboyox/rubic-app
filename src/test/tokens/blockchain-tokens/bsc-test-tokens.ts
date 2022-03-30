import { TokenAmount } from '@shared/models/tokens/token-amount';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { TOKEN_RANK } from '@shared/models/tokens/token-rank';
import BigNumber from 'bignumber.js';

const BNB: TokenAmount = {
  name: 'Binance Coin',
  symbol: 'BNB',
  blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  address: NATIVE_TOKEN_ADDRESS,
  decimals: 18,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: TOKEN_RANK.HIGH,
  price: 1,
  usedInIframe: true,
  amount: new BigNumber(0),
  favorite: true
};

const USDT: TokenAmount = {
  name: 'Tether USD',
  symbol: 'TUSD',
  blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  address: '0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684',
  decimals: 18,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: TOKEN_RANK.LOW,
  price: 1,
  usedInIframe: true,
  amount: new BigNumber(0),
  favorite: true
};

const ETH: TokenAmount = {
  name: 'Ethereum Tokens',
  symbol: 'ETH',
  blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  address: '0x8babbb98678facc7342735486c851abd7a0d17ca',
  decimals: 18,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: TOKEN_RANK.LOW,
  price: 1,
  usedInIframe: true,
  amount: new BigNumber(0),
  favorite: true
};

export const BRBC: TokenAmount = {
  name: 'Wrapped Rubic',
  symbol: 'BRBC',
  blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  address: '0xd51bd30a91f88dcf72acd45c8a1e7ae0066263e8',
  decimals: 18,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: TOKEN_RANK.LOW,
  price: 2,
  usedInIframe: true,
  amount: new BigNumber(0),
  favorite: true
};

export const FAKE_BRBC: TokenAmount = {
  name: 'Fake Rubic',
  symbol: 'BRBC',
  blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  address: '0x8e3bcc334657560253b83f08331d85267316e08a',
  decimals: 18,
  image: 'https://dev-api.rubic.exchange/media/token_images/cg_logo_CHOP_Porkchop.png',
  rank: TOKEN_RANK.LOW,
  price: 0.2,
  usedInIframe: true,
  amount: new BigNumber(0),
  favorite: true
};

export const BSC_TEST_TOKENS = [BNB, USDT, ETH, BRBC, FAKE_BRBC];
