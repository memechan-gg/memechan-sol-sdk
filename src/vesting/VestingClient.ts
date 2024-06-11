import { PublicKey, Transaction } from "@solana/web3.js";
import { VESTING_PROGRAM_ID } from "../config/config";
import { Vesting } from "./schema/codegen/accounts";
import {
  FetchVestingByUserArgs,
  GetClaimTransactionArgs,
  GetVestingClaimableAmountArgs,
  GetVestingPdaArgs,
} from "./types";
import BN from "bn.js";
import BigNumber from "bignumber.js";
import { withdraw } from "./schema/codegen/instructions";
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { client } from "../../examples/common";

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static getVestingClaimableAmount({ vesting }: GetVestingClaimableAmountArgs) {
    const currentTsSeconds = Date.now() / 1000;

    if (currentTsSeconds < vesting.startTs.toNumber()) {
      return BigNumber(0);
    }

    const duration = vesting.endTs.sub(vesting.startTs);
    const periodSeconds = duration.div(vesting.periodCount);
    const timePassed = new BN(currentTsSeconds).sub(vesting.startTs);

    const periodsPassed = timePassed.divmod(periodSeconds, "div").div;

    const totalAvailable = vesting.startBalance.mul(periodsPassed).div(vesting.periodCount);
    const withdrawn = vesting.startBalance.sub(vesting.outstanding);

    const availableTokens = totalAvailable.sub(withdrawn);

    return BigNumber(availableTokens.toString());
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static async getClaimTransaction({ amount, user, mint, vestingId, transaction }: GetClaimTransactionArgs) {
    const tx = transaction ?? new Transaction();

    const vesting = (await Vesting.fetch(client.connection, vestingId))!;

    const userTokenAccount = getAssociatedTokenAddressSync(mint, user, false);

    const createATAIdempotentInstruction = createAssociatedTokenAccountIdempotentInstruction(
      user,
      userTokenAccount,
      user,
      mint,
    );

    tx.add(createATAIdempotentInstruction);

    const withdrawIx = withdraw(
      { amount: amount },
      {
        beneficiary: user,
        userTokenAccount,
        vault: vesting.vault,
        vesting: vestingId,
        vestingSigner: VestingClient.getVestingSigner(vestingId),

        tokenProgram: TOKEN_PROGRAM_ID,
      },
    );

    tx.add(withdrawIx);

    return tx;
  }
}
