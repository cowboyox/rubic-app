import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import BigNumber from 'bignumber.js';
import { FormService } from 'src/app/shared/models/swaps/FormService';
import { CryptoTapForm } from 'src/app/features/crypto-tap/models/CryptoTapForm';

@Injectable()
export class CryptoTapFormService implements FormService {
  public commonTrade: FormGroup<CryptoTapForm>;

  constructor() {
    this.commonTrade = new FormGroup<CryptoTapForm>({
      input: new FormGroup({
        fromBlockchain: new FormControl<BLOCKCHAIN_NAME>(BLOCKCHAIN_NAME.ETHEREUM),
        toBlockchain: new FormControl<BLOCKCHAIN_NAME>(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN),
        fromToken: new FormControl<TokenAmount>(),
        toToken: new FormControl<TokenAmount>()
      }),
      output: new FormGroup({
        toAmount: new FormControl<BigNumber>(new BigNumber(0)),
        fee: new FormControl<BigNumber>(),
        fromAmount: new FormControl<BigNumber>(new BigNumber(0))
      })
    });
  }
}
