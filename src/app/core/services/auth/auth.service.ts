import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { WalletConnectorService } from 'src/app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { HeaderStore } from '../../header/services/header.store';
import { UserInterface } from './models/user.interface';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { compareAddresses } from '@shared/utils/utils';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { ChainType, blockchainId } from 'rubic-sdk';
import { SpaceIdGetMetadataResponse, spaceIdDomains } from './models/space-id-types';
import { createWeb3Name } from '@web3-name-sdk/core';
import { Router } from '@angular/router';
import { WINDOW } from '@ng-web-apis/common';

/**
 * Service that provides methods for working with authentication and user interaction.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private web3Name = createWeb3Name();

  private readonly _currentUser$ = new BehaviorSubject<UserInterface>(undefined);

  public readonly currentUser$ = this._currentUser$.asObservable();

  get user(): UserInterface {
    return this._currentUser$.getValue();
  }

  get userAddress(): string | undefined {
    return this.user?.address;
  }

  get userChainType(): ChainType {
    return this.user?.chainType;
  }

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly errorService: ErrorsService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly router: Router,
    @Inject(WINDOW) private readonly window: Window
  ) {
    this.initSubscriptions();
  }

  private initSubscriptions(): void {
    this.walletConnectorService.addressChange$.subscribe(address => {
      this.setCurrentUser(address, this.walletConnectorService.chainType);
    });
  }

  private setCurrentUser(address: string, chainType: ChainType): void {
    if (!compareAddresses(address, this.userAddress)) {
      this._currentUser$.next({ address, chainType });
    }
  }

  /**
   * Checks if storage contains information about user and tries to connect.
   */
  public async loadStorageUser(): Promise<void> {
    const success = await this.walletConnectorService.setupProvider();
    this._currentUser$.next(null);
    if (!success) {
      return;
    }

    this.connectWallet({ hideError: true });
  }

  public async connectWallet(options: {
    walletName?: WALLET_NAME;
    chainId?: number;
    hideError?: boolean;
  }): Promise<void> {
    try {
      const { walletName } = options;
      if (walletName && this.walletConnectorService.provider?.walletName !== walletName) {
        this.walletConnectorService.connectProvider(walletName, options.chainId);
      }

      await this.walletConnectorService.activate();
      const { address, chainType } = this.walletConnectorService;
      this.setCurrentUser(address, chainType);

      const isHistoryPage = this.router.url.includes('history');
      if (isHistoryPage) {
        this.window.location.reload();
      }

      if (walletName) {
        this.gtmService.fireConnectWalletEvent(walletName);
      }
    } catch (err) {
      this.walletConnectorService.deactivate();
      this._currentUser$.next(null);
      this.headerStore.setWalletsLoadingStatus(false); // @todo move
      if (!options.hideError) {
        this.errorService.catch(err);
      }
    }
  }

  public disconnectWallet(): void {
    this.walletConnectorService.deactivate();
    this._currentUser$.next(null);
  }

  public async setUserData(): Promise<void> {
    const isSupportedSpaceId = Object.keys(spaceIdDomains).some(
      id => this.walletConnectorService.network === id
    );

    if (isSupportedSpaceId) {
      const chainId = blockchainId[this.walletConnectorService.network];
      const spaceIdName = await this.web3Name.getDomainName({
        address: this.walletConnectorService.address,
        queryChainIdList: [chainId]
      });

      if (!spaceIdName) {
        this._currentUser$.next({
          ...this._currentUser$.value,
          avatar: null,
          name: null
        });
      }

      const { image, name } = (await this.web3Name.getMetadata({
        name: spaceIdName
      })) as SpaceIdGetMetadataResponse;

      this._currentUser$.next({
        ...this._currentUser$.value,
        avatar: image ?? null,
        name: name
      });
    } else {
      this._currentUser$.next({
        ...this._currentUser$.value,
        avatar: null,
        name: null
      });
    }
  }
}
