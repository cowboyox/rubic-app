import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  AfterContentInit,
  TemplateRef,
  ViewChild,
  Output,
} from '@angular/core';
import { SWAPS_V2 } from '../../contract-form-all/contract-v2-details';
import { Web3Service } from '../../services/web3/web3.service';
import { UserService } from '../../services/user/user.service';
import BigNumber from 'bignumber.js';
import { Router } from '@angular/router';

import { ContractsService } from '../../services/contracts/contracts.service';
import * as moment from 'moment';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatDatepicker,
  MatDialog,
  MatDialogRef,
} from '@angular/material';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';

import { MODE } from '../../app-routing.module';
export const FIX_TIME = new Date(2019, 9, 11, 12, 11).getTime();

export interface IContractDetails {
  base_address?: string;
  quote_address?: string;
  base_limit?: string;
  quote_limit?: string;
  stop_date?: number;
  owner_address?: string;
  permanent?: boolean | false;
  public?: boolean | undefined;
  unique_link?: string;
  unique_link_url?: string;
  eth_contract?: any;

  broker_fee: boolean;
  broker_fee_address: string;
  broker_fee_base: number;
  broker_fee_quote: number;

  tokens_info?: {
    base: {
      token: any;
      amount: string;
    };
    quote: {
      token: any;
      amount: string;
    };
  };

