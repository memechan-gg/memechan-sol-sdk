/* eslint-disable max-len */
import BigNumber from "bignumber.js";
import { CHAN_TOKEN_DECIMALS, PatsHolderMapWithIndex, VestingClient } from "../../../src";
import { TokenAccountRaw } from "../../../src/helius-api/types";
import { readDataFromJsonFile, saveDataToJsonFile } from "../../utils";
import { toMap } from "../../../src/util/toMap";

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
  const patsHoldersMapByAddressAndIndex = sortedPatsHolders.reduce((acc: PatsHolderMapWithIndex, el, index) => {
    acc[el.account] = { ...el, index };

    return acc;
  }, {});

  const presaleInvestorsWithPats = presaleInvestors.filter((el) => patsHoldersMap.has(el.account));
  const presaleInvestorsWithoutPats = presaleInvestors.filter((el) => !patsHoldersMap.has(el.account));

  console.debug(`presale investors without pats count:, ${presaleInvestorsWithoutPats.length}`);
  console.debug(`presale investors with pats count:, ${presaleInvestorsWithPats.length}`);
  console.debug(
    `presale investors with pats and without pats: ${presaleInvestorsWithoutPats.length + presaleInvestorsWithPats.length}`,
  );

  const { allUsersVestingData, sortedAllUsersVestingData } = VestingClient.getHoldersVestingData({
    presaleInvestorsWithPats: presaleInvestorsWithPats,
    presaleInvestorsWithoutPats: presaleInvestorsWithoutPats,
    patsHoldersMapByAddressAndIndex,
    patsHoldersTotalUsersCount: sortedPatsHolders.length,
    // TODO: Replace start timestamp with prod one
    startTs: 1718269200, // Thursday, June 13, 2024 9:00:00 AM GMT +0
  });

  // check that amounts are consistent

  const allUserTokenAmounts = sortedAllUsersVestingData.reduce(
    (acc, el) => acc.plus(new BigNumber(el.amount)),
    new BigNumber(0),
  );

  console.debug(`allUserTokenAmounts ${allUserTokenAmounts.toString()}`);
  console.debug(`allUserTokenAmounts ${allUserTokenAmounts.dividedBy(10 ** CHAN_TOKEN_DECIMALS).toString()}`);

  saveDataToJsonFile(sortedAllUsersVestingData, "users-vesting-data");
  saveDataToJsonFile(allUsersVestingData, "unsorted-users-vesting-data");
};

getUsersVestingData();
