import { ComputeBudgetProgram, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { COMPUTE_UNIT_PRICE, VESTING_PROGRAM_ID } from "../config/config";
import { Vesting } from "./schema/codegen/accounts";
import {
  FetchVestingByUserArgs,
  GetClaimTransactionArgs,
  GetCreateVestingTransactionArgs,
  GetVestingClaimableAmountArgs,
  GetVestingPdaArgs,
} from "./types";
import BN from "bn.js";
import BigNumber from "bignumber.js";
import { withdraw } from "./schema/codegen/instructions";
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { Program } from "@coral-xyz/anchor";
import { IDL, Lockup } from "./schema/types/lockup";

export class VestingClient {
  public constructor(public id: PublicKey) {}

  public static VESTING_NUMBER_START = 1;

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

  public static async getCreateVestingTransaction({ beneficiary, admin, mint }: GetCreateVestingTransactionArgs) {
    const vestingProgram = new Program<Lockup>(IDL, VESTING_PROGRAM_ID);

    const ts = Date.now() / 1000;
    const lockupTimeSeconds = 24 * 3600;
    const periods = 24 * 60;

    const vesting = this.getVestingPDA({ vestingNumber: VestingClient.VESTING_NUMBER_START, user: beneficiary });
    const vestingSigner = this.getVestingSigner(vesting);
    const vault = getAssociatedTokenAddressSync(mint, vestingSigner, true);

    const tx = new Transaction();
    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_UNIT_PRICE,
    });

    tx.add(addPriorityFee);

    tx.add(createAssociatedTokenAccountInstruction(admin, vault, vestingSigner, mint));

    tx.add(
      await vestingProgram.methods
        .createVesting(new BN(1), new BN(1 * 10 ** 6), new BN(ts), new BN(ts + lockupTimeSeconds), new BN(periods))
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
}
