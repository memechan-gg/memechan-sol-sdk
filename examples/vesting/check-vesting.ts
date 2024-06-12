import { UserAmount, checkVesting } from "../../src/vesting/check-vestings";
import { readDataFromJsonFile } from "../utils";

async function checkVestingInconsistency() {
  //   const userAmountsList: UserAmount[] = (await readDataFromJsonFile(
  //     "tx-parsed-tx-data-for-pre-sale-address",
  //   )) as UserAmount[];
  const userAmountsList: UserAmount[] = []; // [{ user: "BdT3bBgwk6vsizdM4ozjGY4jiTHmg5kArUHVpQCeAeH", amount: "100000" }];
  console.log(await checkVesting(userAmountsList));
}

checkVestingInconsistency();
