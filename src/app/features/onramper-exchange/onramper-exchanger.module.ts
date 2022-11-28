import { NgModule } from '@angular/core';
import { OnramperExchangerRoutingModule } from '@features/onramper-exchange/onramper-exchanger-routing.module';
import { OnramperExchangerComponent } from './components/onramper-exchanger/onramper-exchanger.component';
import { SwapsModule } from '@features/swaps/swaps.module';
import { SharedModule } from '@shared/shared.module';
import { SwapsSharedModule } from '@features/swaps/shared/swaps-shared.module';
import { SwapButtonContainerModule } from '@features/swaps/shared/components/swap-button-container/swap-button-container.module';
import { ExchangerFormComponent } from './components/onramper-exchanger/components/exchanger-form/exchanger-form.component';
import { OnramperWidgetComponent } from './components/onramper-exchanger/components/onramper-widget/onramper-widget.component';

@NgModule({
  declarations: [OnramperExchangerComponent, ExchangerFormComponent, OnramperWidgetComponent],
  exports: [],
  imports: [
    OnramperExchangerRoutingModule,
    SwapsModule,
    SharedModule,
    SwapsSharedModule,
    SwapButtonContainerModule
  ]
})
export class OnramperExchangerModule {}
