import {
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  ComputeBudgetProgram,
  GetProgramAccountsFilter,
} from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { IDL, Staking } from "./schema/types/staking";
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  getRewardStatePDA,
  getStakingStatePDA,
  getStakingStateSigner,
  getUserRewardsPDA,
  getUserStakeSigner,
} from "./utils";
import { COMPUTE_UNIT_PRICE, TOKEN_INFOS } from "../config/config";
import { UserRewards, UserStake } from "./schema/codegen/accounts";

export class VeChanStakingClient {
  public program: Program<Staking>;
  private vChanMint: PublicKey;
  private veChanMint: PublicKey;
  private stakingState: PublicKey;
  private stakingStateSigner: PublicKey;

  constructor(programId: PublicKey, provider?: AnchorProvider) {
    this.program = new Program(IDL, programId, provider);
    this.vChanMint = TOKEN_INFOS.vCHAN.mint;
    this.veChanMint = TOKEN_INFOS.veCHAN.mint;
    this.stakingState = getStakingStatePDA(this.vChanMint, this.veChanMint);
    this.stakingStateSigner = getStakingStateSigner(this.stakingState);
  }

  public async fetchStakesForUser(user: PublicKey): Promise<{ data: UserStake; address: PublicKey }[]> {
    const filters: GetProgramAccountsFilter[] = [
      {
        memcmp: {
          bytes: user.toBase58(),
          offset: 8,
        },
      },
    ];
    const rawUserStakes = await this.program.account.userStake.all(filters);
    const stakes = rawUserStakes.map((el) => ({
      data: new UserStake(el.account),
      address: el.publicKey,
    }));

    return stakes;
  }

  public async fetchRewardsForUserStakes(
    stakeAddresses: PublicKey[],
  ): Promise<{ data: UserRewards | null; address: PublicKey }[]> {
    const rewardState = getRewardStatePDA(TOKEN_INFOS.CHAN.mint);

    const allRewardAddresses = stakeAddresses.map((stakeAddress) => getUserRewardsPDA(rewardState, stakeAddress));

    const raw = await UserRewards.fetchMultiple(this.program.provider.connection, allRewardAddresses);

    // Create a map of addresses to their corresponding data
    const addressToDataMap = new Map<string, UserRewards | null>();
    raw.forEach((data, index) => {
      const addressString = allRewardAddresses[index].toBase58();
      addressToDataMap.set(addressString, data);
    });

    // Map the original stake addresses to their reward data
    return stakeAddresses.map((stakeAddress) => {
      const rewardAddress = getUserRewardsPDA(rewardState, stakeAddress);
      const addressString = rewardAddress.toBase58();
      return {
        data: addressToDataMap.get(addressString) || null,
        address: rewardAddress,
      };
    });
  }

  async buildStakeTokensTransaction(
    time: BN,
    amount: BN,
    userPublicKey: PublicKey,
    userVAcc: PublicKey,
    userVeAcc: PublicKey,
    vesting: PublicKey | null,
  ): Promise<{ transaction: Transaction; stake: Keypair }> {
    const stake = Keypair.generate();
    const stakeSigner = getUserStakeSigner(stake.publicKey);
    const vault = getAssociatedTokenAddressSync(this.vChanMint, stakeSigner, true);

    const vaultCTX = createAssociatedTokenAccountIdempotentInstruction(
      userPublicKey,
      vault,
      stakeSigner,
      this.vChanMint,
    );

    const userVeAccCIx = createAssociatedTokenAccountIdempotentInstruction(
      userPublicKey,
      userVeAcc,
      userPublicKey,
      this.veChanMint,
      TOKEN_2022_PROGRAM_ID,
    );

    const stakeTokensInstruction = await this.program.methods
      .stakeTokens(time, amount)
      .accounts({
        signer: userPublicKey,
        stake: stake.publicKey,
        stakeSigner: stakeSigner,
        stakingState: this.stakingState,
        stakingStateSigner: this.stakingStateSigner,
        vesting,
        userVAcc,
        userVeAcc,
        vault: vault,
        vMint: this.vChanMint,
        veMint: this.veChanMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        token2022: TOKEN_2022_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE,
    });

    const transaction = new Transaction().add(addPriorityFee, vaultCTX, userVeAccCIx, stakeTokensInstruction);

    return { transaction, stake };
  }

  async buildUnstakeTokensTransaction(userPublicKey: PublicKey, stake: PublicKey): Promise<Transaction> {
    const stakeSigner = getUserStakeSigner(stake);
    const userVAcc = getAssociatedTokenAddressSync(this.vChanMint, userPublicKey);
    const userVeAcc = getAssociatedTokenAddressSync(this.veChanMint, userPublicKey, false, TOKEN_2022_PROGRAM_ID);
    const vault = getAssociatedTokenAddressSync(this.vChanMint, stakeSigner, true);

    const unstakeTokensInstruction = await this.program.methods
      .unstakeTokens()
      .accounts({
        signer: userPublicKey,
        stake,
        stakeSigner: stakeSigner,
        stakingState: this.stakingState,
        userVAcc,
        userVeAcc,
        vault,
        vMint: this.vChanMint,
        veMint: this.veChanMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        token2022: TOKEN_2022_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE,
    });

    const transaction = new Transaction().add(addPriorityFee, unstakeTokensInstruction);

    return transaction;
  }
}
