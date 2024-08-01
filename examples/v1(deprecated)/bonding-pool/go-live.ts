import { BN } from "bn.js";
import { BoundPoolClient } from "../../../src/bound-pool/BoundPoolClient";
import { FEE_DESTINATION_ID, TOKEN_INFOS } from "../../../src/config/config";
import { DUMMY_TOKEN_METADATA, admin, client, payer } from "../../common";
import { MemeTicketClient } from "../../../src";

// yarn tsx examples/bonding-pool/go-live.ts > go-live.txt 2>&1
export const goLive = async () => {
  const boundPool = await BoundPoolClient.new({
    admin,
    payer,
    client,
    quoteToken: TOKEN_INFOS.WSOL,
    tokenMetadata: DUMMY_TOKEN_METADATA,
  });
  console.log("boundPool:", boundPool);
  console.log("==== pool id: " + boundPool.id.toString());

  const { tickets } = await MemeTicketClient.fetchTicketsByUser2(boundPool.id, client, payer.publicKey);
  const memeTicketNumber = tickets.length + MemeTicketClient.TICKET_NUMBER_START;

  const ticketId = await boundPool.swapY({
    payer: payer,
    user: payer,
    memeTokensOut: new BN(10000),
    quoteAmountIn: new BN(10000000),
    quoteMint: TOKEN_INFOS.WSOL.mint,
    pool: boundPool.id,
    memeTicketNumber,
  });
  console.log("ticketId:", ticketId);

  const boundPoolInfo = await BoundPoolClient.fetch2(client.connection, boundPool.id);

  const { stakingMemeVault, stakingQuoteVault } = await boundPool.initStakingPool({
    payer: payer,
    user: payer,
    boundPoolInfo,
  });

  console.log("stakingMemeVault: " + stakingMemeVault.toString());
  console.log("stakingQuoteVault: " + stakingQuoteVault.toString());

  const [stakingPool] = await boundPool.goLive({
    payer: payer,
    user: payer,
    boundPoolInfo,
    feeDestinationWalletAddress: FEE_DESTINATION_ID,
    memeVault: stakingMemeVault,
    quoteVault: stakingQuoteVault,
  });

  console.log("golive finished. stakingPool: " + stakingPool.id.toString());
};

goLive();
