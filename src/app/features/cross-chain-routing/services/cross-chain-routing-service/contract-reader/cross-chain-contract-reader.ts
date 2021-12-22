import { SolanaWeb3Public } from '@core/services/blockchain/blockchain-adapters/solana/solana-web3-public';
import { EthLikeWeb3Public } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { PublicKey } from '@solana/web3.js';
import {
  BlockchainLayout,
  BridgeConfig,
  BridgeConfigData,
  SolanaBlockchainConfig
} from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/solana/raydium-ccr-sctuct';
import { PDA_CONFIG } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/solana/solana-constants';
import { BLOCKCHAIN_UUID } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/solana/solana-blockchain-accounts-addresses';
import { NATIVE_SOL } from '@features/instant-trade/services/instant-trade-service/providers/solana/raydium-service/models/tokens';
import { Web3Public } from '@core/services/blockchain/blockchain-adapters/common/web3-public';
import { crossChainContractAbi } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/eth-like/cross-chain-contract-abi';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';

export class CrossChainContractReader {
  private readonly ethContractAbi = crossChainContractAbi;

  constructor(private readonly blockchainAdapter: SolanaWeb3Public | EthLikeWeb3Public) {}

  private isSolana(
    blockchainAdapter: Web3Public<unknown, unknown>
  ): blockchainAdapter is SolanaWeb3Public {
    return this.blockchainAdapter instanceof SolanaWeb3Public;
  }

  public async minTokenAmount(fromContractAddress: string): Promise<string> {
    if (this.isSolana(this.blockchainAdapter)) {
      const { data } = await this.blockchainAdapter.connection.getAccountInfo(
        new PublicKey(PDA_CONFIG)
      );
      const bridgeData = BridgeConfig.decode(data) as BridgeConfigData;
      return bridgeData.min_token_amount.toString();
    }

    // isEthLike
    return this.blockchainAdapter.callContractMethod<string>(
      fromContractAddress,
      this.ethContractAbi,
      'minTokenAmount'
    );
  }

  public async maxTokenAmount(fromContractAddress: string): Promise<string> {
    if (this.isSolana(this.blockchainAdapter)) {
      const { data } = await this.blockchainAdapter.connection.getAccountInfo(
        new PublicKey(PDA_CONFIG)
      );
      const bridgeData = BridgeConfig.decode(data) as BridgeConfigData;
      return bridgeData.max_token_amount.toString();
    }

    // isEthLike
    return this.blockchainAdapter.callContractMethod<string>(
      fromContractAddress,
      this.ethContractAbi,
      'maxTokenAmount'
    );
  }

  public async feeAmountOfBlockchain(
    contractAddress: string,
    numOfBlockchainInContract: number
  ): Promise<string> {
    if (this.isSolana(this.blockchainAdapter)) {
      const { data } = await this.blockchainAdapter.connection.getAccountInfo(
        new PublicKey(PDA_CONFIG)
      );
      const bridgeData = BridgeConfig.decode(data) as BridgeConfigData;
      return bridgeData.fee_amount_of_blockchain.toString();
    }

    // isEthLike
    return this.blockchainAdapter.callContractMethod(
      contractAddress,
      this.ethContractAbi,
      'feeAmountOfBlockchain',
      {
        methodArguments: [numOfBlockchainInContract]
      }
    );
  }

  public async blockchainCryptoFee(
    contractAddress: string,
    toBlockchainInContract: number
  ): Promise<number> {
    let fee, decimals;

    if (this.isSolana(this.blockchainAdapter)) {
      const account = new PublicKey(BLOCKCHAIN_UUID[toBlockchainInContract]);
      const { data } = await this.blockchainAdapter.connection.getAccountInfo(account);
      const blockchainData = BlockchainLayout.decode(data) as SolanaBlockchainConfig;
      fee = blockchainData.crypto_fee.toNumber();
      decimals = NATIVE_SOL.decimals;
    } else {
      // isEthLike
      fee = await this.blockchainAdapter.callContractMethod(
        contractAddress,
        this.ethContractAbi,
        'blockchainCryptoFee',
        {
          methodArguments: [toBlockchainInContract]
        }
      );
      decimals = 18;
    }

    return Web3Pure.fromWei(fee, decimals).toNumber();
  }

  public async isPaused(contractAddress: string): Promise<boolean> {
    if (this.isSolana(this.blockchainAdapter)) {
      const { data } = await this.blockchainAdapter.connection.getAccountInfo(
        new PublicKey(PDA_CONFIG)
      );
      const bridgeData = BridgeConfig.decode(data) as BridgeConfigData;
      return bridgeData?.is_paused || false;
    }

    // isEthLike
    return this.blockchainAdapter.callContractMethod<boolean>(
      contractAddress,
      this.ethContractAbi,
      'paused'
    );
  }

  public async getMaxGasPrice(contractAddress: string): Promise<string> {
    if (this.isSolana(this.blockchainAdapter)) {
      return null;
    }

    // isEthLike
    return this.blockchainAdapter.callContractMethod(
      contractAddress,
      this.ethContractAbi,
      'maxGasPrice'
    );
  }
}
