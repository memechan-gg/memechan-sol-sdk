import { RpcResponseAndContext, SimulatedTransactionResponse } from "@solana/web3.js";

/**
 * Extracts swap values (in and out) from the transaction simulation logs.
 *
 * @param {RpcResponseAndContext<SimulatedTransactionResponse>} txSimulationData - The transaction simulation output.
 * @returns {{ swapInAmount: string; swapOutAmount: string }} An object containing the swapInAmount and swapOutAmount values as strings.
 * @throws Will throw an error if no swap values are found in the logs.
 */
export function extractSwapDataFromSimulation(txSimulationData: RpcResponseAndContext<SimulatedTransactionResponse>): {
  swapInAmount: string;
  swapOutAmount: string;
} {
  const logs = txSimulationData.value.logs;

  if (!logs) {
    console.debug("[extractSwapDataFromSimulation] ERROR: empty logs: ", txSimulationData);
    throw new Error("[extractSwapDataFromSimulation] No logs present on the simulation data function");
  }

  for (const log of logs) {
    const match = log.match(/swapped_in: (\d+)\s+swapped_out: (\d+)/);
    if (match) {
      const swapIn = match[1];
      const swapOut = match[2];

      return { swapInAmount: swapIn, swapOutAmount: swapOut };
    }
  }

  console.warn("[extractSwapDataFromSimulation] ERROR: No swap values found in logs: ", txSimulationData);
  throw new Error("[extractSwapDataFromSimulation] No swap values found in the logs");
}
