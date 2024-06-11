import { PublicKey } from "@solana/web3.js";
import { VESTING_PROGRAM_ID } from "../config/config";
import { Vesting } from "./schema/codegen/accounts";
import {
  FetchVestingByUserArgs,
  GetClaimTransactionArgs,
  GetVestingClaimableAmountArgs,
  GetVestingPdaArgs,
} from "./types";

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

  public static async fetchVestingByUser({ user, connection }: FetchVestingByUserArgs) {
    const vestingId = VestingClient.getVestingPDA({ vestingNumber: VestingClient.VESTING_NUMBER_START, user });
    const vesting = await Vesting.fetch(connection, vestingId);

    return vesting;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static async getVestingClaimableAmount({ vesting }: GetVestingClaimableAmountArgs) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static async getClaimTransaction({ amount, user, vestingId, transaction }: GetClaimTransactionArgs) {}
}
