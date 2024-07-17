import { PublicKey } from "@solana/web3.js";
import { StakingPool as CodegenStakingPool } from "../../src/schema/codegen/accounts";
import { client, connection, payer } from "../common";
import { MemeTicketClient, StakingPoolClient } from "../../src";

// yarn tsx examples/staking-pool/withdrawfees.ts > withdrawfees.txt 2>&1
export const withdrawfees = async () => {
  try {
    const boundPoolAddress = new PublicKey("Gq3XGfsZ1Rsai9qxVeBpSNw66CtT5gMkwZupLAPGe41B");
    const stakingPoolAddress = new PublicKey("DfMYHDyncVEv62WkUy45pve8LRakBVU8Guhxrzve6QVR");
    const stakingPool = await StakingPoolClient.fromStakingPoolId({ client, poolAccountAddressId: stakingPoolAddress });

    const fetchedStakingPool = await CodegenStakingPool.fetch(connection, stakingPoolAddress);
    console.log("fetchedStakingPool:", fetchedStakingPool?.toJSON());

    const ammPoolAddress = stakingPool.raydiumAmm;
    // call addfees to accumulate fees
    await stakingPool.addFees({ payer, ammPoolId: ammPoolAddress });

    const { tickets } = await MemeTicketClient.fetchTicketsByUser2(boundPoolAddress, client, payer.publicKey);
    const memeTicketClients = tickets.map((ticket) => new MemeTicketClient(ticket.id, client));
    // Withdraw fees
    console.log("Withdrawing fees...");
    const firstTicketToWithdraw = memeTicketClients[0];
    console.log("firstTicketToWithdraw:", firstTicketToWithdraw);

    stakingPool.withdrawFees({
      user: payer,
      ticket: firstTicketToWithdraw,
    });
  } catch (e) {
    console.error("[withdrawfees] Error:", e);
  }
};

withdrawfees();
