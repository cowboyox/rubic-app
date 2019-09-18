import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {IContract} from '../contract-form/contract-form.component';
import {ActivatedRoute} from '@angular/router';

import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {Web3Service} from '../services/web3/web3.service';
import BigNumber from 'bignumber.js';

import {CONTRACT_STATES} from '../contract-preview/contract-states';
import {MatDialog} from '@angular/material';
import {TransactionComponent} from '../transaction/transaction.component';
import {ContractsService} from '../services/contracts/contracts.service';
import {UserInterface} from '../services/user/user.interface';
import {UserService} from '../services/user/user.service';

import {SWAPS_V2} from '../contract-form-all/contract-v2-details';
import {ContactOwnerComponent} from '../contact-owner/contact-owner.component';
import {IContractV3} from '../contract-form-all/contract-form-all.component';
import {ERC20_TOKEN_ABI} from '../services/web3/web3.constants';



@Component({
  selector: 'app-contracts-preview-v3',
  templateUrl: './contracts-preview-v3.component.html',
  styleUrls: ['../contract-preview/contract-preview.component.scss']
})
export class ContractsPreviewV3Component implements OnInit, OnDestroy {

  private web3Contract;
  public isRemindered: boolean;
  private tokenContract: any;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private web3Service: Web3Service,
    private dialog: MatDialog,
    private contractService: ContractsService,
    private userService: UserService
  ) {
    this.web3Contract = this.web3Service.getContract(SWAPS_V2.ABI, SWAPS_V2.ADDRESS);
    this.originalContract = this.route.snapshot.data.contract;


    this.copiedAddresses = {};
    this.analyzeContract();

    this.maximumInvestors = 10;

    this.currentUser = this.userService.getUserModel();
    this.userService.getCurrentUser().subscribe((userProfile: UserInterface) => {
      this.currentUser = userProfile;
      this.checkAuthor();
    });
    this.checkAuthor();
    this.formatNumberParams = {groupSeparator: ',', groupSize: 3, decimalSeparator: '.'};

    const tokenInfo = this.originalContract.tokens_info;

    this.rateFormat = {groupSeparator: ',', groupSize: 3, decimalSeparator: '.'};

    const baseAmount = new BigNumber(tokenInfo.base.amount).div(Math.pow(10, tokenInfo.base.token.decimals));
    const quoteAmount = new BigNumber(tokenInfo.quote.amount).div(Math.pow(10, tokenInfo.quote.token.decimals));

    this.rates = {
      normal: baseAmount.div(quoteAmount),
      reverted: quoteAmount.div(baseAmount)
    };

    this.originalContract.unique_link_url =
      this.contractAdditional.link =
        location.origin + '/public-v3/' + this.originalContract.unique_link;
  }


  get tokens() {
    return this.originalContract.tokens_info;
  }

  @ViewChild('administratorContact') administratorContact: TemplateRef<any>;

  private currentUser: any;

  public maximumInvestors;
  public rates;
  private formatNumberParams;

  public rateFormat;

  public originalContract: IContractV3;
  public copiedAddresses: any;
  public states = CONTRACT_STATES;
  public revertedRate: boolean;

  public activeSide: string;

  public contractAdditional: {
    source_link?: SafeResourceUrl;
    link?: string;
  } = {};

  public contractInfo: any = {};

  private updateContractTimer;

  private oldCheckedState: string;

  private checkSwapState() {
    const memo = this.originalContract.memo_contract;
    return new Promise((resolve, reject) => {
      const checkAfterActive = () => {
        this.web3Contract.methods.isSwapped(memo).call().then((isSwapped) => {
          this.originalContract.isSwapped = isSwapped;
          if (isSwapped) {
            this.originalContract.state =
              this.originalContract.contract_state = 'DONE';
            resolve('DONE');
          } else {
            this.web3Contract.methods.isCancelled(memo).call().then((isCancelled) => {
              if (isCancelled) {
                this.originalContract.state =
                  this.originalContract.contract_state = 'CANCELLED';
                resolve('CANCELLED');
              } else {
                this.originalContract.state =
                  this.originalContract.contract_state = 'ACTIVE';
                resolve('ACTIVE');
              }
            });
          }
        }, err => {
          console.log(err);
        });
      };
      if (this.originalContract.isEthereum) {
        if ((this.originalContract.contract_state === 'CREATED') || (!this.originalContract.owner_address)) {
          this.web3Contract.methods.owners(memo).call().then((address) => {
            if (address && (address !== '0x0000000000000000000000000000000000000000')) {
              this.originalContract.owner_address = address;
              checkAfterActive();
            } else {
              resolve(this.originalContract.state);
            }
          }, err => {
            console.log(err);
          });
        } else {
          checkAfterActive();
        }
      } else {
        resolve(this.originalContract.state);
      }
    });
  }

  public fromBigNumber(num, decimals, format?) {
    const bigNumberValue = new BigNumber(num).div(Math.pow(10, decimals));
    if (format) {
      return bigNumberValue.toFormat(this.formatNumberParams);
    } else {
      return bigNumberValue.toString(10);
    }
  }

  private getBaseRaised() {
    const details = this.originalContract;
    if (details.contract_state === 'ACTIVE' && details.isEthereum) {
      this.web3Contract.methods.baseRaised(details.memo_contract).call().then((result) => {
        this.contractInfo.baseRaised = result;
        this.contractInfo.baseLeft = new BigNumber(details.tokens_info.base.amount).minus(result);
        this.contractInfo.baseLeftString =
          this.contractInfo.baseLeft.div(Math.pow(10, details.tokens_info.base.token.decimals)).toString(10);
      }, err => {
        console.log(err);
      });
    } else {
      this.contractInfo.baseLeft = new BigNumber(details.tokens_info.base.amount);
      this.contractInfo.baseLeftString =
        this.contractInfo.baseLeft.div(Math.pow(10, details.tokens_info.base.token.decimals)).toString(10);
    }
  }
  private getQuoteRaised() {
    const details = this.originalContract;
    if (details.contract_state === 'ACTIVE' && details.isEthereum) {
      this.web3Contract.methods.quoteRaised(details.memo_contract).call().then((result) => {
        this.contractInfo.quoteRaised = result;
        this.contractInfo.quoteLeft = new BigNumber(details.tokens_info.quote.amount).minus(result);
        this.contractInfo.quoteLeftString =
          this.contractInfo.quoteLeft.div(Math.pow(10, details.tokens_info.quote.token.decimals)).toString(10);
      }, err => {
        console.log(err);
      });
    } else {
      this.contractInfo.quoteLeft = new BigNumber(details.tokens_info.quote.amount);
      this.contractInfo.quoteLeftString =
        this.contractInfo.quoteLeft.div(Math.pow(10, details.tokens_info.quote.token.decimals)).toString(10);
    }
  }
  private getBaseInvestors() {
    const details = this.originalContract;

    if (details.contract_state === 'ACTIVE' && details.isEthereum) {
      this.web3Contract.methods.baseInvestors(details.memo_contract).call().then((result) => {
        this.contractInfo.baseInvestors = result ? result.length : 0;
      }, err => {
        this.contractInfo.baseInvestors = 0;
        // console.log(err);
      });
    } else {
      this.contractInfo.baseInvestors = 0;
    }
  }
  private getQuoteInvestors() {
    const details = this.originalContract;
    if (details.contract_state === 'ACTIVE' && details.isEthereum) {
      this.web3Contract.methods.quoteInvestors(details.memo_contract).call().then((result) => {
        this.contractInfo.quoteInvestors = result ? result.length : 0;
      }, err => {
        this.contractInfo.quoteInvestors = 0;
      });
    } else {
      this.contractInfo.quoteInvestors = 0;
    }
  }
  private getBaseBrokersPercent() {
    const details = this.originalContract;

    if (details.isEthereum) {
      this.web3Contract.methods.myWishBasePercent().call().then((result) => {
        this.contractInfo.baseBrokerPercent = result / 100 + details.broker_fee_base;
        this.contractInfo.baseBrokerAmount =
          new BigNumber(details.tokens_info.base.amount).div(100).times(this.contractInfo.baseBrokerPercent);
      }, err => {
        console.log(err);
      });
    } else {
      this.contractInfo.baseBrokerPercent = details.broker_fee_base;
      this.contractInfo.baseBrokerAmount =
        new BigNumber(details.tokens_info.base.amount).div(100).times(this.contractInfo.baseBrokerPercent);
    }
  }
  private getQuoteBrokersPercent() {
    const details = this.originalContract;

    if (details.isEthereum) {
      this.web3Contract.methods.myWishQuotePercent().call().then((result) => {
        this.contractInfo.quoteBrokerPercent = result / 100 + details.broker_fee_quote;
        this.contractInfo.quoteBrokerAmount =
          new BigNumber(details.tokens_info.quote.amount).div(100).times(this.contractInfo.quoteBrokerPercent);
      }, err => {
        console.log(err);
      });
    } else {
      this.contractInfo.quoteBrokerPercent = details.broker_fee_quote;
      this.contractInfo.quoteBrokerAmount =
        new BigNumber(details.tokens_info.quote.amount).div(100).times(this.contractInfo.quoteBrokerPercent);
    }
  }

  private getContractInfoFromBlockchain() {
    const details = this.originalContract;
    this.getBaseRaised();
    this.getQuoteRaised();
    this.getBaseInvestors();
    this.getQuoteInvestors();

    this.getBaseBrokersPercent();
    this.getQuoteBrokersPercent();

    if (details.isEthereum) {
      if (details.contract_state === 'ACTIVE') {
        if (this.oldCheckedState !== details.contract_state) {
          this.web3Contract.methods.owners(details.memo_contract).call().then((res) => {
            this.originalContract.owner_address = res;
          }, err => {
            console.log(err);
          });
        }

        this.web3Contract.methods.isSwapped(details.memo_contract).call().then((res) => {
          this.originalContract.isSwapped = res;
        }, err => {
          console.log(err);
        });
      } else {
        this.originalContract.isSwapped = false;
      }
    } else {
      this.originalContract.isSwapped = false;
    }

    this.oldCheckedState = details.contract_state;
  }

  private analyzeContract() {
    this.checkSwapState().then((state) => {
      switch (this.originalContract.state) {
        case 'ACTIVE':
        case 'DONE':
        case 'CREATED':
        case 'EXPIRED':
        case 'CANCELLED':
          this.getContractInfo();
          break;
      }

      if (this.originalContract.state === 'ACTIVE') {
        this.updateContractTimer = setTimeout(() => {
          this.getBaseContract();
        }, 4000);
      }
    });
  }


  private checkAuthor() {
    if (this.currentUser) {
      this.originalContract.isAuthor = this.currentUser.id === this.originalContract.user;
    }
  }


  private getBaseContract() {
    this.contractService.getSwapByPublic(this.originalContract.unique_link).then((result) => {
      const tokens_info = this.originalContract.tokens_info;
      const swapped = this.originalContract.isSwapped;
      const state = this.originalContract.state;
      const contractState = this.originalContract.contract_state;
      const ownerAddress = this.originalContract.owner_address;
      const isAuthor = this.originalContract.isAuthor;
      const isEthereum = this.originalContract.isEthereum;

      this.originalContract = result;
      this.originalContract.tokens_info = tokens_info;
      this.originalContract.isSwapped = swapped;
      this.originalContract.state = state;
      this.originalContract.contract_state = contractState;
      this.originalContract.owner_address = ownerAddress;
      this.originalContract.isAuthor = isAuthor;
      this.originalContract.unique_link_url =
        this.contractAdditional.link;
      this.originalContract.isEthereum = isEthereum;

    }).finally(() => {
      this.analyzeContract();
    });
  }


  private getContractInfo() {
    this.checkAuthor();
    this.getContractInfoFromBlockchain();
  }


  ngOnInit() {}

  public onCopied(field) {
    if (this.copiedAddresses[field]) {
      return;
    }
    this.copiedAddresses[field] = true;
    setTimeout(() => {
      this.copiedAddresses[field] = false;
    }, 1000);
  }

  public sendRefund(token) {
    const details = this.originalContract;
    // const contract = this.originalContract.eth_contract;

    const interfaceMethod = this.web3Service.getMethodInterface('refund', SWAPS_V2.ABI);
    const methodSignature = this.web3Service.encodeFunctionCall(interfaceMethod, [
      details.memo_contract,
      token.address
    ]);

    const sendTransaction = (wallet) => {
      return this.web3Service.sendTransaction({
        from: wallet.address,
        to: SWAPS_V2.ADDRESS,
        data: methodSignature
      }, wallet.type);
    };

    this.dialog.open(TransactionComponent, {
      width: '38.65em',
      panelClass: 'custom-dialog-container',
      data: {
        title: 'Refund',
        description:
          'You can take back your contributions at any time until the contract’s execution.\n' +
          'Use the same address which you used for the contribution.',
        transactions: [{
          to: SWAPS_V2.ADDRESS,
          data: methodSignature,
          action: sendTransaction
        }]
      }
    });
  }

  public sendCancel() {

    const details = this.originalContract;

    if (!details.isEthereum) {
      this.contractService.cancelSWAP3(details.id).then((result) => {
        console.log(result);
      });
      return;
    }

    const cancelMethod = this.web3Service.getMethodInterface('cancel', SWAPS_V2.ABI);
    const cancelSignature = this.web3Service.encodeFunctionCall(
      cancelMethod, [details.memo_contract]
    );

    const cancelTransaction = (wallet) => {
      return this.web3Service.sendTransaction({
        from: wallet.address,
        to: SWAPS_V2.ADDRESS,
        data: cancelSignature
      }, wallet.type);
    };

    this.dialog.open(TransactionComponent, {
      width: '38.65em',
      panelClass: 'custom-dialog-container',
      data: {
        transactions: [{
          from: this.originalContract.owner_address,
          to: SWAPS_V2.ADDRESS,
          data: cancelSignature,
          action: cancelTransaction,
          onlyOwner: details.owner_address.toLowerCase()
        }],
        title: 'Cancel',
        description: 'To cancel the swap you need to make the transaction from the management address'
      }
    });
  }


  public openInitialisation() {

    const details = this.originalContract;

    const interfaceMethod = this.web3Service.getMethodInterface('createOrder', SWAPS_V2.ABI);

    const trxRequest = [
      details.memo_contract,
      details.tokens_info.base.token.address,
      details.tokens_info.quote.token.address,
      (details.base_limit || '0').toString(),
      (details.quote_limit || '0').toString(),
      Math.round((new Date(details.stop_date)).getTime() / 1000),
      details.whitelist ? details.whitelist_address : '0x0000000000000000000000000000000000000000',
      new BigNumber(details.min_base_wei || '0').toString(10),
      new BigNumber(details.min_quote_wei || '0').toString(10),
      details.broker_fee ? details.broker_fee_address : '0x0000000000000000000000000000000000000000',
      details.broker_fee ? (new BigNumber(details.broker_fee_base).times(100)).toString(10) : '0',
      details.broker_fee ? (new BigNumber(details.broker_fee_quote).times(100)).toString(10) : '0'
    ];
    const activateSignature = this.web3Service.encodeFunctionCall(interfaceMethod, trxRequest);
    const sendActivateTrx = (wallet) => {
      return this.web3Service.sendTransaction({
        from: wallet.address,
        to: SWAPS_V2.ADDRESS,
        data: activateSignature
      }, wallet.type);
    };


    this.dialog.open(TransactionComponent, {
      width: '38.65em',
      panelClass: 'custom-dialog-container',
      data: {
        transactions: [{
          to: SWAPS_V2.ADDRESS,
          data: activateSignature,
          action: sendActivateTrx
        }],
        title: 'Initialization',
        description: 'Before the contribution it’s needed to initialize the contract (once per trade)'
      }
    });
  }



  private getContributeTransaction(amount, token) {
    let tokenModel: any;
    const details = this.originalContract;

    switch (token) {
      case 'base':
        tokenModel = details.tokens_info.base;
        break;
      case 'quote':
        tokenModel = details.tokens_info.quote;
        break;
    }

    const stringAmountValue = new BigNumber(amount).toString(10);

    let value: string;
    if (tokenModel.token.isEther) {
      value = stringAmountValue;
    }

    const depositMethod = this.web3Service.getMethodInterface('deposit', SWAPS_V2.ABI);
    const depositSignature = this.web3Service.encodeFunctionCall(
      depositMethod, [details.memo_contract, tokenModel.token.address, stringAmountValue]
    );

    const contributeTransaction = (wallet) => {
      return this.web3Service.sendTransaction({
        from: wallet.address,
        to: SWAPS_V2.ADDRESS,
        data: depositSignature,
        value: value || undefined
      }, wallet.type);
    };

    return {
      action: contributeTransaction,
      signature: depositSignature,
      token: tokenModel.token
    };
  }

  private createTransactions(amount, token) {
    try {

      const bigNumberAmount = new BigNumber(amount);

      if (bigNumberAmount.isNaN()) {
        return;
      }


      const approveMethod = this.web3Service.getMethodInterface('approve');
      const approveSignature = this.web3Service.encodeFunctionCall(
        approveMethod, [
          SWAPS_V2.ADDRESS,
          new BigNumber(2).pow(256).minus(1).toString(10)
        ]
      );

      const contributeData = this.getContributeTransaction(amount, token);
      const textAmount = this.fromBigNumber(amount, contributeData.token.decimals);

      const approveTransaction = (wallet) => {
        return this.web3Service.sendTransaction({
          from: wallet.address,
          to: contributeData.token.address,
          data: approveSignature
        }, wallet.type);
      };

      const transactionsList: any[] = [{
        title: 'Make the transfer of ' + textAmount + ' ' + contributeData.token.token_short_name + ' tokens to contract',
        to: SWAPS_V2.ADDRESS,
        data: contributeData.signature,
        action: contributeData.action,
        ethValue: !contributeData.token.isEther ? undefined : bigNumberAmount.div(Math.pow(10, contributeData.token.decimals)).toString(10)
      }];

      if (!contributeData.token.isEther) {
        transactionsList.unshift({
          title: 'Authorise the contract for getting ' + textAmount + ' ' + contributeData.token.token_short_name + ' tokens',
          to: contributeData.token.address,
          data: approveSignature,
          action: approveTransaction
        });
      }

      this.dialog.open(TransactionComponent, {
        width: '38.65em',
        panelClass: 'custom-dialog-container',
        data: {
          transactions: transactionsList,
          title: 'Contribute',
          description: !contributeData.token.isEther ?
            `For contribution you need to make ${transactionsList.length} transactions: authorise the contract and make the transfer` :
            ''
        }
      });

    } catch (e) {
      console.log(e);
    }
  }


  public sendContribute(amount, token) {

    const details = this.originalContract;

    if (!details.isEthereum) {
      this.openAdministratorInfo();
      return;
    }

    if (details.contract_state === 'CREATED') {
      this.openInitialisation();
      return;
    }

    const tokenModel = details.tokens_info[token].token;


    const metamaskSubscriber = this.web3Service.getAccounts().subscribe((response: any) => {
      if (response && response.metamask) {
        if (tokenModel.isEther) {
        } else {
          this.tokenContract = this.web3Service.getContract(ERC20_TOKEN_ABI, tokenModel.address);
          this.tokenContract.methods.allowance(
            response.metamask[0],
            SWAPS_V2.ADDRESS
          ).call().then((result) => {
            result = result ? result.toString(10) : result;
            result = result === '0' ? null : result;
            if (result && new BigNumber(result).minus(amount).isPositive()) {
              const contributeData = this.getContributeTransaction(amount, token);
              contributeData.action({
                type: 'metamask',
                address: response.metamask[0]
              });
            } else {
              this.createTransactions(amount, token);
            }
          });
        }
      } else {
        this.createTransactions(amount, token);
      }
      metamaskSubscriber.unsubscribe();
    }, (error) => {
      this.createTransactions(amount, token);
      metamaskSubscriber.unsubscribe();
    });
  }

  ngOnDestroy(): void {
    if (this.updateContractTimer) {
      window.clearTimeout(this.updateContractTimer);
    }
  }

  public openContactForm() {
    this.dialog.open(ContactOwnerComponent, {
      width: '38.65em',
      panelClass: 'custom-dialog-container',
      data: this.originalContract
    });
  }

  public quoteWillGetValue(amount) {
    const details = this.originalContract;

    const quoteWillValue = new BigNumber(details.tokens_info.quote.amount).div(new BigNumber(details.tokens_info.base.amount).div(amount));
    const quoteFeeValue = quoteWillValue.div(100).times(this.contractInfo.quoteBrokerPercent);

    if (!quoteFeeValue.isNaN()) {
      return quoteWillValue
        .minus(quoteFeeValue).toString(10);
    } else {
      return quoteWillValue.toString(10);
    }
  }

  public baseWillGetValue(amount) {
    const details = this.originalContract;
    const baseWillValue = new BigNumber(details.tokens_info.base.amount).div(new BigNumber(details.tokens_info.quote.amount).div(amount));
    const baseFeeValue = baseWillValue.div(100).times(this.contractInfo.baseBrokerPercent);

    if (!baseFeeValue.isNaN()) {
      return baseWillValue
        .minus(baseFeeValue).toString(10);
    } else {
      return baseWillValue.toString(10);
    }
  }

  private openAdministratorInfo() {
    this.dialog.open(this.administratorContact, {
      width: '480px',
      panelClass: 'custom-dialog-container'
    });
  }

}
