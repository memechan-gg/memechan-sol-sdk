import { GetUserVestingArgs, UserVesting, VestingInfo } from "./types";

export class VestingClient {
  public static async getVestingConfig(): Promise<VestingInfo> {
    // All below is fully mock code
    return { cliffStarts: 1718132363, vestingStarts: 1718175563, vestingEnds: 1719385163 };
  }

  public static async getUserVesting({ user }: GetUserVestingArgs): Promise<UserVesting> {
    // All below is fully mock code
    function getRandomInt(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const isEligible = Math.random() < 0.5;
    user;

    if (!isEligible) {
      return { isEligible: false };
    } else {
      const vestedAmount = getRandomInt(1, 600_000_000);
      const claimableAmount = getRandomInt(1, vestedAmount);

      return {
        isEligible: true,
        vestedAmount: vestedAmount.toString(),
        claimableAmount: claimableAmount.toString(),
      };
    }
  }
}
