import BigNumber from 'bignumber.js';
import { map, switchMap } from 'rxjs/operators';
import { iif, Observable, of, OperatorFunction, defer } from 'rxjs';
import { MinimalToken } from '@shared/models/tokens/minimal-token';
import { BlockchainName, InstantTrade, TRADE_TYPE, TradeType } from 'rubic-sdk';
import WrapTrade from '@features/swaps/features/instant-trade/models/wrap-trade';

/**
 * Compares two objects for equality.
 * @param object1 First object to compare.
 * @param object2 Second object to compare.
 */
export function compareObjects(object1: object, object2: object): boolean {
  return JSON.stringify(object1) === JSON.stringify(object2);
}

/**
 * Copies object.
 * @param object object to copy.
 */
export function copyObject<T>(object: T): T {
  return JSON.parse(JSON.stringify(object));
}

/**
 * Compares two addresses case insensitive.
 * @param address0 First address.
 * @param address1 Second address.
 */
export function compareAddresses(address0: string, address1: string): boolean {
  return address0?.toLowerCase() === address1?.toLowerCase();
}

/**
 * Compares two tokens (addresses and blockchains)
 * @param token0 First token.
 * @param token1 Second address.
 */
export function compareTokens(token0: MinimalToken, token1: MinimalToken): boolean {
  return (
    token0.address.toLowerCase() === token1.address.toLowerCase() &&
    token0.blockchain === token1.blockchain
  );
}

/**
 * Subtracts percent from given amount.
 * @param amount Given amount from which to subtract.
 * @param percent Percent to subtract.
 */
export function subtractPercent(
  amount: number | BigNumber | string,
  percent: number | BigNumber | string
): BigNumber {
  return new BigNumber(amount).multipliedBy(new BigNumber(1).minus(percent));
}

/**
 * Maps stream to void: emits, and completes the stream.
 */
export function mapToVoid(): OperatorFunction<unknown, void> {
  return switchMap(() => of(undefined));
}

/**
 * Await for side-effect action like switchMap, but not modify the stream
 */
export function switchTap<T>(handler: (arg: T) => Observable<unknown>): OperatorFunction<T, T> {
  return switchMap(arg => {
    return handler(arg).pipe(map(() => arg));
  });
}

/**
 * Combination of switchMap and iif.
 * @param condition Condition which Observable should be chosen.
 * @param trueResultFn An Observable that will be subscribed if condition is true.
 * @param falseResultFn An Observable that will be subscribed if condition is false.
 */
export function switchIif<A = void, T = never, F = never>(
  condition: (args: A) => boolean,
  trueResultFn: (args: A) => Observable<T>,
  falseResultFn: (args: A) => Observable<F>
): OperatorFunction<A, T | F> {
  return switchMap((args: A) =>
    iif(
      () => condition(args),
      defer(() => trueResultFn(args)),
      defer(() => falseResultFn(args))
    )
  );
}

export function getBigNumber(num: unknown): number {
  return num === undefined || num === null ? 0 : parseFloat(num.toString());
}

export function notNull<T>(value: T | null): value is T {
  return value !== null;
}

export function isNull<T>(value: T | null): value is null {
  return value === null;
}

/**
 * Removes all nullable elements from array.
 * @param elements Array of elements.
 */
export function shakeUndefiledItem<T>(elements: T[]): NonNullable<T>[] {
  return elements.filter(element => element != null) as NonNullable<T>[];
}

/**
 * Resolve all promises in array and apply map lambda to each element.
 * @param elements Array of transactions.
 * @param mapFn Lambda function which applies to eah element.
 */
export async function asyncMap<T, U>(
  elements: T[],
  mapFn: (element: T, index: number) => U | Promise<U>
): Promise<(Awaited<U> | undefined)[]> {
  return await Promise.all(elements.map(async (element, idx) => await mapFn(element, idx)));
}

/**
 * Returns the human readable percentage value received from the contract.
 * @param value percent value received from contract.
 */
export function parseWeb3Percent(value: string | number): number {
  return Number(value) / Math.pow(10, 29);
}

/**
 * Checks if value is null or undefined.
 */
export function isNil(value: unknown): boolean {
  return value === undefined || value === null;
}

export function getItSwapParams(trade: InstantTrade | WrapTrade): {
  fromAddress: string;
  fromSymbol: string;
  fromAmount: BigNumber;
  fromPrice: number;
  fromDecimals: number;
  toAddress: string;
  toSymbol: string;
  toAmount: BigNumber;
  toPrice: number;
  toDecimals: number;
  blockchain: BlockchainName;
  type: TradeType;
} {
  if (trade instanceof InstantTrade) {
    return {
      fromAddress: trade.from.address,
      fromSymbol: trade.from.symbol,
      fromAmount: trade.from.tokenAmount,
      fromPrice: trade.from.price.toNumber(),
      fromDecimals: trade.from.decimals,
      toAddress: trade.to.address,
      toSymbol: trade.to.symbol,
      toAmount: trade.to.tokenAmount,
      toPrice: trade.to.price.toNumber(),
      toDecimals: trade.to.decimals,
      blockchain: trade.from.blockchain,
      type: trade.type
    };
  }
  return {
    fromAddress: trade.from.token.address,
    fromSymbol: trade.from.token.symbol,
    fromAmount: trade.from.amount,
    fromPrice: trade.from.token.price,
    fromDecimals: trade.from.token.decimals,
    toAddress: trade.to.token.address,
    toSymbol: trade.to.token.symbol,
    toAmount: trade.to.amount,
    toPrice: trade.to.token.price,
    toDecimals: trade.to.token.decimals,
    blockchain: trade.blockchain,
    type: TRADE_TYPE.WRAPPED
  };
}
