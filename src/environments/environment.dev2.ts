import { STAKING_CONFIG_DEVELOP } from './constants/staking';

export const ENVIRONMENT = {
  environmentName: 'dev2',
  production: false,

  apiBaseUrl: '//testnet-api.rubic.exchange/api',
  apiTokenUrl: 'https://testnet-tokens.rubic.exchange/api',
  websocketBaseUrl: 'wss://dev-api.rubic.exchange/ws',

  staking: STAKING_CONFIG_DEVELOP,

  zrxAffiliateAddress: undefined as string,
  onramperApiKey: 'pk_prod_01H03RG3KT4TEKY80D82R1N4ZS'
};
