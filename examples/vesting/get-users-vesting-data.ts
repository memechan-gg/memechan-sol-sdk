import BigNumber from "bignumber.js";
import { CHAN_TOKEN_DECIMALS, UserVestingData, VestingClient } from "../../src";
import { TokenAccountRaw } from "../../src/helius-api/types";
import { readDataFromJsonFile, saveDataToJsonFile } from "../utils";
import { toMap } from "../../src/util/toMap";

// yarn tsx examples/vesting/get-users-vesting-data.ts
export const getUsersVestingData = async () => {
  const sortedPatsHolders: TokenAccountRaw[] = (await readDataFromJsonFile(
    "pats-holders-sorted-by-amount",
  )) as TokenAccountRaw[];
  console.log("pats holders count:", sortedPatsHolders.length);

  const presaleInvestors: TokenAccountRaw[] = (await readDataFromJsonFile(
    "chan-token-allocations-by-user-final",
  )) as TokenAccountRaw[];
  console.log("all holders count:", presaleInvestors.length);

  const patsHoldersMap = toMap(sortedPatsHolders, (el) => el.account);
  // const presaleInvestorsMap = toMap(presaleInvestors, (el) => el.account);

  const presaleInvestorsWithPats = presaleInvestors.filter((el) => patsHoldersMap.has(el.account));
  const presaleInvestorsWithoutPats = presaleInvestors.filter((el) => !patsHoldersMap.has(el.account));

  console.debug(`users without pats count:, ${presaleInvestorsWithoutPats.length}`);
  console.debug(`users with pats count:, ${presaleInvestorsWithPats.length}`);

  const usersVestingData: UserVestingData[] = VestingClient.getHoldersVestingData({
    sortedPatsHolders: presaleInvestorsWithPats,
    usersWithoutPats: presaleInvestorsWithoutPats,
    // TODO: Replace start timestamp with prod one
    startTs: 1718211618,
  });

  // check that amounts are consistent

  const allUserTokenAmounts = usersVestingData.reduce(
    (acc, el) => acc.plus(new BigNumber(el.amount)),
    new BigNumber(0),
  );

  console.debug(`allUserTokenAmounts ${allUserTokenAmounts.toString()}`);
  console.debug(`allUserTokenAmounts ${allUserTokenAmounts.dividedBy(10 ** CHAN_TOKEN_DECIMALS).toString()}`);

  saveDataToJsonFile(usersVestingData, "users-vesting-data");
};

getUsersVestingData();
