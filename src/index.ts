import { Program } from "@coral-xyz/anchor";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { Amm, IDL as AmmIDL } from "./common/types/amm";
import { AMM_PROGRAM_ID, MEMECHAN_PROGRAM_ID } from "./common/consts";
import { MemechanSol, IDL as MemechanSolIDL } from "./common/types/memechan_sol";
import { SolanaContext } from "./common/types";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const ammProgram = new Program<Amm>(AmmIDL, new PublicKey(AMM_PROGRAM_ID), {
  connection,
});

const memechanProgram = new Program<MemechanSol>(MemechanSolIDL, new PublicKey(MEMECHAN_PROGRAM_ID), {
  connection,
});

const solanaContext: SolanaContext = {
  connection,
  ammProgram,
  memechanProgram,
};

export { solanaContext };
