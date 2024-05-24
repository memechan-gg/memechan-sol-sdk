import { MEMECHAN_TARGET_CONFIG } from "../../src/config/config";
import { TargetConfig } from "../../src/schema/codegen/accounts";
import { connection } from "../common";

// yarn tsx examples/target-config/fetch-target-config.ts > fetch-target-config.txt 2>&1
export const fetchTargetConfig = async () => {

    const targetConfigId = MEMECHAN_TARGET_CONFIG;
    console.log("Fetching targetConfigId: " + targetConfigId.toBase58());

    const targetConfig = await TargetConfig.fetch(connection, targetConfigId);
    console.log("targetConfig: ", JSON.stringify(targetConfig));
};

fetchTargetConfig();