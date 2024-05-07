import { Program } from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import { Amm } from "./types/amm";
import { MemechanSol } from "./types/memechan_sol";

export interface SolanaContext {
  connection: Connection;
  ammProgram: Program<Amm>;
  memechanProgram: Program<MemechanSol>;
}
