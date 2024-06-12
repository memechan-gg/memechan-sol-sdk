import { VestingClient } from "../../src";
import { TokenAccountWithBNAmount } from "../../src/helius-api/types";
import { readDataFromJsonFile, saveDataToJsonFile } from "../utils";

// yarn tsx examples/vesting/get-users-vesting-data.ts
export const getUsersVestingData = async () => {
  const sortedPatsHolders: TokenAccountWithBNAmount[] = (await readDataFromJsonFile(
    "pats-holders-sorted-by-amount",
  )) as TokenAccountWithBNAmount[];
  console.log("pats holders count:", sortedPatsHolders.length);

  const allHolders: TokenAccountWithBNAmount[] = (await readDataFromJsonFile(
    "all-holders",
  )) as TokenAccountWithBNAmount[];
  console.log("all holders count:", allHolders.length);

  const usersWithoutPats: TokenAccountWithBNAmount[] = allHolders.filter(
    ({ account: holder }) => sortedPatsHolders.find(({ account: patsHolder }) => patsHolder === holder) === undefined,
  );
  console.log("users without pats count:", usersWithoutPats.length);

  const usersVestingData = VestingClient.getHoldersVestingData({
    sortedPatsHolders,
    usersWithoutPats,
    // TODO: Replace start timestamp with prod one
    startTs: 1718211618,
  });

  saveDataToJsonFile(usersVestingData, "users-vesting-data");
};

getUsersVestingData();
