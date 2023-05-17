import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME, Web3Pure, Injector, EvmWeb3Public } from 'rubic-sdk';
import { BehaviorSubject, combineLatest, from, Observable, switchMap, tap } from 'rxjs';
import BigNumber from 'bignumber.js';
import { map } from 'rxjs/operators';
import { CoingeckoApiService } from '@core/services/external-api/coingecko-api/coingecko-api.service';
import { STAKING_ROUND_THREE } from '../constants/STAKING_ROUND_THREE';
import { RBC_CONTRACT_ABI } from '@features/earn/constants/RBC_CONTRACT_ABI';

@Injectable()
export class StatisticsService {
  private readonly _updateStatistics$ = new BehaviorSubject<void>(null);

  public readonly updateStatistics$ = this._updateStatistics$.asObservable();

  private readonly _lockedRBC$ = new BehaviorSubject<BigNumber>(new BigNumber(NaN));

  public readonly lockedRBC$ = this._lockedRBC$.asObservable();

  public readonly lockedRBCInDollars$ = this.updateStatistics$.pipe(
    switchMap(() =>
      combineLatest([this.lockedRBC$, this.getRBCPrice()]).pipe(
        map(([lockedRbcAmount, rbcPrice]) => lockedRbcAmount.multipliedBy(rbcPrice))
      )
    )
  );

  private readonly _totalSupply$ = new BehaviorSubject<BigNumber>(new BigNumber(NaN));

  private readonly supply = new BigNumber(124_000_000);

  // @TODO: remove after implementation of apr calculations on BE
  private readonly currentActiveTokens = 16841697.321;

  private readonly numberOfSecondsPerWeek = 604_800;

  private readonly numberOfSecondsPerYear = 31_104_000;

  private readonly numberOfWeekPerYear = 52;

  private readonly reward_multiplier = new BigNumber(10_000_000);

  public currentStakingApr = new BigNumber(0);

  private readonly _rewardPerSecond$ = new BehaviorSubject<BigNumber>(new BigNumber(NaN));

  public readonly rewardPerSecond$ = this._rewardPerSecond$.asObservable();

  public readonly rewardPerWeek$ = this.rewardPerSecond$.pipe(
    tap(rewardPerWeek => rewardPerWeek.multipliedBy(this.numberOfSecondsPerWeek))
  );

  public readonly apr$ = this.updateStatistics$.pipe(
    switchMap(() =>
      combineLatest([this.lockedRBCInDollars$, this.getETHPrice(), this.rewardPerSecond$]).pipe(
        map(([lockedRbcInDollars, ethPrice, rewardPerSecond]) => {
          const rewardPerYear = rewardPerSecond.multipliedBy(this.numberOfSecondsPerYear);
          const lockedRBCinETH = lockedRbcInDollars.dividedBy(ethPrice);
          const apr = rewardPerYear.dividedBy(lockedRBCinETH).multipliedBy(100);
          this.currentStakingApr = apr;
          return apr;
        })
      )
    )
  );

  public readonly circRBCLocked$ = this.updateStatistics$.pipe(
    switchMap(() =>
      this.lockedRBC$.pipe(
        map(lockedRBCAmount => lockedRBCAmount.dividedBy(this.supply).multipliedBy(100))
      )
    )
  );

  constructor(private readonly coingeckoApiService: CoingeckoApiService) {}

  private static get blockchainAdapter(): EvmWeb3Public {
    return Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN);
  }

  public getTotalSupply(): Observable<BigNumber> {
    return from(
      StatisticsService.blockchainAdapter.callContractMethod<string>(
        '0x3330bfb7332ca23cd071631837dc289b09c33333',
        RBC_CONTRACT_ABI,
        'totalSupply'
      )
    ).pipe(
      map(value => {
        this._totalSupply$.next(Web3Pure.fromWei(value));
        return Web3Pure.fromWei(value);
      })
    );
  }

  public getRewardPerSecond(): void {
    from(
      StatisticsService.blockchainAdapter.callContractMethod<string>(
        STAKING_ROUND_THREE.NFT.address,
        STAKING_ROUND_THREE.NFT.abi,
        'rewardRate'
      )
    ).subscribe((value: string) => {
      this._rewardPerSecond$.next(Web3Pure.fromWei(value));
    });
  }

  public getLockedRBC(): void {
    from(
      StatisticsService.blockchainAdapter.callContractMethod<string>(
        STAKING_ROUND_THREE.TOKEN.address,
        STAKING_ROUND_THREE.TOKEN.abi,
        'balanceOf',
        [STAKING_ROUND_THREE.NFT.address]
      )
    ).subscribe((value: string) => {
      this._lockedRBC$.next(Web3Pure.fromWei(value));
    });
  }

  public getRBCPrice(): Observable<number> {
    return this.coingeckoApiService.getCommonTokenPrice(
      BLOCKCHAIN_NAME.ETHEREUM,
      '0x3330bfb7332ca23cd071631837dc289b09c33333'
    );
  }

  public getETHPrice(): Observable<number> {
    return this.coingeckoApiService.getNativeCoinPrice(BLOCKCHAIN_NAME.ETHEREUM);
  }

  public updateStatistics(): void {
    this._updateStatistics$.next();
  }
}
