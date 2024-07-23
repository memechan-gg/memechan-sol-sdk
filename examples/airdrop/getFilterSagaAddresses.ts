import { AirdropListManager } from "../../src/airdrop/AirdropListManager";
import { connection } from "../common";

//yarn tsx examples/airdrop/getFilterSagaAddresses.ts

async function getFilterSagaAdresses() {
  const apMan = new AirdropListManager();
  await apMan.fetchSagaKeys();
  console.log(await apMan.filterSagaKeys(connection));
}

getFilterSagaAdresses();
