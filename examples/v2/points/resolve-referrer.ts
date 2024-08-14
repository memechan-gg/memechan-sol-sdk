import { connection } from "../../common";
import { resolveReferrer } from "../../../src/points/resolveReferrer";

// yarn tsx examples/v2/points/resolve-referrer.ts
(async () => {
  const domainReferrer = "0xunreal.saga";
  const referrerAddress = await resolveReferrer(connection, domainReferrer);
  console.log(`referrerAddress ${referrerAddress}`);

  const addressReferrer = "HLaPceN1Hct4qvDC21PetsaVkyUrBC97n1FYeXAZ4mz5";
  const referrerAddress2 = await resolveReferrer(connection, addressReferrer);
  console.log(`referrerAddress2 ${referrerAddress2}`);
})();
