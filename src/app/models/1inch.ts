import {EventEmitter, Injectable, Output} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable, Subscriber} from "rxjs";
import BigNumber from "bignumber.js";

interface TokenInterface {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
}
export type TokensMap<T> = { [key in any]: T };
const api = {
    host: 'https://api.1inch.exchange',
    version: 'v1.1'
}

const slippageValue = 1;
const swapContractAddress = '0x111111125434b319222CdBf8C261674aDB56F3ae';

@Injectable({
    providedIn: "root",
})
export class OneInchService {
    private availableTokens: TokensMap<TokenInterface>;
    private tokenOnLoadEmitter = new EventEmitter<any>();
    private tokensAutocompleteList: any[] = [];
    constructor(
        private httpClient: HttpClient
    ) {
        this.loadTokens().then((result) => {
            result.ETH.address = '0x0000000000000000000000000000000000000000';
            this.availableTokens = result;
            this.tokenOnLoadEmitter.emit();
        });
    }

    private getHttpPromise(path, method, params?: {}) {
        let url = `${api.host}/${api.version}/${path}`;
        params = params || {};
        switch (method) {
            case 'get':
                const pairsParams = [];
                for (let k in params) {
                    pairsParams.push(`${k}=${params[k]}`);
                }
                url+= pairsParams.length ? '?' + pairsParams.join('&') : '';
                break;
        }
        return this.httpClient[method](url).toPromise();
    }

    private async loadTokens() {
        return this.getHttpPromise('tokens', 'get');
    }

    public getAutocompleteTokensList(): any {
        return this.tokensAutocompleteList;
    }

    public onLoadTokens(): EventEmitter<any> {
        if (this.availableTokens) {
            setTimeout(() => {
                for (let k in this.availableTokens) {
                    const t = this.availableTokens[k];
                    const cmcToken = window['cmc_tokens'].find((cmcT) => {
                        return k === cmcT.token_short_name && t.address.toLowerCase() === cmcT.address.toLowerCase();
                    });
                    this.tokensAutocompleteList.push({
                        address: t.address,
                        cmc_id: cmcToken ? cmcToken.cmc_id : null,
                        decimals: t.decimals,
                        image_link: cmcToken ?
                            cmcToken.image_link :
                            './assets/images/icons/coins/empty.svg',
                        platform: "ethereum",
                        rank: cmcToken ? cmcToken.rank : null,
                        rate: cmcToken ? cmcToken.rate : null,
                        token_name: t.name,
                        isEthereum: cmcToken ? cmcToken.isEthereum : null,
                        token_short_name: k
                    });
                }

                this.tokensAutocompleteList.sort((a, b) => {
                    const aRank = a.rank || 100000;
                    const bRank = b.rank || 100000;
                    return aRank > bRank ? 1 : aRank < bRank ? -1 : 0;
                });

                this.tokenOnLoadEmitter.emit();
            });
        }

        return this.tokenOnLoadEmitter;
    }

    public checkToken(token): boolean {
        const availableToken = this.availableTokens[token.token_short_name];
        return availableToken && (availableToken.address.toLowerCase() === token.address.toLowerCase());
    }

    public checkTokensPair(quoteToken, baseToken): boolean {
        return this.checkToken(baseToken) && this.checkToken(quoteToken);
    }

