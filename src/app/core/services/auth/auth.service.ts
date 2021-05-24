import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { take, finalize, first } from 'rxjs/operators';
import { HeaderStore } from '../../header/services/header.store';
import { Web3PrivateService } from '../blockchain/web3-private-service/web3-private.service';
import { HttpService } from '../http/http.service';
import { MetamaskLoginInterface, UserInterface } from './models/user.interface';
import { QueryParamsService } from '../query-params/query-params.service';
import { ProviderConnectorService } from '../blockchain/provider-connector/provider-connector.service';

/**
 * Service that provides methods for working with authentication and user interaction.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * Is auth process going in.
   */
  private isAuthProcess: boolean;

  /**
   * Current user data.
   */
  private readonly $currentUser: BehaviorSubject<UserInterface>;

  private readonly USER_IS_IN_SESSION_CODE = '1000';

  get user(): UserInterface {
    return this.$currentUser.getValue();
  }

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly httpService: HttpService,
    private readonly web3Service: Web3PrivateService,
    private readonly queryParamsService: QueryParamsService,
    private readonly providerConnectorService: ProviderConnectorService
  ) {
    this.isAuthProcess = false;
    this.$currentUser = new BehaviorSubject<UserInterface>(undefined);
    this.providerConnectorService.$addressChange.subscribe(address => {
      if (this.isAuthProcess) {
        return;
      }
      const user = this.$currentUser.getValue();
      // user inited, account not authorized on backend or authorized other account
      if (user !== undefined && (user === null || user?.address !== address) && address) {
        /* this.$currentUser.next(null);
        this.signIn(); */
        this.queryParamsService.$isIframe.pipe(take(1)).subscribe(isIframe => {
          if (isIframe) {
            this.$currentUser.next({ address });
          } else {
            window.location.reload();
          }
        });
        // TODO: надо продумать модальные окна на кейсы, когда юзер сменил адрес в метамаске но не подписал nonce с бэка
      }
    });
  }

  /**
   * @description Ger current user as observable.
   * @returns User.
   */
  public getCurrentUser(): Observable<UserInterface> {
    return this.$currentUser.asObservable();
  }

  /**
   * @description Fetch authorized user address or auth message in case there's no authorized user.
   */
  private fetchMetamaskLoginBody(): Observable<MetamaskLoginInterface> {
    return this.httpService.get('metamask/login/', {});
  }

  /**
   * @description Authenticate user on backend.
   * @param address wallet address
   * @param nonce nonce to sign
   * @param signature signed nonce
   * @return Authentication key.
   */
  private sendSignedNonce(address: string, nonce: string, signature: string): Promise<void> {
    return this.httpService
      .post('metamask/login/', { address, message: nonce, signed_message: signature })
      .toPromise();
  }

  public async loadUser() {
    this.isAuthProcess = true;
    this.fetchMetamaskLoginBody().subscribe(
      async metamaskLoginBody => {
        if (metamaskLoginBody.code === this.USER_IS_IN_SESSION_CODE) {
          await this.providerConnectorService.activate();

          const { address } = metamaskLoginBody.payload.user;
          if (address === this.web3Service.address) {
            this.$currentUser.next({ address });
          } else {
            this.signOut()
              .pipe(
                first(),
                finalize(() => {
                  this.signIn();
                })
              )
              .subscribe();
          }
        } else {
          this.$currentUser.next(null);
        }
        this.isAuthProcess = false;
      },
      () => this.$currentUser.next(null)
    );
  }

  /**
   * @description Initiate authentication via metamask.
   */
  public async signIn(): Promise<void> {
    this.isAuthProcess = true;
    await this.providerConnectorService.activate();
    const nonce = (await this.fetchMetamaskLoginBody().toPromise()).payload.message;
    const signature = await this.web3Service.signPersonal(nonce);

    await this.sendSignedNonce(this.web3Service.address, nonce, signature);

    this.$currentUser.next({ address: this.web3Service.address });
    this.isAuthProcess = false;
  }

  public async iframeSignIn(): Promise<void> {
    this.isAuthProcess = true;
    const permissions = await this.providerConnectorService.requestPermissions();
    const accountsPermission = permissions.find(
      permission => permission.parentCapability === 'eth_accounts'
    );
    if (accountsPermission) {
      await this.providerConnectorService.activate();
      const { address } = this.web3Service;
      this.$currentUser.next({ address } || null);
    } else {
      this.$currentUser.next(null);
    }
    this.isAuthProcess = false;
  }

  /**
   * @description Logout request to backend.
   */
  public signOut(): Observable<string> {
    return this.httpService.post('metamask/logout/', {}).pipe(
      finalize(() => {
        this.$currentUser.next(null);
        this.providerConnectorService.deActivate();
      })
    );
  }

  public iframeSignOut(): void {
    this.providerConnectorService.deActivate();
    this.$currentUser.next(null);
  }
}
