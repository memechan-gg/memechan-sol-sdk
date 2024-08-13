import { PublicKey } from "@solana/web3.js";

export function findPointsPda(memeChanProgramId: PublicKey): PublicKey {
  const pointsPda = PublicKey.findProgramAddressSync([Buffer.from("points_pda")], memeChanProgramId)[0];
  return pointsPda;
}
