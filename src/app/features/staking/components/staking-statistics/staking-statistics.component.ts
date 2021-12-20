import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { StakingService } from '@features/staking/services/staking.service';

@Component({
  selector: 'app-staking-statistics',
  templateUrl: './staking-statistics.component.html',
  styleUrls: ['./staking-statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingStatisticsComponent implements OnInit {
  public readonly loading$ = this.stakingService.dataReloading$;

  public readonly stakingTokenBalance$ = this.stakingService.stakingTokenBalance$;

  public readonly apr$ = this.stakingService.apr$;

  public readonly amountWithRewards$ = this.stakingService.amountWithRewards$;

  public readonly earnedRewards$ = this.stakingService.earnedRewards$;

  constructor(private readonly stakingService: StakingService) {}

  public ngOnInit(): void {
    // TODO: refactor
    this.stakingService.needLogin$.subscribe(needLogin => {
      if (!needLogin) {
        this.stakingService.getStakingTokenBalance();
      }
    });
  }

  // public reloadStakingStatistics(): void {}
}
