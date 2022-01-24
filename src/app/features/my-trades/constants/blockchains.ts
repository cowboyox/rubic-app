import {
  BLOCKCHAIN_NAME,
  DEPRECATED_BLOCKCHAIN_NAME
} from '@shared/models/blockchain/blockchain-name';

interface Blockchain {
  key: BLOCKCHAIN_NAME | DEPRECATED_BLOCKCHAIN_NAME;
  name: string;
  img: string;
}

type Blockchains = {
  [BLOCKCHAIN_NAME.ETHEREUM]: Blockchain;
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: Blockchain;
  [BLOCKCHAIN_NAME.POLYGON]: Blockchain;
  [BLOCKCHAIN_NAME.HARMONY]: Blockchain;
  [BLOCKCHAIN_NAME.XDAI]: Blockchain;
  [BLOCKCHAIN_NAME.AVALANCHE]: Blockchain;
  [BLOCKCHAIN_NAME.MOONRIVER]: Blockchain;
  [BLOCKCHAIN_NAME.FANTOM]: Blockchain;
  [BLOCKCHAIN_NAME.ETHEREUM_TESTNET]: Blockchain;
  [BLOCKCHAIN_NAME.AVALANCHE_TESTNET]: Blockchain;
  [BLOCKCHAIN_NAME.SOLANA]: Blockchain;
  [BLOCKCHAIN_NAME.NEAR]: Blockchain;
};

type DeprecatedBlockchains = {
  [DEPRECATED_BLOCKCHAIN_NAME.TRON]: Blockchain;
};

const imageBaseSrc = 'assets/images/icons/coins/';

export const DEPRECATED_BLOCKCHAINS: DeprecatedBlockchains = {
  [DEPRECATED_BLOCKCHAIN_NAME.TRON]: {
    key: DEPRECATED_BLOCKCHAIN_NAME.TRON,
    name: 'Tron',
    img: `${imageBaseSrc}tron.svg`
  }
};

export const BLOCKCHAINS: Blockchains = {
  [BLOCKCHAIN_NAME.ETHEREUM]: {
    key: BLOCKCHAIN_NAME.ETHEREUM,
    name: 'Ethereum',
    img: `${imageBaseSrc}eth.png`
  },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
    key: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    name: 'Binance Smart Chain',
    img: `${imageBaseSrc}bnb.svg`
  },
  [BLOCKCHAIN_NAME.POLYGON]: {
    key: BLOCKCHAIN_NAME.POLYGON,
    name: 'Polygon',
    img: `${imageBaseSrc}polygon.svg`
  },
  [BLOCKCHAIN_NAME.HARMONY]: {
    key: BLOCKCHAIN_NAME.HARMONY,
    name: 'Harmony',
    img: `${imageBaseSrc}harmony.svg`
  },
  [BLOCKCHAIN_NAME.MOONRIVER]: {
    key: BLOCKCHAIN_NAME.MOONRIVER,
    name: 'Moonriver',
    img: `${imageBaseSrc}moonriver.webp`
  },
  [BLOCKCHAIN_NAME.XDAI]: {
    key: BLOCKCHAIN_NAME.XDAI,
    name: 'XDAI',
    img: `${imageBaseSrc}xdai.svg`
  },
  [BLOCKCHAIN_NAME.AVALANCHE]: {
    key: BLOCKCHAIN_NAME.AVALANCHE,
    name: 'Avalanche',
    img: `${imageBaseSrc}avalanche.svg`
  },
  [BLOCKCHAIN_NAME.FANTOM]: {
    key: BLOCKCHAIN_NAME.FANTOM,
    name: 'Fantom',
    img: `${imageBaseSrc}fantom.svg`
  },
  [BLOCKCHAIN_NAME.ETHEREUM_TESTNET]: {
    key: BLOCKCHAIN_NAME.ETHEREUM_TESTNET,
    name: 'Kovan',
    img: `${imageBaseSrc}kovan.png`
  },
  [BLOCKCHAIN_NAME.AVALANCHE_TESTNET]: {
    key: BLOCKCHAIN_NAME.AVALANCHE_TESTNET,
    name: 'Avalanche',
    img: `${imageBaseSrc}avalanche-testnet.svg`
  },
  [BLOCKCHAIN_NAME.SOLANA]: {
    key: BLOCKCHAIN_NAME.SOLANA,
    name: 'Solana',
    img: `${imageBaseSrc}solana.svg`
  },
  [BLOCKCHAIN_NAME.NEAR]: {
    key: BLOCKCHAIN_NAME.NEAR,
    name: 'Near',
    img: `${imageBaseSrc}near.svg`
  }
};
