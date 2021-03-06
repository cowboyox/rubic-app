import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Web3PrivateService } from '../../services/blockchain/web3-private-service/web3-private.service';
import { Web3PublicService } from '../../services/blockchain/web3-public-service/web3-public.service';
import { BLOCKCHAIN_NAME } from '../../services/blockchain/types/Blockchain';

@Component({
  selector: 'app-address-input',
  templateUrl: './address-input.component.html',
  styleUrls: ['./address-input.component.scss']
})
export class AddressInputComponent implements OnInit {
  @Input() inputLabelText: string;

  @Output() addressEmitter = new EventEmitter<string>();

  public isAddressCorrect: boolean;
  public isAddressIncorrect: boolean;

  constructor(private web3: Web3PublicService) {}

  ngOnInit() {}

  public checkAddressCorrectness(addressQuery: string) {
    if (!addressQuery) {
      this.isAddressIncorrect = this.isAddressCorrect = false;
    } else {
      this.isAddressCorrect = this.web3[BLOCKCHAIN_NAME.ETHEREUM].isAddressCorrect(addressQuery);
      this.isAddressIncorrect = !this.isAddressCorrect;

      if (this.isAddressCorrect) {
        this.addressEmitter.emit(addressQuery);
      }
    }
  }
}
