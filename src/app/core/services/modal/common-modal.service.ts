import { Inject, Injectable } from '@angular/core';
import { RecentCrosschainTxComponent } from '@app/core/recent-trades/components/recent-crosschain-tx/recent-crosschain-tx.component';
import { TuiDialogService, TuiDialogSize } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { Observable } from 'rxjs';
import { LimitOrdersComponent } from '@core/limit-orders/components/limit-orders/limit-orders.component';

interface ModalConfig<T = unknown> {
  size: TuiDialogSize;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class CommonModalService {
  constructor(@Inject(TuiDialogService) private readonly dialogService: TuiDialogService) {}

  public openRecentTradesModal(config: ModalConfig): Observable<unknown> {
    return this.dialogService.open(new PolymorpheusComponent(RecentCrosschainTxComponent), {
      size: config.size
    });
  }

  public openLimitOrdersModal(config: ModalConfig): Observable<unknown> {
    return this.dialogService.open(new PolymorpheusComponent(LimitOrdersComponent), {
      size: config.size
    });
  }
}
