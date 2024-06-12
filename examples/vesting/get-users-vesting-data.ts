import { VestingClient } from "../../src";
import { TokenAccountWithBNAmount } from "../../src/helius-api/types";
import { readDataFromJsonFile, saveDataToJsonFile } from "../utils";

// yarn tsx examples/vesting/get-users-vesting-data.ts
export const getUsersVestingData = async () => {
  const sortedPatsHolders: TokenAccountWithBNAmount[] = (await readDataFromJsonFile(
    "pats-holders-sorted-by-amount",
  )) as TokenAccountWithBNAmount[];

  const usersVestingData = VestingClient.getHoldersVestingData({
    sortedHolders: sortedPatsHolders,
    // TODO: Replace start timestamp with prod one
    startTs: 1718211618,
  });

  saveDataToJsonFile(usersVestingData, "users-vesting-data");
};

getUsersVestingData();
