import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SwapAndEarnStateService } from '@features/swap-and-earn/services/swap-and-earn-state.service';

@Component({
  selector: 'app-swap-and-earn-page',
  templateUrl: './swap-and-earn-page.component.html',
  styleUrls: ['./swap-and-earn-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapAndEarnPageComponent {
  public readonly workingStatus$ = this.swapAndEarnStateService.workingStatus$;

  public readonly points$ = this.swapAndEarnStateService.points$;

  constructor(private readonly swapAndEarnStateService: SwapAndEarnStateService) {}

  public handleWithdraw(): void {
    alert('You will withdraw your points');
  }
}
