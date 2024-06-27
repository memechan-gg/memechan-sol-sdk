import { Program } from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
} from "@memechan/spl-token";
import { ComputeBudgetProgram, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import BN from "bn.js";
import { CHAN_TOKEN_DECIMALS, COMPUTE_UNIT_PRICE, MAX_TRANSACTION_SIZE, VESTING_PROGRAM_ID } from "../config/config";
import { TokenAccountRaw } from "../helius-api/types";
import { getTxSize } from "../util/get-tx-size";
import { getTxCopy } from "../util/getTxCopy";
import { Vesting } from "./schema/codegen/accounts";
import { withdraw } from "./schema/codegen/instructions";
import { IDL, Lockup } from "./schema/types/lockup";
import {
  FetchVestingByUserArgs,
  GetClaimTransactionArgs,
  GetCreateVestingTransactionArgs,
  GetVestingClaimableAmountArgs,
  GetVestingPdaArgs,
  PatsHolderMapWithIndex,
  UserVestingData,
} from "./types";

export class VestingClient {
  public constructor(public id: PublicKey) {}

  public static VESTING_NUMBER_START = 1;
  public static MAX_VESTING_DAYS_COUNT = 14;

  public static NOT_ALLOWED_ADDRESSES_FOR_VESTING_LIST = [
    "5VCwKtCXgCJ6kit5FybXjvriW3xELsFDhYrPSqtJNmcD",
    "u6PJ8DtQuPFnfmwHbGFULQ4u4EgjDiyYKjVEsynXq2w",

    "4MPQFbnjvG9GAwYhaZ6aavK7oC8cbi4nDQfkBj1qxqc6",
    "4yhj7jv9q7cYNbBexrxinSEV9iiVNAh429swdYqMUbid",
  ];

  public static getVestingPDA({ vestingNumber, user }: GetVestingPdaArgs) {
    // 8 bytes array
    const dv = new DataView(new ArrayBuffer(8), 0);
    // set u64 in little endian format
    dv.setBigUint64(0, BigInt(vestingNumber), true);

    // find pda
    const pda = PublicKey.findProgramAddressSync(
      [Buffer.from("vesting"), user.toBytes(), new Uint8Array(dv.buffer)],
      new PublicKey(VESTING_PROGRAM_ID),
    )[0];

    return pda;
  }

  static getVestingSigner(vestingId: PublicKey) {
    const pda = PublicKey.findProgramAddressSync(
      [Buffer.from("vesting_signer"), vestingId.toBytes()],
      new PublicKey(VESTING_PROGRAM_ID),
    )[0];

    return pda;
  }

  public static async fetchVestingByUser({ user, connection }: FetchVestingByUserArgs) {
    const vestingId = VestingClient.getVestingPDA({ vestingNumber: VestingClient.VESTING_NUMBER_START, user });
    const vesting = await Vesting.fetch(connection, vestingId);

    return vesting;
  }

  public static getVestingClaimableAmount({ vesting }: GetVestingClaimableAmountArgs) {
    const currentTsSeconds = Date.now() / 1000;

    if (currentTsSeconds < vesting.startTs.toNumber()) {
      return new BigNumber(0);
    }
    if (currentTsSeconds >= vesting.endTs.toNumber()) {
      return new BigNumber(vesting.outstanding.toString());
    }

    const duration = vesting.endTs.sub(vesting.startTs);
    const periodSeconds = duration.div(vesting.periodCount);
    const timePassed = new BN(currentTsSeconds).sub(vesting.startTs);

    const periodsPassed = timePassed.divmod(periodSeconds, "div").div;

    const totalAvailable = vesting.startBalance.mul(periodsPassed).div(vesting.periodCount);
    const withdrawn = vesting.startBalance.sub(vesting.outstanding);

    const availableTokens = totalAvailable.sub(withdrawn);

    return new BigNumber(availableTokens.toString());
  }

  public static async getClaimTransaction({
    amount,
    vesting: { beneficiary, mint, vault },
    vestingId,
    transaction,
  }: GetClaimTransactionArgs) {
    const tx = transaction ?? new Transaction();

    const userTokenAccount = getAssociatedTokenAddressSync(mint, beneficiary, false);

    const createATAIdempotentInstruction = createAssociatedTokenAccountIdempotentInstruction(
      beneficiary,
      userTokenAccount,
      beneficiary,
      mint,
    );

    tx.add(createATAIdempotentInstruction);

    const withdrawIx = withdraw(
      { amount: amount },
      {
        beneficiary,
        userTokenAccount,
        vault,
        vesting: vestingId,
        vestingSigner: VestingClient.getVestingSigner(vestingId),

        tokenProgram: TOKEN_PROGRAM_ID,
      },
    );

    tx.add(withdrawIx);

    return tx;
  }

  public static async getCreateVestingTransaction({
    beneficiary,
    admin,
    mint,
    startTs,
    endTs,
    amount,
  }: GetCreateVestingTransactionArgs) {
    const vestingProgram = new Program<Lockup>(IDL, VESTING_PROGRAM_ID);

    const lockupTimeSeconds = new BigNumber(endTs).minus(startTs);
    const periods = Math.ceil(lockupTimeSeconds.div(60).toNumber());

    const vesting = this.getVestingPDA({ vestingNumber: VestingClient.VESTING_NUMBER_START, user: beneficiary });
    const vestingSigner = this.getVestingSigner(vesting);
    const vault = getAssociatedTokenAddressSync(mint, vestingSigner, true);

    const tx = new Transaction();

    tx.add(createAssociatedTokenAccountInstruction(admin, vault, vestingSigner, mint));

    tx.add(
      await vestingProgram.methods
        .createVesting(
          new BN(VestingClient.VESTING_NUMBER_START),
          amount,
          new BN(startTs),
          new BN(endTs),
          new BN(periods),
        )
        .accounts({
          beneficiary,
          depositorAuthority: admin,
          depositorTokenAccount: await getAssociatedTokenAddress(mint, admin, false),
          vault: vault,
          vesting,
          vestingSigner,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .transaction(),
    );

    return tx;
  }

  public static async getBatchedCreateVestingTransactions({
    payer,
    vestingsData,
    mint,
  }: {
    vestingsData: UserVestingData[];
    payer: PublicKey;
    mint: PublicKey;
  }) {
    const transactions: Transaction[] = [];
    let currentTransaction = this.getInitCreateVestingsTransaction();
    // This flag is needed for a final step
    let vestingTxIsAdded = false;

    for (const { amount, beneficiary, endTs, startTs } of vestingsData) {
      const newVestingTx = await this.getCreateVestingTransaction({
        admin: payer,
        beneficiary: new PublicKey(beneficiary),
        mint,
        amount: new BN(amount),
        endTs,
        startTs,
      });

      const txWithAddition = new Transaction().add(currentTransaction).add(newVestingTx);
      const txWithAdditionSize = getTxSize(txWithAddition, payer);

      if (txWithAdditionSize > MAX_TRANSACTION_SIZE) {
        // Need to copy tx before pushing, otherwise we will always have only 1 tx because of how JavaScript refs work
        const txToPush = getTxCopy(currentTransaction);
        transactions.push(txToPush);

        currentTransaction = this.getInitCreateVestingsTransaction();
        currentTransaction.add(newVestingTx);

        vestingTxIsAdded = true;
      } else if (txWithAdditionSize === MAX_TRANSACTION_SIZE) {
        // Need to copy tx before pushing, otherwise we will always have only 1 tx because of how JavaScript refs work
        const txToPush = getTxCopy(currentTransaction);
        transactions.push(txToPush);

        currentTransaction = this.getInitCreateVestingsTransaction();

        vestingTxIsAdded = false;
      } else {
        currentTransaction = txWithAddition;

        vestingTxIsAdded = true;
      }
    }

    if (vestingTxIsAdded) {
      // Need to copy tx before pushing, otherwise we will always have only 1 tx because of how JavaScript refs work
      const txToPush = getTxCopy(currentTransaction);
      transactions.push(txToPush);
    }

    return transactions;
  }

  public static getInitCreateVestingsTransaction() {
    const tx = new Transaction();
    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE,
    });
    tx.add(addPriorityFee);

    return tx;
  }

  public static getHolderVestingPeriodInSeconds({
    userNumber,
    holdersCountDividedByDaysCount,
  }: {
    userNumber: number;
    holdersCountDividedByDaysCount: BigNumber;
  }) {
    const vestingDays = new BigNumber(userNumber).div(holdersCountDividedByDaysCount);

    const vestingHours = vestingDays.multipliedBy(24);
    const vestingHoursWithLowerBound = Math.max(vestingHours.toNumber(), 1);
    const vestingHoursWithLowerBoundBigNumber = new BigNumber(vestingHoursWithLowerBound);

    const vestingMinutes = vestingHoursWithLowerBoundBigNumber.multipliedBy(60);
    const vestingSeconds = vestingMinutes.multipliedBy(60).toNumber().toFixed();

    return vestingSeconds;
  }

  public static getHoldersVestingData({
    presaleInvestorsWithPats,
    presaleInvestorsWithoutPats,
    patsHoldersMapByAddressAndIndex,
    patsHoldersTotalUsersCount,
    startTs,
  }: {
    presaleInvestorsWithPats: TokenAccountRaw[];
    presaleInvestorsWithoutPats: TokenAccountRaw[];
    patsHoldersMapByAddressAndIndex: PatsHolderMapWithIndex;
    patsHoldersTotalUsersCount: number;
    startTs: number;
  }) {
    const holdersCountDividedByDaysCount = new BigNumber(patsHoldersTotalUsersCount).div(
      VestingClient.MAX_VESTING_DAYS_COUNT,
    );

    const patsHoldersVestingData = presaleInvestorsWithPats.reduce((data: UserVestingData[], { account, amount }) => {
      const patsUser = patsHoldersMapByAddressAndIndex[account];
      const userNumber = patsUser.index + 1; // We need to increment the index to avoid having 0 for the first element

      const userVestingPeriod = VestingClient.getHolderVestingPeriodInSeconds({
        holdersCountDividedByDaysCount,
        userNumber,
      });

      const endTs = new BigNumber(startTs).plus(userVestingPeriod).toNumber();

      data.push({
        beneficiary: account,
        amount,
        amountUI: new BigNumber(amount).dividedBy(10 ** CHAN_TOKEN_DECIMALS).toString(),
        endTs,
        startTs,
      });

      return data;
    }, []);

    const usersWithoutPatsVestingData = presaleInvestorsWithoutPats.map(({ account, amount }) => {
      const vestingDays = new BigNumber(VestingClient.MAX_VESTING_DAYS_COUNT);
      const vestingHours = vestingDays.multipliedBy(24);
      const vestingMinutes = vestingHours.multipliedBy(60);
      const vestingSeconds = vestingMinutes.multipliedBy(60).toNumber().toFixed();

      const endTs = new BigNumber(startTs).plus(vestingSeconds).toNumber();

      return {
        beneficiary: account,
        amount,
        amountUI: new BigNumber(amount).dividedBy(10 ** CHAN_TOKEN_DECIMALS).toString(),
        endTs,
        startTs,
      };
    });

    const allUsersVestingData = [...patsHoldersVestingData, ...usersWithoutPatsVestingData];
    const sortedAllUsersVestingData = allUsersVestingData.sort((a, b) => a.endTs - b.endTs);

    return { allUsersVestingData, sortedAllUsersVestingData };
  }
}
