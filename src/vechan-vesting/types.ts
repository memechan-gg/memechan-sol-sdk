import { PublicKey } from "@solana/web3.js";
import { RewardFields, RewardJSON } from "./schema/codegen/accounts";

export type ParsedReward = {
  id: PublicKey;
  fields: RewardFields;
  jsonFields: RewardJSON;
  rewardAmountWithDecimals: string;
};
