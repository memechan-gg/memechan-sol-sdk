import { PublicKey } from "@solana/web3.js";
import { StakingPool as CodegenStakingPool } from "../../../src/schema/v2/codegen/accounts/StakingPool";
import { clientV2, connection, payer } from "../../common";
import { MemeTicketClientV2, StakingPoolClientV2 } from "../../../src";

// yarn tsx examples/staking-pool/withdrawfees.ts > withdrawfees.txt 2>&1
export const withdrawfees = async () => {
  try {
    const boundPoolAddress = new PublicKey("Gq3XGfsZ1Rsai9qxVeBpSNw66CtT5gMkwZupLAPGe41B");
    const stakingPoolAddress = new PublicKey("DfMYHDyncVEv62WkUy45pve8LRakBVU8Guhxrzve6QVR");
    const stakingPool = await StakingPoolClientV2.fromStakingPoolId({
      client: clientV2,
      poolAccountAddressId: stakingPoolAddress,
    });

    const fetchedStakingPool = await CodegenStakingPool.fetch(connection, stakingPoolAddress);
    console.log("fetchedStakingPool:", fetchedStakingPool?.toJSON());

    const ammPoolAddress = stakingPool.raydiumAmm;
    // call addfees to accumulate fees
    await stakingPool.addFees({ payer, ammPoolId: ammPoolAddress });

    const { tickets } = await MemeTicketClientV2.fetchTicketsByUser2(boundPoolAddress, clientV2, payer.publicKey);
    const memeTicketClients = tickets.map((ticket) => new MemeTicketClientV2(ticket.id, clientV2));
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