  whitelist?: any;
  whitelist_address?: any;
  min_base_wei?: any;
  memo_contract?: any;
  min_quote_wei?: any;
}
export const MY_FORMATS = {
  useUtc: true,
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'X',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-start-form',
  templateUrl: './start-form.component.html',
  styleUrls: ['./start-form.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class StartFormComponent implements OnInit, OnDestroy, AfterContentInit {
  @ViewChild('metaMaskError') metaMaskError: TemplateRef<any>;
  @Output() BaseTokenCustom = new EventEmitter<any>();
  @Output() QuoteTokenCustom = new EventEmitter<any>();
  @Output() changedSocialState = new EventEmitter<string>();
  public currentUser;
  public cmcRate: {
    change?: number;
    isMessage?: boolean;
    isLower?: boolean;
    direct: number;
    revert: number;
  };
  private CMCRates;
  private metaMaskErrorModal: MatDialogRef<any>;
  constructor(
    private dialog: MatDialog,
    protected contractsService: ContractsService,
    private web3Service: Web3Service,
    protected router: Router,
    private userService: UserService,
  ) {
    this.CMCRates = {};
    this.currentUser = this.userService.getUserModel();
    this.userService.getCurrentUser().subscribe((userProfile: any) => {
      this.currentUser = userProfile;
    });
    this.sendData = {
      contract_type: 20,
      network: 1,
    };
    this.tokensData = {
      base: {
        token: {},
        customToken: false,
      },
      quote: {
        token: {},
        customToken: false,
      },
    };
    this.isAdvSettingsOpen = false;
    this.openedCustomTokens = {
      base: false,
      quote: false,
    };

    this.customTokens = {
      base: {},
      quote: {},
    };

    this.minDate = moment().add(1, 'hour');
    const startDateTime = moment(this.minDate);

    this.datePickerDate = startDateTime.add(1, 'week');
    this.datePickerTime = `${startDateTime.hour()}:${startDateTime.minutes()}`;
    this.isCreatingContract = false;
  }
  private socialFormData: {
    network: string;
    data: any;
  };
  public metamaskError: any;
  public isCreatingContract;
  public socialAuthError;
  public tokensData;
  public isAdvSettingsOpen;

  public minTime;
  public minDate: moment.Moment;

  public datePickerDate;
  public datePickerTime;

  public customTokens;

  public openedCustomTokens: {
    base: boolean;
    quote: boolean;
  };

  public quoteTokenChanger = new EventEmitter<any>();
  public baseTokenChanger = new EventEmitter<any>();

  public requestData: IContractDetails;

  protected sendData;

  public formIsSending: boolean;

  @ViewChild('startForm') public startForm;
  @ViewChild('advSettings') public advSettings;

  public isChangedToken(...args) {
    localStorage.setItem(
      'form_new_values',
      JSON.stringify({ tokens_info: this.tokensData }),
    );
  }
  public checkRate(revert?) {
    if (!(this.tokensData.base.token && this.tokensData.quote.token)) {
      return false;
    }
    const baseCoinAmount = new BigNumber(this.tokensData.base.amount).div(
      Math.pow(10, this.tokensData.base.token.decimals),
    );

    const quoteCoinAmount = new BigNumber(this.tokensData.quote.amount).div(
      Math.pow(10, this.tokensData.quote.token.decimals),
    );

    return !revert
      ? baseCoinAmount.div(quoteCoinAmount).dp(4)
      : quoteCoinAmount.div(baseCoinAmount).dp(4);
  }

  public getRate(revert?): string {
    if (
      !(
        this.requestData.tokens_info.base.amount &&
        this.requestData.tokens_info.quote.amount
      )
    ) {
      return '0';
    }

    const baseCoinAmount = new BigNumber(
      this.requestData.tokens_info.base.amount,
    );
    const quoteCoinAmount = new BigNumber(
      this.requestData.tokens_info.quote.amount,
    );
    return (!revert
      ? baseCoinAmount.div(quoteCoinAmount)
      : quoteCoinAmount.div(baseCoinAmount)
    ).toString();
  }
  public changedToken(token?) {
    const baseCoin = this.requestData.tokens_info.base.token;
    const quoteCoin = this.requestData.tokens_info.quote.token;
    if (
      this.requestData.tokens_info.base.amount &&
      this.requestData.tokens_info.quote.amount &&
      baseCoin.cmc_id &&
      quoteCoin.cmc_id &&
      baseCoin.cmc_id > 0 &&
      quoteCoin.cmc_id > 0
    ) {
      this.cmcRate = {
        revert: new BigNumber(baseCoin.rate).div(quoteCoin.rate).toNumber(),
        direct: new BigNumber(quoteCoin.rate).div(baseCoin.rate).toNumber(),
      };
      const rate = parseFloat(this.getRate(true));
      const rateChanges = parseFloat(this.getRate()) - this.cmcRate.direct;
      this.cmcRate.isMessage = true;
      this.cmcRate.isLower = rateChanges > 0;
      this.cmcRate.change = Math.round(
        Math.abs(-(rate / this.cmcRate.revert - 1)) * 100,
      );
    } else {
      this.cmcRate = undefined;
    }
  }

  public toogleShowCustomToken(type) {
    this.tokensData[type].customToken = !this.tokensData[type].customToken;
  }
  public toogleAdvSettings() {
    this.isAdvSettingsOpen = !this.isAdvSettingsOpen;
  }

  ngOnInit() {
    this.updateAddresses(true);
    const draftData = localStorage.getItem('form_new_values');
    this.requestData = draftData
      ? JSON.parse(draftData)
      : {
          tokens_info: {
            base: {
              token: {},
            },
            quote: {
              token: {},
            },
          },
        };

    this.requestData.public = true;
    this.requestData.permanent = false;

    this.requestData.broker_fee_base = 0.1;
    this.requestData.broker_fee_quote = 0.1;
  }

  ngOnDestroy(): void {
    this.isChangedToken();
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.setFullDateTime();
    });
  }
  public dateChange() {
    if (this.advSettings.value.active_to.isSame(this.minDate, 'day')) {
      this.minTime = `${this.minDate.hour()}:${this.minDate.minutes()}`;
    } else {
      this.minTime = null;
    }
    this.setFullDateTime();
  }
  public timeChange() {
    this.setFullDateTime();
  }

  private setFullDateTime() {
    const times = this.advSettings.value.time.split(':');
    this.advSettings.value.active_to.hour(times[0]);
    this.advSettings.value.active_to.minutes(times[1]);

    if (this.advSettings.value.active_to.isBefore(this.minDate)) {
      this.advSettings.controls.time.setErrors({ incorrect: true });
    } else {
      this.advSettings.controls.time.setErrors(null);
    }
    setTimeout(() => {
      this.requestData.stop_date = this.advSettings.value.active_to.clone();
    });
  }

  get isEthereumSwap() {
    return (
      this.requestData.tokens_info.quote.token.isEthereum &&
      this.requestData.tokens_info.base.token.isEthereum
    );
  }
  public setCustomToken(field, token) {
    this.customTokens[field] = token;
  }
  get baseBrokerFee() {
    if (
      !(
        this.requestData.tokens_info.base.amount &&
        this.requestData.broker_fee_base
      )
    ) {
      return 0;
    }
    return new BigNumber(this.requestData.tokens_info.base.amount)
      .div(100)
      .times(this.requestData.broker_fee_base)
      .toString();
  }

  get quoteBrokerFee() {
    if (
      !(
        this.requestData.tokens_info.quote.amount &&
        this.requestData.broker_fee_quote
      )
    ) {
      return 0;
    }
    return new BigNumber(this.requestData.tokens_info.quote.amount)
      .div(100)
      .times(this.requestData.broker_fee_quote)
      .toString();
  }

  public addCustomToken(name) {
    this.requestData.tokens_info[name].token = { ...this.customTokens[name] };
    switch (name) {
      case 'base':
        this.BaseTokenCustom.emit(this.requestData.tokens_info[name]);
        break;
      case 'quote':
        this.QuoteTokenCustom.emit(this.requestData.tokens_info[name]);
        break;
    }
    this.openedCustomTokens[name] = false;
  }

  public createContract() {
    if (this.metamaskError) {
      this.metaMaskErrorModal = this.dialog.open(this.metaMaskError, {
        width: '480px',
        panelClass: 'custom-dialog-container',
      });
      return;
    }
    this.sendData.stop_date = this.advSettings.value.active_to
      .clone()
      .utc()
      .format('YYYY-MM-DD HH:mm');

    this.sendData.base_limit = this.requestData.tokens_info.base.amount;
    this.sendData.quote_limit = this.requestData.tokens_info.quote.amount;

    this.sendData.name =
      this.requestData.tokens_info.base.token.token_short_name +
      ' <> ' +
      this.requestData.tokens_info.quote.token.token_short_name;

    this.sendData.base_address = this.requestData.tokens_info.base.token.address;
    this.sendData.quote_address = this.requestData.tokens_info.quote.token.address;

    this.sendData.base_coin_id = this.requestData.tokens_info.base.token.mywish_id;
    this.sendData.quote_coin_id = this.requestData.tokens_info.quote.token.mywish_id;

    this.sendData.public = this.requestData.public;
    this.sendData.permanent = this.requestData.permanent;

    this.sendData.notification = false;

    this.sendData.min_quote_wei = this.requestData.min_quote_wei || '0';
    this.sendData.min_base_wei = this.requestData.min_base_wei || '0';

    if (!this.requestData.broker_fee) {
      this.requestData.broker_fee_address = null;
      this.requestData.broker_fee_base = null;
      this.requestData.broker_fee_quote = null;
    } else {
      this.sendData.broker_fee_address = this.requestData.broker_fee_address;
      this.sendData.broker_fee = this.requestData.broker_fee;
      this.sendData.broker_fee_base = this.requestData.broker_fee_base;
      this.sendData.broker_fee_quote = this.requestData.broker_fee_quote;
    }

    if (this.currentUser.is_ghost) {
      this.MetamaskAuth();
    } else {
      this.isCreatingContract = true;
      this.sendContractData(this.sendData);
    }
  }

  private sendMetaMaskRequest(data) {
    this.socialFormData = {
      network: 'mm',
      data,
    };
    this.userService.metaMaskAuth(data).then(
      (result) => {
        this.sendContractData(this.sendData);
      },
      (error) => {
        this.onTotpError(error);
      },
    );
  }
  private onTotpError(error) {
    switch (error.status) {
      case 403:
        this.socialAuthError = error.error.detail;
        switch (error.error.detail) {
          case '1032':
          case '1033':
            this.changedSocialState.emit(error.error.detail);
            break;
        }
        break;
    }
  }

  public MetamaskAuth() {
    if (window['ethereum'] && window['ethereum'].isMetaMask) {
      window['ethereum'].enable().then((accounts) => {
        const address = accounts[0];
        this.userService.getMetaMaskAuthMsg().then((msg) => {
          this.web3Service.getSignedMetaMaskMsg(msg, address).then((signed) => {
            this.sendMetaMaskRequest({
              address,
              msg,
              signed_msg: signed,
            });
          });
        });
      });
    }
  }

  protected sendContractData(data) {
    if (this.formIsSending) {
      return;
    }
    this.formIsSending = true;

    if (window['dataLayer']) {
      window['dataLayer'].push({ event: 'publish' });
    }

    this.contractsService[data.id ? 'updateSWAP3' : 'createSWAP3'](data)
      .then(
        (result) => {
          this.initialisationTrade(result);
        },
        (err) => {
          console.log(err);
        },
      )
      .finally(() => {
        this.formIsSending = false;
      });
  }

  private contractIsCreated(contract) {
    this.router.navigate(['/public-v3/' + contract.unique_link]);
  }

  public initialisationTrade(originalContract) {
    const details = originalContract;

    const interfaceMethod = this.web3Service.getMethodInterface(
      'createOrder',
      SWAPS_V2.ABI,
    );

    let baseDecimalsTimes = 1;
    let quoteDecimalsTimes = 1;

    if (new Date(originalContract.created_date).getTime() > FIX_TIME) {
      baseDecimalsTimes = Math.pow(
        10,
        this.requestData.tokens_info.base.token.decimals,
      );
      quoteDecimalsTimes = Math.pow(
        10,
        this.requestData.tokens_info.quote.token.decimals,
      );
    }

    const trxRequest = [
      details.memo_contract,
      this.requestData.tokens_info.base.token.address,
      this.requestData.tokens_info.quote.token.address,
      new BigNumber(details.base_limit || '0')
        .times(baseDecimalsTimes)
        .toString(10),
      new BigNumber(details.quote_limit || '0')
        .times(quoteDecimalsTimes)
        .toString(10),
      Math.round(new Date(details.stop_date).getTime() / 1000).toString(10),
      details.whitelist
        ? details.whitelist_address
        : '0x0000000000000000000000000000000000000000',
      new BigNumber(details.min_base_wei || '0')
        .times(baseDecimalsTimes)
        .toString(10),
      new BigNumber(details.min_quote_wei || '0')
        .times(quoteDecimalsTimes)
        .toString(10),
      details.broker_fee
        ? details.broker_fee_address
        : '0x0000000000000000000000000000000000000000',
      details.broker_fee
        ? new BigNumber(details.broker_fee_base).times(100).toString(10)
        : '0',
      details.broker_fee
        ? new BigNumber(details.broker_fee_quote).times(100).toString(10)
        : '0',
    ];

    const activateSignature = this.web3Service.encodeFunctionCall(
      interfaceMethod,
      trxRequest,
    );
    window['ethereum'].enable().then((accounts) => {
      const address = accounts[0];
      sendActivateTrx(address);
    });
    const sendActivateTrx = (wallet?) => {
      return this.web3Service
        .sendTransaction(
          {
            from: wallet,
            to: SWAPS_V2.ADDRESS,
            data: activateSignature,
          },
          'metamask',
        )
        .then(() => {
          this.contractIsCreated(originalContract);
        });
    };
  }
  public closeMetaMaskError() {
    this.metaMaskErrorModal.close();
  }
  private updateAddresses(ifEnabled?) {
    this.web3Service.getAccounts(false, ifEnabled).subscribe(
      () => {},
      (error) => {
        this.metamaskError = error;
      },
    );
  }
}
