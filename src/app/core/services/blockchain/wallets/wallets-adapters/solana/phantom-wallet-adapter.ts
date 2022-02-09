import { BehaviorSubject } from 'rxjs';
import { BlockchainData } from '@shared/models/blockchain/blockchain-data';
import { ErrorsService } from '@core/errors/errors.service';

import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import CustomError from '@core/errors/models/custom-error';
import { Connection, PublicKey } from '@solana/web3.js';
import { PhantomWallet } from '@core/services/blockchain/wallets/wallets-adapters/solana/models/types';
import { CommonSolanaWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/solana/common/common-solana-wallet-adapter';
import { WalletNotInstalledError } from '@core/errors/models/provider/wallet-not-installed-error';

export class PhantomWalletAdapter extends CommonSolanaWalletAdapter<PhantomWallet> {
  public get walletName(): WALLET_NAME {
    return WALLET_NAME.PHANTOM;
  }

  constructor(
    onNetworkChanges$: BehaviorSubject<BlockchainData>,
    onAddressChanges$: BehaviorSubject<string>,
    errorsService: ErrorsService,
    connection: Connection
  ) {
    super(errorsService, onAddressChanges$, onNetworkChanges$, connection);
  }

  public async activate(): Promise<void> {
    const wallet = typeof window !== 'undefined' && window.solana;
    await this.checkErrors(wallet);
    const publicKey = new PublicKey(wallet.publicKey.toBytes());
    this.isEnabled = true;
    wallet.on('disconnect', this.deActivate);

    this.wallet = wallet;
    this.selectedAddress = publicKey.toBase58();
    this.selectedChain = 'mainnet-beta';

    this.onNetworkChanges$.next(this.getNetwork());
    this.onAddressChanges$.next(this.selectedAddress);
  }

  private async handleDisconnect(wallet: PhantomWallet): Promise<void> {
    // HACK: Phantom doesn't reject or emit an event if the popup is closed
    const handleDisconnect = wallet._handleDisconnect;
    try {
      await new Promise<void>((resolve, reject) => {
        const connect = () => {
          wallet.off('connect', connect);
          resolve();
        };

        wallet._handleDisconnect = (...args: unknown[]) => {
          wallet.off('connect', connect);
          reject(new CustomError('User close modal'));
          return handleDisconnect.apply(wallet, args);
        };

        wallet.on('connect', connect);

        wallet.connect().catch((reason: unknown) => {
          wallet.off('connect', connect);
          reject(reason);
        });
      });
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new CustomError(error?.message);
      }
    } finally {
      wallet._handleDisconnect = handleDisconnect;
    }
  }

  private async checkErrors(wallet: PhantomWallet): Promise<void> {
    if (!wallet) {
      throw new WalletNotInstalledError();
    }
    if (!wallet.isPhantom) {
      throw new CustomError('Phantom is not instelled');
    }

    if (!wallet.isConnected) {
      await this.handleDisconnect(wallet);
    }

    if (!wallet.publicKey) {
      throw new CustomError('Connection error');
    }
  }
}
