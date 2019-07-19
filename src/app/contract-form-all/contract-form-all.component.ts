import {AfterContentInit, Component, EventEmitter, Injectable, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {ContractFormComponent, IContract, IContractDetails, MY_FORMATS} from '../contract-form/contract-form.component';
import {ContractsService} from '../services/contracts/contracts.service';
import {UserService} from '../services/user/user.service';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {ActivatedRoute, ActivatedRouteSnapshot, Resolve, Router} from '@angular/router';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDatepicker} from '@angular/material';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter} from '@angular/material-moment-adapter';

import BigNumber from 'bignumber.js';
import * as moment from 'moment';
import {HttpService} from '../services/http/http.service';
import {TokenInfoInterface, Web3Service} from '../services/web3/web3.service';
import {Observable} from 'rxjs';
import {UserInterface} from '../services/user/user.interface';


export interface IContractV3 {

  id?: number;
  name: string;

  base_address?: string;
  quote_address?: string;
  base_limit?: string;
  quote_limit?: string;
  stop_date?: number;
  owner_address?: string;
  public?: boolean|undefined;
  unique_link?: string;
  unique_link_url?: string;

  broker_fee: boolean;
  broker_fee_address: string;
  broker_fee_base: number;
  broker_fee_quote: number;

  quote_coin_id?: number;
  base_coin_id?: number;

  tokens_info?: {
    base?: {
      token: any;
      amount?: string;
    };
    quote?: {
      token: any;
      amount?: string;
    };
  };


  whitelist?: any;
  whitelist_address?: any;
  min_base_wei?: any;
  memo_contract?: any;
  min_quote_wei?: any;

  state?: string;
  isSwapped?: boolean;
  isAuthor?: boolean;
  user?: number;

  isEthereum?: boolean;

}




