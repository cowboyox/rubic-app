import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { Inject, Injectable, Injector } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { FormService } from 'src/app/shared/models/swaps/FormService';
import { TokensSelectComponent } from '../components/tokens-select/tokens-select.component';

@Injectable()
export class TokensSelectService {
  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private injector: Injector
  ) {}

  showDialog(
    tokens: Observable<AvailableTokenAmount[]>,
    formType: 'from' | 'to',
    currentBlockchain: BLOCKCHAIN_NAME,
    enabledCustomTokenBlockchain: BLOCKCHAIN_NAME,
    formService: FormService
  ): Observable<TokenAmount> {
    return this.dialogService.open(
      new PolymorpheusComponent(TokensSelectComponent, this.injector),
      {
        size: 's',
        data: {
          tokens,
          currentBlockchain,
          enabledCustomTokenBlockchain,
          formType,
          formService
        }
      }
    );
  }
}
