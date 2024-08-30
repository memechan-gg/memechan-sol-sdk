import {
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  ComputeBudgetProgram,
  GetProgramAccountsFilter,
  Connection,
  AccountInfo,
} from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { IDL, Staking } from "./schema/types/staking";
import {
  NATIVE_MINT,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  getRewardPDA,
  getRewardSigner,
  getRewardStatePDA,
  getStakingStatePDA,
  getStakingStateSigner,
  getUserRewardsPDA,
  getUserStakeSigner,
} from "./utils";
import { COMPUTE_UNIT_PRICE, TOKEN_INFOS, VCHAN_TOKEN_DECIMALS, WSOL_DECIMALS } from "../config/config";
import { Reward, UserRewards, UserStake } from "./schema/codegen/accounts";
import BigNumber from "bignumber.js";
import { ParsedReward } from "./types";

export class VeChanStakingClient {
  public program: Program<Staking>;
  private vChanMint: PublicKey;
  private veChanMint: PublicKey;
  private stakingState: PublicKey;
  private stakingStateSigner: PublicKey;
  private rewardState: PublicKey;

  constructor(programId: PublicKey, provider?: AnchorProvider) {
    this.program = new Program(IDL, programId, provider);
    this.vChanMint = TOKEN_INFOS.vCHAN.mint;
    this.veChanMint = TOKEN_INFOS.veCHAN.mint;
    this.stakingState = getStakingStatePDA(this.vChanMint, this.veChanMint);
    this.stakingStateSigner = getStakingStateSigner(this.stakingState);
    this.rewardState = getRewardStatePDA(NATIVE_MINT, this.stakingState);
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

  public async fetchUserRewardsForStakes(
    stakeAddresses: PublicKey[],
  ): Promise<{ data: UserRewards | null; address: PublicKey; stakeAddress: PublicKey }[]> {
    const rewardState = this.rewardState;

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
        stakeAddress,
      };
    });
  }

  public async fetchRewards() {
    return this.fetchRewardsByMintState(this.stakingState, NATIVE_MINT);
  }

  public async fetchRewardsByMintState(stakingState: PublicKey, mint: PublicKey) {
    const batchSize = 100;
    const rewardState = getRewardStatePDA(mint, stakingState);
    const rewardAddresses = Array.from(Array(batchSize).keys()).map((i) => getRewardPDA(rewardState, i));
    return VeChanStakingClient.fetchRewardsByIds(rewardAddresses, this.program.provider.connection);
  }

  public static async fetchRewardsByIds(rewardPubkeys: PublicKey[], connection: Connection) {
    const accountInfos = await connection.getMultipleAccountsInfo(rewardPubkeys);

    const foundAccountsData: { accountInfo: AccountInfo<Buffer>; index: number }[] = accountInfos.reduce(
      (dataArray: { accountInfo: AccountInfo<Buffer>; index: number }[], accountInfo, index) => {
        if (accountInfo !== null) {
          dataArray.push({ accountInfo, index });
        }

        return dataArray;
      },
      [],
    );

    const parsedRewards: ParsedReward[] = foundAccountsData.map(({ accountInfo, index }) => {
      const id = rewardPubkeys[index];
      const decodedTicket = Reward.decode(accountInfo.data);
      const jsonReward = decodedTicket.toJSON();

      return {
        id,
        jsonFields: jsonReward,
        fields: decodedTicket,
        rewardAmountWithDecimals: new BigNumber(jsonReward.rewardAmount).dividedBy(WSOL_DECIMALS).toString(),
      };
    });

    return parsedRewards;
  }

  public static getRewardAPR(reward: ParsedReward, vChanPrice: BigNumber, solPrice: BigNumber) {
    const timeTotalDays = new BigNumber(30);
    const totalRewardUsdValue = new BigNumber(reward.fields.rewardAmount.toString())
      .multipliedBy(solPrice)
      .dividedBy(WSOL_DECIMALS);

    const totalStakeUsdValue = new BigNumber(reward.fields.stakesTotal.toString())
      .multipliedBy(vChanPrice)
      .dividedBy(10 ** VCHAN_TOKEN_DECIMALS);

    return totalRewardUsdValue.multipliedBy(new BigNumber(365)).dividedBy(totalStakeUsdValue).dividedBy(timeTotalDays);
  }

  public static getRewardsAvgAPR(rewards: ParsedReward[], vChanPrice: BigNumber, solPrice: BigNumber) {
    const aprs: BigNumber[] = rewards.map((reward) => VeChanStakingClient.getRewardAPR(reward, vChanPrice, solPrice));
    const totalAPR = aprs.reduce((sum, current) => sum.plus(current), new BigNumber(0));
    return totalAPR.dividedBy(rewards.length);
  }

  public static getAvgAPR(allRewards: ParsedReward[], vChanPrice: BigNumber, solPrice: BigNumber) {
    let rewardTotal = new BN(0);
    let stakeTotalAvg = new BN(0);
    for (const reward of allRewards) {
      rewardTotal = rewardTotal.add(reward.fields.rewardAmount);
      stakeTotalAvg = stakeTotalAvg.add(reward.fields.stakesTotal);
    }

    stakeTotalAvg = stakeTotalAvg.div(new BN(allRewards.length));

    const timeTotal = allRewards[allRewards.length - 1].fields.timestamp.sub(allRewards[0].fields.timestamp);
    const timeTotalDays = new BigNumber(timeTotal.div(new BN(3600 * 24)).toString());
    const totalRewardUsdValue = new BigNumber(rewardTotal.toString()).dividedBy(WSOL_DECIMALS).multipliedBy(solPrice);

    const totalStakeUsdValue = new BigNumber(stakeTotalAvg.toString())
      .dividedBy(10 ** VCHAN_TOKEN_DECIMALS)
      .multipliedBy(vChanPrice);

    return totalRewardUsdValue.multipliedBy(new BigNumber(365)).dividedBy(totalStakeUsdValue).dividedBy(timeTotalDays);
  }

  /**
   * Get the number of tokens that can be withdrawn by user for the provided userRewards account
   */
  public static getEligibleForWithdrawalAmountRaw(
    rewards: ParsedReward[],
    userStake: UserStake,
    userRewards: UserRewards,
  ) {
    let acc = new BN(0);
    const eligibleRewards = this.getEligibleRewards(rewards, userStake, userRewards);
    eligibleRewards.forEach(
      (reward) => (acc = acc.add(reward.fields.rewardAmount.mul(userStake.veAmount).div(reward.fields.stakesTotal))),
    );
    return acc;
  }

  /**
   * Get all eligible rewards from parsed rewards array.
   *
   * For a reward to be eligible for withdrawal using provided userStake, it needs to satisfy all of the following conditions
   * 1. Reward timestamp is after the stake timestamp
   * 2. Reward timestamp is before the unstake timestamp if any
   * 3. Reward is not withdrawn from already
   */
  public static getEligibleRewards(rewards: ParsedReward[], userStake: UserStake, userRewards: UserRewards) {
    const eligibleRewards = [];
    for (let i = 0; i < rewards.length; i++) {
      const reward = rewards[i];
      const rts = reward.fields.timestamp;

      const eligibleStakedBefore = rts.gt(userStake.stakedAt);
      const eligibleUnstakedAfter = userStake.withdrawnAt.eq(new BN(0)) || userStake.withdrawnAt.gt(rts);
      const eligibleNotWithdrawnFrom = userRewards.withdrawnNumber.lt(reward.fields.number);

      if (eligibleStakedBefore && eligibleUnstakedAfter && eligibleNotWithdrawnFrom) {
        eligibleRewards.push(reward);
      }
    }
    return eligibleRewards;
  }

  /**
   * Get the first eligible reward number from parsed rewards array.
   *
   * @returns the number of first eligible reward or -1
   **/
  public static getFirstEligibleRewardNumber(rewards: ParsedReward[], userStake: UserStake, userRewards: UserRewards) {
    const eligible = this.getEligibleRewardNumbers(rewards, userStake, userRewards);

    if (eligible.length > 0) {
      return eligible[0];
    }

    return -1;
  }

  /**
   * Get all eligible reward numbers from parsed rewards array.
   **/
  public static getEligibleRewardNumbers(rewards: ParsedReward[], userStake: UserStake, userRewards: UserRewards) {
    return this.getEligibleRewards(rewards, userStake, userRewards).map((reward) => reward.fields.number.toNumber());
  }

  /**
   * Craete a new UserRewards account creation instruction
   *
   *  UserRewards should be created alongside Stake
   **/
  async getCreateUserRewardsInstuction(userPublicKey: PublicKey, stake: PublicKey) {
    const userRewards = getUserRewardsPDA(this.rewardState, stake);

    const createUserRewardsInstruction = await this.program.methods
      .createUserRewards()
      .accounts({
        userRewards,
        mint: NATIVE_MINT,
        rewardState: this.rewardState,
        signer: userPublicKey,
        stake: stake,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    return createUserRewardsInstruction;
  }

  /**
   * Create a transaction which skips rewards the stake is ineligible for
   * Skip rewards should be used when userRewards account's withdrawn_number field is less than the first eligible reward number
   * e.g. first eligible (stake timestamp < rewards timestamp < unstake timestamp) reward for said mint is number 5, and
   * our user just created their userRewards so it has 0 in the withdrawn_number field
   */
  async buildSkipRewardsTransaction(userRewards: PublicKey, stake: PublicKey, lastRewardNumber: number) {
    const skipRewardsInstruction = await this.program.methods
      .userSkipRewards(new BN(lastRewardNumber - 1), new BN(lastRewardNumber))
      .accounts({
        userRewards,
        rewardPrev: getRewardPDA(this.rewardState, lastRewardNumber - 1),
        rewardNext: getRewardPDA(this.rewardState, lastRewardNumber),
        rewardState: this.rewardState,
        stake,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE,
    });

    const transaction = new Transaction().add(addPriorityFee, skipRewardsInstruction);

    return { transaction };
  }

  /**
   * Get WithdrawReward instruction
   */
  async getWithdrawRewardInstuction(
    userPublicKey: PublicKey,
    stake: PublicKey,
    userRewards: PublicKey,
    rewardNumber: number,
  ) {
    const reward = getRewardPDA(this.rewardState, rewardNumber);
    const rewardSigner = getRewardSigner(reward);
    const vault = getAssociatedTokenAddressSync(NATIVE_MINT, rewardSigner, true);
    const userVault = getAssociatedTokenAddressSync(NATIVE_MINT, userPublicKey, false);

    const withdrawRewardInstruction = await this.program.methods
      .userWithdrawReward(new BN(rewardNumber))
      .accounts({
        userRewards,
        userVault,
        vault,
        reward,
        rewardSigner,
        rewardState: this.rewardState,
        signer: userPublicKey,
        stake,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    return withdrawRewardInstruction;
  }

  /**
   * Get WithdrawReward transaction
   *
   * WithdrawReward should be called on the first of the currently eligible (stake timestamp < rewards timestamp < unstake timestamp) rewards.
   * You can add multiple WithdrawRewards to the same transaction to withdraw from multiple reward accounts consecutively.
   */
  async buildWithdrawRewardTransaction(
    userPublicKey: PublicKey,
    stake: PublicKey,
    userRewards: PublicKey,
    rewardNumber: number,
  ) {
    const userVault = getAssociatedTokenAddressSync(NATIVE_MINT, userPublicKey, false);

    const createUserVaultInstuction = createAssociatedTokenAccountIdempotentInstruction(
      userPublicKey,
      userVault,
      userPublicKey,
      NATIVE_MINT,
    );

    const withdrawRewardInstruction = await this.getWithdrawRewardInstuction(
      userPublicKey,
      stake,
      userRewards,
      rewardNumber,
    );

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE,
    });

    const transaction = new Transaction().add(addPriorityFee, createUserVaultInstuction, withdrawRewardInstruction);

    return transaction;
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

    const createUserRewardsInstruction = await this.getCreateUserRewardsInstuction(userPublicKey, stake.publicKey);

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE,
    });

    const transaction = new Transaction().add(
      addPriorityFee,
      vaultCTX,
      userVeAccCIx,
      stakeTokensInstruction,
      createUserRewardsInstruction,
    );

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