    private checkSwap(params) {
        let deepLevel = 0;
        let latestResult;

        const requestParams = {
            gasPrice: '35000000000',
            mainRouteParts:20,
            parts: 20,
            protocolWhiteList: 'WETH,UNISWAP_V1,UNISWAP_V2,SUSHI,MOONISWAP,BALANCER,COMPOUND,CURVE,CHAI,OASIS,KYBER,AAVE,IEARN,BANCOR,PMM1,CREAMSWAP,SWERVE,BLACKHOLESWAP,DODO,VALUELIQUID,SHELL',
            virtualParts: 20,
            protocols: 'WETH,UNISWAP_V1,UNISWAP_V2,SUSHI,MOONISWAP,BALANCER,COMPOUND,CURVE,CHAI,OASIS,KYBER,AAVE,IEARN,BANCOR,PMM1,CREAMSWAP,SWERVE,BLACKHOLESWAP,DODO,VALUELIQUID,SHELL',
            deepLevels: '1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1',
            mainRoutePartsList: '1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1',
            partsList: '1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1',
            virtualPartsList: '1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1'
        };

        for (let k in params) {
            requestParams[k] = params[k];
        }

        const getQuery = (params) => {
            params.deepLevel = deepLevel;
            const pairsParams = [];
            for (let k in params) {
                pairsParams.push(`${k}=${params[k]}`);
            }
            return pairsParams.join('&');
        };

        return new Promise((resolve) => {
            const sendRequest = () => {
                deepLevel++;
                const query = getQuery(requestParams);
                this.httpClient.get(`https://pathfinder-v3.1inch.exchange/v1.0/quotes?${query}`).toPromise().then((result: any) => {
                    if (deepLevel < 2) {
                        latestResult = result.bestResult;
                        sendRequest();
                    } else {
                        let bestResult;
                        const oldToAmountValue = new BigNumber(latestResult.toTokenAmount);
                        const currToAmountValue = new BigNumber(result.toTokenAmount);
                        if (oldToAmountValue.minus(currToAmountValue).isPositive()) {
                            bestResult = latestResult.bestResult;
                        } else {
                            bestResult = result.bestResult;
                        }
                        resolve(bestResult);
                    }
                });
            };
            sendRequest();
        });
    }

    private static checkETHAddress(address) {
        if (address === '0x0000000000000000000000000000000000000000') {
            return '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
        }
        return address;
    }

    public getQuote(params) {
        params = params || {};
        const fromAddress = this.availableTokens[params.fromTokenSymbol].address;
        const toAddress = this.availableTokens[params.toTokenSymbol].address;
        return this.checkSwap({
            fromTokenAddress: OneInchService.checkETHAddress(fromAddress),
            toTokenAddress: OneInchService.checkETHAddress(toAddress),
            amount: params.amount
        });
    }

    private async getGasPrice() {
        return this.httpClient.get('https://gas-price-api.1inch.exchange/v1.0').toPromise().then((gasPrices) => {
            return gasPrices['standard'];
        });
    };

    public async getSwap(params, queryData) {
        const fromAddress = this.availableTokens[params.fromTokenSymbol].address;
        const toAddress = this.availableTokens[params.toTokenSymbol].address;
        const ethValue = params.fromTokenSymbol === 'ETH' ? params.amount : 0
        const requestParams = {
            fromTokenAddress: OneInchService.checkETHAddress(fromAddress),
            toTokenAddress: OneInchService.checkETHAddress(toAddress),
            amount: params.amount,
            guaranteedAmount: queryData.toTokenAmount,
            minTokensAmount: new BigNumber(queryData.toTokenAmount).div(100).times(100 - slippageValue).dp(0, 1).toString(10),
            allowedSlippagePercent: slippageValue,
            burnChi: false,
            enableEstimate: false,
            ethValue: ethValue,
            gasPrice: await this.getGasPrice(),
            referrerAddress: '0xce85a63F5093b28F15aa7C2C1f1b4b0037011cbE',
            fee: 0.1,
            walletAddress: params.fromAddress,
            pathfinderData: {
                routes: queryData.routes,
                mainParts: 20,
                splitParts: 20,
                virtualParts:20
            },
            allowPartialFill: true
        };

        return this.httpClient.post(
            'https://swap-builder.1inch.exchange/v2.0/swap/build',
            requestParams
        ).toPromise().then((result: any) => {
            return {
                from: params.FromAddress,
                data: result.data,
                to: swapContractAddress,
                value: result.ethValue,
            }
        });
    }
}
