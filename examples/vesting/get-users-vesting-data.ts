import { VestingClient } from "../../src";
import { TokenAccountRaw } from "../../src/helius-api/types";
import { readDataFromJsonFile, saveDataToJsonFile } from "../utils";

// yarn tsx examples/vesting/get-users-vesting-data.ts
export const getUsersVestingData = async () => {
  const sortedPatsHolders: TokenAccountRaw[] = (await readDataFromJsonFile(
    "pats-holders-sorted-by-amount",
  )) as TokenAccountRaw[];
  console.log("pats holders count:", sortedPatsHolders.length);

  const allHolders: TokenAccountRaw[] = (await readDataFromJsonFile("all-holders")) as TokenAccountRaw[];
  console.log("all holders count:", allHolders.length);

  const usersWithoutPats: TokenAccountRaw[] = allHolders.filter(
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
