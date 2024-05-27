import { BadgeInfo } from '@features/trade/models/trade-state';
import {
  BLOCKCHAIN_NAME,
  BRIDGE_TYPE,
  CrossChainTrade,
  CrossChainTradeType,
  ON_CHAIN_TRADE_TYPE,
  OnChainTrade,
  OnChainTradeType
} from 'rubic-sdk';

function showNoSlippageLabelArbitrumBridge(trade: CrossChainTrade | OnChainTrade): boolean {
  return trade.from.symbol.toLowerCase() === 'rbc' && trade.to.symbol.toLowerCase() === 'rbc';
}

function showAttentionLabelArbitrumBridge(trade: CrossChainTrade | OnChainTrade): boolean {
  return (
    trade.from.blockchain === BLOCKCHAIN_NAME.ARBITRUM &&
    trade.to.blockchain === BLOCKCHAIN_NAME.ETHEREUM
  );
}

function showXyBlastPromoLabel(trade: CrossChainTrade): boolean {
  return trade.to.blockchain === BLOCKCHAIN_NAME.BLAST && trade.bridgeType === 'ypool';
}

function showBlastGoldPromoLabel(trade: CrossChainTrade): boolean {
  return (
    trade.to.blockchain === BLOCKCHAIN_NAME.BLAST &&
    trade.feeInfo?.rubicProxy?.fixedFee?.amount.gt(0)
  );
}

const POSITIVE_COLOR =
  'linear-gradient(90deg, rgba(0, 255, 117, 0.6) 0%, rgba(224, 255, 32, 0.6) 99.18%)';
const WARNING_COLOR =
  'linear-gradient(90deg, rgba(204, 141, 23, 0.83) 0%, rgba(213, 185, 5, 0.94) 99.18%)';
const INFO_COLOR = 'linear-gradient(to bottom, #49c0f0 0%,#2cafe3 100%)';
const GOLD_COLOR = 'linear-gradient(90deg, rgb(211 191 19) 0%, rgb(251 155 36 / 71%) 99.18%)';

export const SYMBIOSIS_REWARD_PRICE: { [key: string]: string } = {
  '1.2': '$50',
  '1.5': '$250',
  '2.5': '$1000',
  '5': '$2.500',
  '6.5': '$10.000'
};

const blastGoldPromoInfo = {
  label: '+Gold',
  hint: 'You will recieve Blast Gold from Rubic team for this transaction!',
  bgColor: GOLD_COLOR,
  fromSdk: false,
  showLabel: showBlastGoldPromoLabel
};

export const SPECIFIC_BADGES: Partial<Record<CrossChainTradeType | OnChainTradeType, BadgeInfo[]>> =
  {
    // CROSS-CHAIN
    [BRIDGE_TYPE.SYMBIOSIS]: [
      {
        label: '+ 1.3 MNT *',
        hint: 'Swap $100+ & get up to 1.3 $MNT!',
        href: 'https://twitter.com/symbiosis_fi/status/1785996599564382501',
        fromSdk: true,
        showLabel: () => true
      },
      blastGoldPromoInfo
    ],
    [BRIDGE_TYPE.XY]: [
      {
        label: 'Get Blast Points!',
        href: 'https://twitter.com/xyfinance/status/1788862005736288497',
        bgColor: POSITIVE_COLOR,
        fromSdk: false,
        showLabel: showXyBlastPromoLabel
      },
      blastGoldPromoInfo
    ],
    [BRIDGE_TYPE.MESON]: [
      {
        label: 'INFO',
        hint: `Meson Provider allows swaps only for amounts with 6 or fewer decimal places. 
      If your transaction amount has more than 6 decimals, only the first 6 digits after the decimal point will be considered during the transaction.
      Example: 0.99999999999 ETH -> 0.999999 ETH`,
        bgColor: INFO_COLOR,
        fromSdk: false,
        showLabel: () => true
      },
      blastGoldPromoInfo
    ],
    [BRIDGE_TYPE.ARBITRUM]: [
      {
        label: 'NO SLIPPAGE',
        bgColor: POSITIVE_COLOR,
        fromSdk: false,
        showLabel: showNoSlippageLabelArbitrumBridge
      },
      {
        label: 'ATTENTION',
        hint: 'Waiting funds in target chain for 7 days',
        bgColor: WARNING_COLOR,
        fromSdk: false,
        showLabel: showAttentionLabelArbitrumBridge
      }
    ],
    [BRIDGE_TYPE.ORBITER_BRIDGE]: [blastGoldPromoInfo],
    [BRIDGE_TYPE.SQUIDROUTER]: [blastGoldPromoInfo],
    // ON-CHAIN
    [ON_CHAIN_TRADE_TYPE.OPEN_OCEAN]: [blastGoldPromoInfo],
    [ON_CHAIN_TRADE_TYPE.OKU_SWAP]: [blastGoldPromoInfo],
    [ON_CHAIN_TRADE_TYPE.XY_DEX]: [blastGoldPromoInfo],
    [ON_CHAIN_TRADE_TYPE.IZUMI]: [blastGoldPromoInfo],
    [ON_CHAIN_TRADE_TYPE.UNISWAP_V2]: [blastGoldPromoInfo],
    [ON_CHAIN_TRADE_TYPE.FENIX_V3]: [blastGoldPromoInfo]
  };
