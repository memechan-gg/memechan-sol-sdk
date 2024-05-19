import { MemeTicket } from "../src/memeticket/MemeTicket";
import { client } from "./common/common";

describe("MemeTicket", () => {
  it("all", async () => {
    const all = await MemeTicket.all(client.memechanProgram);

    for (const pool of all) {
      //console.log(JSON.stringify(pool.account));
      //console.log("==================================================");
    }
  }, 30000);
});
