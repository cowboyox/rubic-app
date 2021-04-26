import { IBlockchain } from '../../../../shared/models/blockchain/IBlockchain';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import SwapToken from '../../../../shared/models/tokens/SwapToken';

export abstract class PrivateProvider {
  /**
   * @description default value for transactions gasLimit. Required for tests provider stub
   */
  public readonly defaultGasLimit: string | undefined = undefined;

  /**
   * @description is the blockchain provider installed
   */
  abstract get isInstalled(): boolean;

  /**
   * @description is the blockchain provider activated
   */
  abstract get isActive(): boolean;

  /**
   * @description current selected wallet address
   * @return current selected wallet address or undefined if isActive is false
   */
  get address(): string {
    if (!this.isActive) {
      return undefined;
    }
    return this.getAddress();
  }

  protected abstract getAddress(): string;

  /**
   * @description current selected network
   * @return current selected network or undefined if isActive is false
   */
  get network(): IBlockchain {
    if (!this.isActive) {
      return undefined;
    }
    return this.getNetwork();
  }

  protected abstract getNetwork(): IBlockchain;

  /**
   * @description current selected network name
   * @return current selected network name or undefined if isActive is false
   */
  get networkName(): BLOCKCHAIN_NAME {
    return this.network?.name;
  }

  /**
   * @description activate the blockchain provider
   */
  public abstract activate(): Promise<void>;

  /**
   * @description deactivate the blockchain provider
   */
  public abstract deActivate(): void;

  /**
   * @description opens a window with suggestion to add token to user's wallet
   * @param token token to add
   */
  public abstract addToken(token: SwapToken): Promise<void>;
}
