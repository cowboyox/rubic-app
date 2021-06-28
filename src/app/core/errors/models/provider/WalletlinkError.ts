import { RubicError } from 'src/app/core/errors/models/RubicError';

export class WalletlinkError extends RubicError {
  public comment: string;

  constructor() {
    super('text', 'errors.noQrCode');
    Object.setPrototypeOf(this, WalletlinkError.prototype);
  }
}
