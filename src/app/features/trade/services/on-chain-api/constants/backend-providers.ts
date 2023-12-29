import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from 'rubic-sdk';

export const TO_BACKEND_ON_CHAIN_PROVIDERS = {
  // Missed dexes
  [ON_CHAIN_TRADE_TYPE['10K_SWAP']]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.ACRYPTOS]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.ALDRIN_EXCHANGE]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.ANNEX]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.ARTH_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.AURORA_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.AVNU]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.BABY_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.BALANCER]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.BI_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.CHERRY_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.CREMA_FINANCE]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.CROPPER_FINANCE]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.CROW_FI]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.CRO_DEX]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.CURVE]: 'Curve',
  [ON_CHAIN_TRADE_TYPE.DEFI_PLAZA]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.DEFI_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.DFYN]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.DYSTOPIA]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.ECHO_DEX]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.FINKUJIRA]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.JET_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.JUPITER]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.KYBER_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.LUA_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.MAVERICK]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.MDEX]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.MESH_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.MM_FINANCE]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.MOJITO_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.OKC_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.ONE_MOON]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.ONE_SOL]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.ORCA_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.OSMOSIS_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP_V3]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.PARA_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.POLYDEX]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.SABER_STABLE_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.SAROS_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.SERUM]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.SHIBA_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.SMOOTHY]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.SOLANA]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.SPACEFI_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.SPL_TOKEN_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.SUN_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.SYNAPSE]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.VOLTAGE_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.VVS_FINANCE]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.WAULT_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.WOO_FI]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.WYND]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.ZIP_SWAP]: 'unknown',
  // Rubic integrated dexes
  [ON_CHAIN_TRADE_TYPE.ALGEBRA]: 'algebra',
  [ON_CHAIN_TRADE_TYPE.APE_SWAP]: 'apeswap',
  [ON_CHAIN_TRADE_TYPE.JOE]: 'joe',
  [ON_CHAIN_TRADE_TYPE.ONE_INCH]: 'oneinch',
  [ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP]: 'pancakeswap',
  [ON_CHAIN_TRADE_TYPE.PANGOLIN]: 'pangolin',
  [ON_CHAIN_TRADE_TYPE.QUICK_SWAP]: 'quickswap',
  [ON_CHAIN_TRADE_TYPE.QUICK_SWAP_V3]: 'quickswap3',
  [ON_CHAIN_TRADE_TYPE.RAYDIUM]: 'raydium',
  [ON_CHAIN_TRADE_TYPE.SOLAR_BEAM]: 'solarbeam',
  [ON_CHAIN_TRADE_TYPE.SOUL_SWAP]: 'soulswap',
  [ON_CHAIN_TRADE_TYPE.SPIRIT_SWAP]: 'spiritswap',
  [ON_CHAIN_TRADE_TYPE.SPOOKY_SWAP]: 'spookyswap',
  [ON_CHAIN_TRADE_TYPE.SUSHI_SWAP]: 'sushiswap',
  [ON_CHAIN_TRADE_TYPE.TRISOLARIS]: 'trisolaris',
  [ON_CHAIN_TRADE_TYPE.UNISWAP_V2]: 'uniswap',
  [ON_CHAIN_TRADE_TYPE.UNI_SWAP_V3]: 'uniswap3',
  [ON_CHAIN_TRADE_TYPE.VERSE]: 'verse',
  [ON_CHAIN_TRADE_TYPE.VIPER_SWAP]: 'viper',
  [ON_CHAIN_TRADE_TYPE.WANNA_SWAP]: 'wannaswap',
  [ON_CHAIN_TRADE_TYPE.WRAPPED]: 'wrapped',
  [ON_CHAIN_TRADE_TYPE.ZAPPY]: 'zappy',
  [ON_CHAIN_TRADE_TYPE.ZRX]: 'zerox',
  [ON_CHAIN_TRADE_TYPE.OOLONG_SWAP]: 'oolong',
  [ON_CHAIN_TRADE_TYPE.JUPITER_SWAP]: 'jupiter',
  [ON_CHAIN_TRADE_TYPE.PHOTON_SWAP]: 'photon',
  [ON_CHAIN_TRADE_TYPE.OMNIDEX]: 'omnidex',
  [ON_CHAIN_TRADE_TYPE.YUZU_SWAP]: 'yuzuswap',
  [ON_CHAIN_TRADE_TYPE.NET_SWAP]: 'netswap',
  [ON_CHAIN_TRADE_TYPE.ELK]: 'elk',
  [ON_CHAIN_TRADE_TYPE.SURFDEX]: 'surfdex',
  [ON_CHAIN_TRADE_TYPE.TRADER]: 'defikingdoms',
  [ON_CHAIN_TRADE_TYPE.CLAIM_SWAP]: 'claimswap',
  [ON_CHAIN_TRADE_TYPE.WAGYU_SWAP]: 'wagyuswap',
  [ON_CHAIN_TRADE_TYPE.ASTRO_SWAP]: 'astroswap',
  [ON_CHAIN_TRADE_TYPE.PEGASYS]: 'pegasys',
  [ON_CHAIN_TRADE_TYPE.CRO_SWAP]: 'croswap',
  [ON_CHAIN_TRADE_TYPE.MUTE_SWAP]: 'muteswap',
  [ON_CHAIN_TRADE_TYPE.SYMBIOSIS_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.SYNC_SWAP]: 'syncswap',
  [ON_CHAIN_TRADE_TYPE.PULSEX_V1]: 'pulsex_v1',
  [ON_CHAIN_TRADE_TYPE.PULSEX_V2]: 'pulsex_v2',
  [ON_CHAIN_TRADE_TYPE.HORIZONDEX]: 'horizondex',
  [ON_CHAIN_TRADE_TYPE.BASE_SWAP]: 'baseswap',
  [ON_CHAIN_TRADE_TYPE.CRONA_SWAP]: 'cronaswap',
  [ON_CHAIN_TRADE_TYPE.BEAM_SWAP]: 'beamswap',
  [ON_CHAIN_TRADE_TYPE.HONEY_SWAP]: 'honeyswap',
  [ON_CHAIN_TRADE_TYPE.DODO]: 'dodo',
  [ON_CHAIN_TRADE_TYPE.J_SWAP]: 'jswap',
  [ON_CHAIN_TRADE_TYPE.OPEN_OCEAN]: 'openocean',
  [ON_CHAIN_TRADE_TYPE.REF_FINANCE]: 'reffinance',
  [ON_CHAIN_TRADE_TYPE.STELLA_SWAP]: 'stellaswap',
  [ON_CHAIN_TRADE_TYPE.UBE_SWAP]: 'ubeswap',
  [ON_CHAIN_TRADE_TYPE.IZUMI]: 'izumi',
  [ON_CHAIN_TRADE_TYPE.REN_BTC]: 'renbtc',
  [ON_CHAIN_TRADE_TYPE.AERODROME]: 'aerodrome',
  [ON_CHAIN_TRADE_TYPE.BRIDGERS]: 'bridgers',
  [ON_CHAIN_TRADE_TYPE.VOOI]: 'vooi',
  [ON_CHAIN_TRADE_TYPE.ALGEBRA_INTEGRAL]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.XY_DEX]: 'xy_dex',
  [ON_CHAIN_TRADE_TYPE.FUSIONX]: 'fusionx',
  [ON_CHAIN_TRADE_TYPE.LIFI]: 'lifi',
  [ON_CHAIN_TRADE_TYPE.RANGO]: 'rango'
} as const;

export const FROM_BACKEND_ON_CHAIN_PROVIDERS = {
  ...Object.entries(TO_BACKEND_ON_CHAIN_PROVIDERS).reduce(
    (acc, [clientName, backendName]) => ({
      ...acc,
      [backendName]: clientName
    }),
    {} as Record<ToBackendOnChainProvider, OnChainTradeType>
  )
} as const;

export type FromBackendOnChainProvider =
  (typeof FROM_BACKEND_ON_CHAIN_PROVIDERS)[keyof typeof FROM_BACKEND_ON_CHAIN_PROVIDERS];

export type ToBackendOnChainProvider =
  (typeof TO_BACKEND_ON_CHAIN_PROVIDERS)[keyof typeof TO_BACKEND_ON_CHAIN_PROVIDERS];
