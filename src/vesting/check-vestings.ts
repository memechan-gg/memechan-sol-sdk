import { Program } from "@coral-xyz/anchor";
import { VESTING_PROGRAM_ID } from "../config/config";
import { IDL, Lockup } from "./schema/types/lockup";
import { client } from "../../examples/common";
import { TokenAccountRaw } from "../helius-api/types";

export interface UserAmount {
  user: string;
  amount: string;
}

export async function checkVesting(userAmountsList: TokenAccountRaw[]): Promise<{
  notFoundInDoc: UserAmount[];
  vestingDataMismatched: UserAmount[];
  notFoundInVesting: UserAmount[];
}> {
  const userAmountMap: Map<string, string> = new Map();
  userAmountsList.forEach((e) => userAmountMap.set(e.account, e.amount));
  const foundUsers: Map<string, boolean> = new Map();
  userAmountsList.forEach((e) => foundUsers.set(e.account, false));

  const vestingProgram = new Program<Lockup>(IDL, VESTING_PROGRAM_ID);
  client.connection;
  const vestings = await vestingProgram.account.vesting.all();

  const vestingUserAmountList: UserAmount[] = [];
  for (let i = 0; i < vestings.length; i++) {
    const vesting = vestings[i];
    vestingUserAmountList.push({
      amount: vesting.account.startBalance.toString(),
      user: vesting.account.beneficiary.toBase58(),
    });
  }

  const vNotFoundUsers: UserAmount[] = [];
  const vWrongDataUsers: UserAmount[] = [];
  const dNotFoundUsers: UserAmount[] = [];

  for (let i = 0; i < vestingUserAmountList.length; i++) {
    const vestingUserAmount = vestingUserAmountList[i];

    if (!userAmountMap.get(vestingUserAmount.user)) {
      console.warn(
        `found in vesting, not found in table: ${vestingUserAmount.user} amount ${vestingUserAmount.amount}`,
      );
      vNotFoundUsers.push(vestingUserAmount);
    } else {
      foundUsers.set(vestingUserAmount.user, true);
      const docAmount = userAmountMap.get(vestingUserAmount.user);
      if (docAmount != vestingUserAmount.amount) {
        console.warn(
          `mismatched amount for user ${vestingUserAmount.user}: expected ${docAmount} got ${vestingUserAmount.amount}`,
        );
        vWrongDataUsers.push(vestingUserAmount);
      }
    }
  }

  foundUsers.forEach((found: boolean, user: string) => {
    if (!found) {
      const amt = userAmountMap.get(user)!;
      console.warn(`not found in vesting: ${user} amount ${amt}`);
      dNotFoundUsers.push({ user, amount: amt });
    }
  });

  return { notFoundInDoc: vNotFoundUsers, vestingDataMismatched: vWrongDataUsers, notFoundInVesting: dNotFoundUsers };
}
