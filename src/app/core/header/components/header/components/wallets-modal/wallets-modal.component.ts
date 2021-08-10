import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Injector
} from '@angular/core';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { POLYMORPHEUS_CONTEXT, PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import { CoinbaseConfirmModalComponent } from 'src/app/core/header/components/header/components/coinbase-confirm-modal/coinbase-confirm-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import { WINDOW } from 'src/app/core/models/window';
import { WALLET_NAME, WalletProvider } from './models/providers';
import { HeaderStore } from '../../../../services/header.store';

@Component({
  selector: 'app-wallets-modal',
  templateUrl: './wallets-modal.component.html',
  styleUrls: ['./wallets-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletsModalComponent {
  public readonly $walletsLoading: Observable<boolean>;

  private readonly allProviders: WalletProvider[];

  private readonly $mobileDisplayStatus: Observable<boolean>;

  public get providers(): WalletProvider[] {
    return this.isMobile
      ? this.allProviders.filter(provider => !provider.desktopOnly)
      : this.allProviders;
  }

  public get isMobile(): boolean {
    return new AsyncPipe(this.cdr).transform(this.$mobileDisplayStatus);
  }

  private redirectToMetamaskBrowser(): void {
    const metamaskAppLink = 'https://metamask.app.link/dapp/';
    this.window.location.assign(`${metamaskAppLink}${this.window.location.hostname}`);
  }

  private redirectToCoinbaseBrowser(): void {
    let walletLinkAppLink: string;
    switch (this.window.location.hostname.split('.')[0]) {
      case 'stage':
        walletLinkAppLink = 'https://go.cb-w.com/gCtmOgQGBib';
        break;
      case 'dev':
        walletLinkAppLink = 'https://go.cb-w.com/D0GNLvaHBib';
        break;
      case 'dev2':
        walletLinkAppLink = 'https://go.cb-w.com/gCtmOgQGBib';
        break;
      case 'rubic':
      default:
        walletLinkAppLink = 'https://go.cb-w.com/IJZCq1fHBib';
        break;
    }
    this.window.location.assign(walletLinkAppLink);
  }

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<void>,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    @Inject(WINDOW) private readonly window: Window,
    private readonly translateService: TranslateService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly authService: AuthService,
    private readonly headerStore: HeaderStore,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.$walletsLoading = this.headerStore.getWalletsLoadingStatus();
    this.$mobileDisplayStatus = this.headerStore.getMobileDisplayStatus();
    this.allProviders = [
      {
        name: 'MetaMask',
        value: WALLET_NAME.METAMASK,
        img: './assets/images/icons/wallets/metamask.svg',
        desktopOnly: false,
        display: true
      },
      {
        name: 'Coinbase wallet',
        value: WALLET_NAME.WALLET_LINK,
        img: './assets/images/icons/wallets/coinbase.png',
        desktopOnly: false,
        display: true
      },
      {
        name: 'WalletConnect',
        value: WALLET_NAME.WALLET_CONNECT,
        img: './assets/images/icons/wallets/walletconnect.svg',
        desktopOnly: true,
        display: true
      }
    ];
  }

  public async connectProvider(provider: WALLET_NAME): Promise<void> {
    // mobile browser without injected metamask provider (e.g. mobile chrome)
    if (this.isMobile && provider === WALLET_NAME.METAMASK && !this.window.ethereum) {
      this.redirectToMetamaskBrowser();
      return;
    }

    // mobile browser without injected walletLink provider (e.g. mobile chrome)
    if (this.isMobile && provider === WALLET_NAME.WALLET_LINK && !this.window.ethereum) {
      this.redirectToCoinbaseBrowser();
    }

    this.headerStore.setWalletsLoadingStatus(true);

    // desktop coinbase
    if (!this.isMobile && provider === WALLET_NAME.WALLET_LINK) {
      this.dialogService
        .open<BLOCKCHAIN_NAME>(
          new PolymorpheusComponent(CoinbaseConfirmModalComponent, this.injector),
          {
            dismissible: true,
            label: this.translateService.instant('modals.coinbaseSelectNetworkModal.title'),
            size: 'm'
          }
        )
        .subscribe({
          next: blockchainName => {
            if (blockchainName) {
              this.providerConnectorService.connectProvider(
                provider,
                BlockchainsInfo.getBlockchainByName(blockchainName).id
              );
              this.authService.signIn();
              this.close();
            }
          },
          complete: () => this.headerStore.setWalletsLoadingStatus(false)
        });
      return;
    }

    try {
      await this.providerConnectorService.connectProvider(provider);
      await this.authService.signIn();
    } catch (e) {
      this.headerStore.setWalletsLoadingStatus(false);
    }
    this.headerStore.setWalletsLoadingStatus(false);
    this.close();
  }

  public close(): void {
    this.headerStore.setWalletsLoadingStatus(false);
    this.context.completeWith();
  }
}