@Component({
  selector: 'app-contract-form-all',
  templateUrl: './contract-form-all.component.html',
  styleUrls: ['../contract-form/contract-form.component.scss'],
  providers: [
    Location,
    {provide: LocationStrategy, useClass: PathLocationStrategy},
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
})
export class ContractFormAllComponent implements AfterContentInit, OnInit {

  @Output() BaseTokenChange = new EventEmitter<string>();
  @Output() QuoteTokenChange = new EventEmitter<string>();
  @Output() BaseTokenCustom = new EventEmitter<any>();
  @Output() QuoteTokenCustom = new EventEmitter<any>();

  public originalContract: IContractV3;

  public confirmationIsProgress: boolean;
  public formIsSending: boolean;

  public currentUser;
  public editableContract = true;

  public minTime;
  public minDate: moment.Moment;

  public datePickerDate;
  public datePickerTime;

  public customTokens;
  public openedCustomTokens: {
    base: boolean;
    quote: boolean;
  };

  public revertedRate: boolean;

  public requestData: IContractV3;

  // For request form data
  protected formData: IContractV3;


  public openedForm: any;

  @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;
  @ViewChild('extraForm') public extraForm;

  @ViewChild('brokersForm') private brokersForm;


  constructor(
    protected contractsService: ContractsService,
    private userService: UserService,
    private location: Location,
    private route: ActivatedRoute,
    protected router: Router
  ) {

    this.originalContract = this.route.snapshot.data.contract;

    this.customTokens = {
      base: {},
      quote: {}
    };
    this.openedCustomTokens = {
      base: false,
      quote: false
    };

    this.currentUser = this.userService.getUserModel();
    this.userService.getCurrentUser().subscribe((userProfile: UserInterface) => {
      this.currentUser = userProfile;
    });

    this.minDate = moment().add(1, 'hour');
    const startDateTime = moment(this.minDate);
    this.datePickerDate = startDateTime.add(1, 'hour');
    this.datePickerTime = `${startDateTime.hour()}:${startDateTime.minutes()}`;

  }



  ngOnInit() {
    const draftData = localStorage.getItem('form_new_values');

    if (this.originalContract) {
      this.requestData = {...this.originalContract};
      this.gotToForm(100);
    } else {
      this.requestData = draftData ? JSON.parse(draftData) : {
        tokens_info: {
          base: {
            token: {},
          },
          quote: {
            token: {},
          }
        }
      };

      this.requestData.public = true;
      this.originalContract = {...this.requestData};
      this.gotToForm(0);
    }

  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.dateChange();
    });

    if (this.route.snapshot.data.contract) {
      this.datePickerDate = moment(this.originalContract.stop_date);
      this.datePickerTime = `${this.datePickerDate.hour()}:${this.datePickerDate.minutes()}`;
    }
  }


  get baseBrokerFee() {
    return new BigNumber(this.requestData.tokens_info.base.amount).div(100).times(this.requestData.broker_fee_base);
  }

  get quoteBrokerFee() {
    return new BigNumber(this.requestData.tokens_info.quote.amount).div(100).times(this.requestData.broker_fee_quote);
  }

  get isEthereumSwap() {
    return this.requestData.tokens_info.quote.token.isEthereum && this.requestData.tokens_info.base.token.isEthereum;
  }

  get tokens() {
    return this.requestData.tokens_info;
  }


  public revertCoins() {
    const baseCoin = {...this.requestData.tokens_info.base};
    this.requestData.tokens_info.base = {...this.requestData.tokens_info.quote};
    this.requestData.tokens_info.quote = {...baseCoin};

    this.BaseTokenCustom.emit(this.requestData.tokens_info.base);
    this.QuoteTokenCustom.emit(this.requestData.tokens_info.quote);
  }

  public checkRate(revert?) {
    const baseCoinAmount = new BigNumber(this.requestData.tokens_info.base.amount)
      .div(Math.pow(10, this.requestData.tokens_info.base.token.decimals));

    const quoteCoinAmount = new BigNumber(this.requestData.tokens_info.quote.amount)
      .div(Math.pow(10, this.requestData.tokens_info.quote.token.decimals));

    return !revert ?
      baseCoinAmount.div(quoteCoinAmount).dp(4) :
      quoteCoinAmount.div(baseCoinAmount).dp(4);
  }

  private setFullDateTime() {
    const times = this.extraForm.value.time.split(':');
    this.extraForm.value.active_to.hour(times[0]);
    this.extraForm.value.active_to.minutes(times[1]);

    if (this.extraForm.value.active_to.isBefore(this.minDate)) {
      this.extraForm.controls.time.setErrors({incorrect: true});
    } else {
      this.extraForm.controls.time.setErrors(null);
    }

    this.requestData.stop_date = this.extraForm.value.active_to;
  }

  public dateChange() {
    if (this.extraForm.value.active_to.isSame(this.minDate, 'day')) {
      this.minTime = `${this.minDate.hour()}:${this.minDate.minutes()}`;
    } else {
      this.minTime = null;
    }
    this.setFullDateTime();

  }

  public timeChange() {
    this.setFullDateTime();
  }


  public gotToForm(formNumber) {
    if (this.openedForm === formNumber) {
      return;
    }
    this.openedForm = formNumber;
    if (window.screen.width <= 580) {
      window.scrollTo(0, 0);
    }
  }

  public changedToken(coin) {
    setTimeout(() => {
      switch (coin) {
        case 'base':
          this.BaseTokenChange.emit(this.requestData.tokens_info[coin].token.decimals);
          break;
        case 'quote':
          this.QuoteTokenChange.emit(this.requestData.tokens_info[coin].token.decimals);
          break;
      }
    });
  }


  private contractIsCreated(contract) {
    this.router.navigate(['/contract-v3/' + contract.id]);
  }

  private contractIsError(error) {
    console.log(error);
  }

  public setCustomToken(field, token) {
    token.isEthereum = true;
    this.customTokens[field] = token;
  }

  public addCustomToken(name) {
    this.requestData.tokens_info[name].token = {...this.customTokens[name]};
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

  protected sendContractData(data) {
    if (this.formIsSending) {
      return;
    }
    this.formIsSending = true;
    this.contractsService[data.id ? 'updateSWAP3' : 'createSWAP3'](data)
      .then((result) => {
        this.contractIsCreated(result);
      }, (err) => {
        this.contractIsError(err);
      }).finally(() => {
      this.formIsSending = false;
    });
  }

  public createContract(tokenForm, advancedForm?: any) {

    this.formData = {
      ...tokenForm.value,
      ...advancedForm.value
    } as IContractV3;

    this.formData.public = !!this.extraForm.value.public;
    this.formData.stop_date = this.extraForm.value.active_to.utc().format('YYYY-MM-DD HH:mm');
    this.formData.base_limit = this.requestData.tokens_info.base.amount;
    this.formData.quote_limit = this.requestData.tokens_info.quote.amount;

    this.formData.owner_address = this.extraForm.value.owner_address;
    this.formData.name = this.requestData.tokens_info.base.token.token_short_name +
      '<>' + this.requestData.tokens_info.quote.token.token_short_name;


    this.formData.min_quote_wei = this.formData.min_quote_wei || '0';
    this.formData.min_base_wei = this.formData.min_base_wei || '0';


    if (this.brokersForm) {
      this.formData = {
        ...this.formData,
        ...this.brokersForm.value
      };

      if (!this.formData.broker_fee) {
        this.formData.broker_fee_address = null;
        this.formData.broker_fee_base = null;
        this.formData.broker_fee_quote = null;
      }
    }

    this.formData.id = this.originalContract.id;

    if (this.currentUser.is_ghost) {
      this.userService.openAuthForm().then(() => {
        this.sendContractData(this.formData);
      });
    } else {
      this.sendContractData(this.formData);
    }

  }

}




