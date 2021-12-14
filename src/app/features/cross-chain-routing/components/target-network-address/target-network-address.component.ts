import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { AbstractControl, FormControl, ValidatorFn } from '@ngneat/reactive-forms';
import { Validators } from '@angular/forms';
import { SolanaWeb3Public } from '@core/services/blockchain/web3/web3-public-service/SolanaWeb3Public';
import { Web3Public } from '@core/services/blockchain/web3/web3-public-service/Web3Public';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/web3/web3-public-service/public-blockchain-adapter.service';
import { ValidationErrors } from '@ngneat/reactive-forms/lib/types';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { StoreService } from '@core/services/store/store.service';

function correctAddressValidator(blockchainAdapter: Web3Public | SolanaWeb3Public): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const isAddressCorrect = blockchainAdapter.isAddressCorrect(control.value);
    return isAddressCorrect ? null : { wrongAddress: control.value };
  };
}

@Component({
  selector: 'app-target-network-address',
  templateUrl: './target-network-address.component.html',
  styleUrls: ['./target-network-address.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TargetNetworkAddressComponent implements AfterViewInit {
  @Input() set targetBlockchain(blockchain: BLOCKCHAIN_NAME) {
    this.address.clearValidators();
    this.address.setValidators(Validators.required);
    this.targetBlockchainName = blockchain;
    const blockchainAdapter = this.blockchainAdapterService[blockchain];
    this.address.setValidators(correctAddressValidator(blockchainAdapter));
  }

  public targetBlockchainName: BLOCKCHAIN_NAME;

  @Output() targetAddress: EventEmitter<{
    address: string;
    isValid: boolean;
  }>;

  public address: FormControl<string>;

  constructor(
    private readonly blockchainAdapterService: PublicBlockchainAdapterService,
    private readonly storeService: StoreService
  ) {
    this.address = new FormControl<string>(null, [Validators.required]);
    this.address.markAsDirty();
    this.targetAddress = new EventEmitter();
    this.address.valueChanges.pipe(debounceTime(10), distinctUntilChanged()).subscribe(() => {
      if (this.address.valid) {
        this.storeService.setItem('targetAddress', {
          address: this.address.value,
          blockchain: this.targetBlockchainName
        });
      }
      this.targetAddress.emit({
        address: this.address.value,
        isValid: this.address.valid
      });
    });
  }

  ngAfterViewInit() {
    const targetAddress = this.storeService.getItem('targetAddress');
    if (targetAddress?.blockchain === this.targetBlockchainName) {
      this.address.patchValue(targetAddress.address);
    }
  }
}
