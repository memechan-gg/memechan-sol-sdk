import { TokenAccountRaw } from "../../../src/helius-api/types";
import { checkVesting } from "../../../src/vesting/check-vestings";
import { readDataFromJsonFile } from "../../utils";

async function checkVestingInconsistency() {
  const userAmountsList: TokenAccountRaw[] = (await readDataFromJsonFile(
    "chan-token-allocations-by-user-final",
  )) as TokenAccountRaw[];

  console.log(await checkVesting(userAmountsList));
}

checkVestingInconsistency();