@Injectable()
export class ContractEditV3Resolver implements Resolve<any> {
  private currentUser;
  private route;

  constructor(
    private contractsService: ContractsService,
    private userService: UserService,
    private httpService: HttpService,
    private web3Service: Web3Service,
    private router: Router
  ) {

  }

  private contractId: number;
  private publicLink: string;


  private getContractInformation(observer, isPublic?) {


    const promise = !isPublic ?
      this.contractsService.getContractV3Information(this.contractId) :
      this.contractsService.getSwapByPublic(this.publicLink);

    promise.then((result: IContractV3) => {
      result.tokens_info = {};

      let quoteToken;
      let baseToken;

      if (result.quote_address) {
        quoteToken = window['cmc_tokens'].filter((tk) => {
          return tk.isEthereum && (tk.address === result.quote_address);
        })[0];

        this.web3Service.getFullTokenInfo(result.quote_address).then((tokenInfo: TokenInfoInterface) => {
          if (quoteToken) {
            result.tokens_info.quote = {
              token: {...quoteToken}
            };
            result.tokens_info.quote.token.decimals = tokenInfo.decimals;
          } else {
            tokenInfo.isEthereum = true;
            result.tokens_info.quote = {
              token: tokenInfo
            };
          }
        }, () => {
          result.tokens_info.quote = {
            token: {...quoteToken}
          };
          // result.tokens_info.quote.token.decimals = 0;
        }).finally(() => {
          result.tokens_info.quote.amount = result.quote_limit;
          if (result.tokens_info.base) {
            observer.complete();
          }
        });
      } else {
        result.tokens_info.quote = {
          token: window['cmc_tokens'].filter((tk) => {
            return tk.mywish_id === result.quote_coin_id;
          })[0]
        };

        // result.tokens_info.quote.token.decimals = 0;
        result.tokens_info.quote.amount = result.quote_limit;
        if (result.tokens_info.base) {
          setTimeout(() => {
            observer.complete();
          });
        }
      }

      if (result.base_address) {
        baseToken = window['cmc_tokens'].filter((tk) => {
          return tk.isEthereum && (tk.address === result.base_address);
        })[0];
        this.web3Service.getFullTokenInfo(result.base_address).then((tokenInfo: TokenInfoInterface) => {
          if (baseToken) {
            result.tokens_info.base = {
              token: baseToken
            };
            result.tokens_info.base.token.decimals = tokenInfo.decimals;
          } else {
            tokenInfo.isEthereum = true;
            result.tokens_info.base = {
              token: tokenInfo
            };
          }
        }, () => {
          result.tokens_info.base = {
            token: {...baseToken}
          };
          // result.tokens_info.base.token.decimals = 0;
        }).finally(() => {
          result.tokens_info.base.amount = result.base_limit;
          if (result.tokens_info.quote) {
            observer.complete();
          }
        });
      } else {
        result.tokens_info.base = {
          token: window['cmc_tokens'].filter((tk) => {
            return tk.mywish_id === result.base_coin_id;
          })[0]
        };
        // result.tokens_info.base.token.decimals = 0;
        result.tokens_info.base.amount = result.base_limit;
        if (result.tokens_info.quote) {
          setTimeout(() => {
            observer.complete();
          });
        }
      }

      observer.next(result);
    });
  }

  resolve(route: ActivatedRouteSnapshot) {
    this.route = route;
    if (route.params.id) {
      this.contractId = route.params.id;
      return new Observable((observer) => {
        const subscription = this.userService.getCurrentUser(false, true).subscribe((user) => {
          this.currentUser = user;
          if (!user.is_ghost) {
            this.getContractInformation(observer);
          } else {
            this.userService.openAuthForm().then(() => {
              this.getContractInformation(observer);
            }, () => {
              this.router.navigate(['/']);
              //
            });
          }
          subscription.unsubscribe();
        });
        return {
          unsubscribe() {}
        };
      });
    } else if (route.params.public_link) {
      this.publicLink = route.params.public_link;
      return new Observable((observer) => {
        this.getContractInformation(observer, true);
      });
    }
  }
}
