import BigNumber from 'bignumber.js';
import { LiquidityPoolInfo } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/pools';
import InstantTradeToken from '@features/instant-trade/models/instant-trade-token';

import { RaydiumTokenAmount } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/raydium-token-amount';
import { Injectable } from '@angular/core';
import { NATIVE_SOL } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/tokens';
import { NATIVE_SOLANA_MINT_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { SwapOutAmount } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/swap-out-amount';
import { RaydiumRouterInfo } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/raydium-router-info';
import { RaydiumStableSwapManager } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/utils/raydium-stable-swap-manager';

@Injectable({
  providedIn: 'root'
})
export class RaydiumRoutingService {
  public static readonly transitTokens = ['USDC', 'RAY', 'SOL', 'WSOL', 'mSOL', 'PAI', 'USDT'];

  private _routerInfo: RaydiumRouterInfo;

  private stableSwapManager: RaydiumStableSwapManager;

  public get routerInfo(): RaydiumRouterInfo {
    return this._routerInfo;
  }

  private set routerInfo(value: RaydiumRouterInfo) {
    this._routerInfo = value;
  }

  private _currentPoolInfo: LiquidityPoolInfo;

  public get currentPoolInfo(): LiquidityPoolInfo {
    return this._currentPoolInfo;
  }

  public set currentPoolInfo(info: LiquidityPoolInfo) {
    this._currentPoolInfo = info;
  }

  constructor() {
    this.stableSwapManager = new RaydiumStableSwapManager();
  }

  public getSwapOutAmount(
    poolInfo: LiquidityPoolInfo,
    fromCoinMint: string,
    toCoinMint: string,
    amount: string,
    slippage: number
  ): SwapOutAmount {
    const { coin, pc, fees } = poolInfo;
    const { swapFeeNumerator, swapFeeDenominator } = fees;
    const coinMint =
      coin.mintAddress === NATIVE_SOL.mintAddress ? NATIVE_SOLANA_MINT_ADDRESS : coin.mintAddress;
    const toMint =
      pc.mintAddress === NATIVE_SOL.mintAddress ? NATIVE_SOLANA_MINT_ADDRESS : pc.mintAddress;

    if (fromCoinMint === coinMint && toCoinMint === toMint) {
      // coin2pc
      const fromAmount = new RaydiumTokenAmount(amount, coin.decimals, false);
      const fromAmountWithFee = fromAmount.wei
        .multipliedBy(swapFeeDenominator - swapFeeNumerator)
        .dividedBy(swapFeeDenominator);

      const denominator = coin.balance.plus(fromAmountWithFee);
      const amountOut = pc.balance.multipliedBy(fromAmountWithFee).dividedBy(denominator);
      const amountOutWithSlippage = amountOut.dividedBy(1 + slippage / 100);

      const outBalance = pc.balance.minus(amountOut);
      const beforePrice = new RaydiumTokenAmount(
        parseFloat(new RaydiumTokenAmount(pc.balance, pc.decimals).fixed()) /
          parseFloat(new RaydiumTokenAmount(coin.balance, coin.decimals).fixed()),
        pc.decimals,
        false
      );
      const afterPrice = new RaydiumTokenAmount(
        parseFloat(new RaydiumTokenAmount(outBalance, pc.decimals).fixed()) /
          parseFloat(new RaydiumTokenAmount(denominator, coin.decimals).fixed()),
        pc.decimals,
        false
      );
      const priceImpact =
        Math.abs(
          (parseFloat(beforePrice.fixed()) - parseFloat(afterPrice.fixed())) /
            parseFloat(beforePrice.fixed())
        ) * 100;

      return {
        amountIn: fromAmount.toWei(),
        amountOut: new RaydiumTokenAmount(amountOut, pc.decimals)
          .toWei()
          .dividedBy(10 ** pc.decimals),
        amountOutWithSlippage: new RaydiumTokenAmount(amountOutWithSlippage, pc.decimals)
          .toWei()
          .dividedBy(10 ** pc.decimals),
        priceImpact
      };
    }
    // pc2coin
    const fromAmount = new RaydiumTokenAmount(amount, pc.decimals, false);
    const fromAmountWithFee = fromAmount.wei
      .multipliedBy(swapFeeDenominator - swapFeeNumerator)
      .dividedBy(swapFeeDenominator);

    const denominator = pc.balance.plus(fromAmountWithFee);
    const amountOut = coin.balance.multipliedBy(fromAmountWithFee).dividedBy(denominator);
    const amountOutWithSlippage = amountOut.dividedBy(1 + slippage / 100);

    const outBalance = coin.balance.minus(amountOut);

    const beforePrice = new RaydiumTokenAmount(
      parseFloat(new RaydiumTokenAmount(pc.balance, pc.decimals).fixed()) /
        parseFloat(new RaydiumTokenAmount(coin.balance, coin.decimals).fixed()),
      pc.decimals,
      false
    );
    const afterPrice = new RaydiumTokenAmount(
      parseFloat(new RaydiumTokenAmount(denominator, pc.decimals).fixed()) /
        parseFloat(new RaydiumTokenAmount(outBalance, coin.decimals).fixed()),
      pc.decimals,
      false
    );
    const priceImpact =
      Math.abs(
        (parseFloat(afterPrice.fixed()) - parseFloat(beforePrice.fixed())) /
          parseFloat(beforePrice.fixed())
      ) * 100;

    return {
      amountIn: fromAmount.toWei(),
      amountOut: new RaydiumTokenAmount(amountOut, coin.decimals)
        .toWei()
        .dividedBy(10 ** coin.decimals),
      amountOutWithSlippage: new RaydiumTokenAmount(amountOutWithSlippage, coin.decimals)
        .toWei()
        .dividedBy(10 ** coin.decimals),
      priceImpact
    };
  }

  private getSwapRouter(
    poolInfos: { [p: string]: LiquidityPoolInfo },
    fromCoinMint: string,
    toCoinMint: string
  ): [LiquidityPoolInfo, LiquidityPoolInfo][] {
    const transitTokensPools = Object.values(
      Object.fromEntries(
        RaydiumRoutingService.transitTokens
          .map(coolToken => {
            const pools = Object.values(poolInfos).filter(pool => {
              const firstTokenAddress = pool.coin.mintAddress;
              const secondTokenAddress = pool.pc.mintAddress;
              return (
                pool.name.includes(coolToken) &&
                (firstTokenAddress === fromCoinMint ||
                  pool.coin.mintAddress === toCoinMint ||
                  secondTokenAddress === fromCoinMint ||
                  pool.pc.mintAddress === toCoinMint)
              );
            });
            return [coolToken, pools];
          })
          .filter(([_, pools]: [string, LiquidityPoolInfo[]]) => {
            const hasPools = pools?.length;
            const isTradeToken = pools.length > 30;

            if (!hasPools || isTradeToken) {
              return false;
            }

            const hasFormToken = pools.find(pool => {
              return [pool.pc.mintAddress, pool.coin.mintAddress].includes(fromCoinMint);
            });

            const hasToToken = pools.find(pool => {
              return [pool.pc.mintAddress, pool.coin.mintAddress].includes(toCoinMint);
            });

            return hasFormToken && hasToToken;
          })
      )
    ).flat() as LiquidityPoolInfo[];

    return transitTokensPools.reduce((acc, curr) => {
      if (curr.coin.mintAddress === fromCoinMint) {
        return [
          ...acc,
          ...transitTokensPools
            .filter(
              p2 =>
                curr.ammId !== p2.ammId &&
                ((p2.pc.mintAddress === curr.pc.mintAddress &&
                  p2.coin.mintAddress === toCoinMint) ||
                  (p2.coin.mintAddress === curr.pc.mintAddress && p2.pc.mintAddress === toCoinMint))
            )
            .map(ap => [curr, ap] as [LiquidityPoolInfo, LiquidityPoolInfo])
        ];
      }
      if (curr.pc.mintAddress === fromCoinMint) {
        return [
          ...acc,
          ...transitTokensPools
            .filter(
              p2 =>
                curr.ammId !== p2.ammId &&
                ((p2.pc.mintAddress === curr.coin.mintAddress &&
                  p2.coin.mintAddress === toCoinMint) ||
                  (p2.coin.mintAddress === curr.coin.mintAddress &&
                    p2.pc.mintAddress === toCoinMint))
            )
            .map(ap => [curr, ap] as [LiquidityPoolInfo, LiquidityPoolInfo])
        ];
      }
      return acc;
    }, [] as [LiquidityPoolInfo, LiquidityPoolInfo][]);
  }

  public calculate(
    poolInfos: { [p: string]: LiquidityPoolInfo },
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    amount: BigNumber,
    slippage: number
  ): RaydiumRouterInfo | null {
    const routesInfo = this.getSwapRouter(poolInfos, fromToken.address, toToken.address);
    if (routesInfo?.length) {
      this.routerInfo = routesInfo.reduce(
        (acc, route) => {
          // First token route
          const middleCoin =
            route[0].coin.mintAddress === fromToken.address ? route[0].pc : route[0].coin;

          const { amountOutWithSlippage: amountOutWithSlippageA } =
            route[0].version === 5
              ? this.stableSwapManager.getSwapOutAmountStable(
                  route[0],
                  fromToken.address,
                  middleCoin.mintAddress,
                  amount.toString(),
                  slippage
                )
              : this.getSwapOutAmount(
                  route[0],
                  fromToken.address,
                  middleCoin.mintAddress,
                  amount.toString(),
                  slippage
                );

          const { amountOut, priceImpact } =
            route[1].version === 5
              ? this.stableSwapManager.getSwapOutAmountStable(
                  route[1],
                  middleCoin.mintAddress,
                  toToken.address,
                  amountOutWithSlippageA.toString(),
                  slippage
                )
              : this.getSwapOutAmount(
                  route[1],
                  middleCoin.mintAddress,
                  toToken.address,
                  amountOutWithSlippageA.toString(),
                  slippage
                );

          if (amountOut.gt(acc.maxAmountOut)) {
            return {
              maxAmountOut: amountOut,
              priceImpact,
              middleCoin: {
                address: middleCoin.mintAddress,
                symbol: middleCoin.symbol
              },
              route: [
                {
                  type: 'amm',
                  id: route[0].ammId,
                  amountA: amount.toNumber(),
                  amountB: amountOutWithSlippageA.toNumber(),
                  mintA: fromToken.address,
                  mintB: middleCoin.mintAddress
                },
                {
                  type: 'amm',
                  id: route[1].ammId,
                  amountA: amountOutWithSlippageA.toNumber(),
                  amountB: amountOut.toNumber(),
                  mintA: middleCoin.mintAddress,
                  mintB: toToken.address
                }
              ]
            } as RaydiumRouterInfo;
          }
          return acc;
        },
        {
          maxAmountOut: new BigNumber(0)
        } as RaydiumRouterInfo
      );
      return this.routerInfo;
    }
    return null;
  }
}
