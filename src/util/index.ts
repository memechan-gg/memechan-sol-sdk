import {
  buildSimpleTransaction,
  InnerSimpleV0Transaction,
  SPL_ACCOUNT_LAYOUT,
  TOKEN_PROGRAM_ID,
  TokenAccount,
} from "@raydium-io/raydium-sdk";

import {
  Connection,
  Keypair,
  PublicKey,
  SendOptions,
  Signer,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { findProgramAddress } from "../common/helpers";
import { addLookupTableInfo, ATA_PROGRAM_ID, makeTxVersion } from "../raydium/config";

export async function buildAndSendTx(
  connection: Connection,
  payer: Signer,
  innerSimpleV0Transaction: InnerSimpleV0Transaction[],
  options?: SendOptions,
) {
  const willSendTx = await buildTxs(connection, payer.publicKey, innerSimpleV0Transaction);

  return await sendTx(connection, payer, willSendTx, options);
}

export async function buildTxs(
  connection: Connection,
  payer: PublicKey,
  innerSimpleV0Transaction: InnerSimpleV0Transaction[],
): Promise<(Transaction | VersionedTransaction)[]> {
  let responseBlock;

  try {
    responseBlock = await connection.getLatestBlockhash("confirmed");
  } catch (error) {
    console.log(error);
    console.log("Refetching latest Blockhash");
    responseBlock = await connection.getLatestBlockhash("confirmed");
  }

  const recentBlockhash = responseBlock.blockhash;

  const transactions = await buildSimpleTransaction({
    connection,
    makeTxVersion,
    payer,
    innerTransactions: innerSimpleV0Transaction,
    recentBlockhash,
    addLookupTableInfo: addLookupTableInfo,
  });

  return transactions;
}

export async function sendTx(
  connection: Connection,
  payer: Keypair | Signer,
  txs: (VersionedTransaction | Transaction)[],
  options?: SendOptions,
): Promise<string[]> {
  const txids: string[] = [];
  console.log("sendTx txs length: ", txs.length);
  for (const iTx of txs) {
    console.log("iTx0: ", iTx);
    if (iTx instanceof VersionedTransaction) {
      iTx.sign([payer]);
      txids.push(await connection.sendTransaction(iTx, options));
    } else {
      txids.push(await connection.sendTransaction(iTx, [payer], options));
    }
    console.log("txid1: ", txids[txids.length - 1]);
    await connection.confirmTransaction(txids[txids.length - 1], "confirmed");
    console.log("txid2: ", txids[txids.length - 1]);
  }
  return txids;
}

export async function getWalletTokenAccount(connection: Connection, wallet: PublicKey): Promise<TokenAccount[]> {
  const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
    programId: TOKEN_PROGRAM_ID,
  });
  return walletTokenAccount.value.map((i) => ({
    pubkey: i.pubkey,
    programId: i.account.owner,
    accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
  }));
}

export function getATAAddress(programId: PublicKey, owner: PublicKey, mint: PublicKey) {
  const { publicKey, nonce } = findProgramAddress(
    [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
    new PublicKey(ATA_PROGRAM_ID),
  );
  return { publicKey, nonce };
}

export async function sleepTime(ms: number) {
  console.log(new Date().toLocaleString(), "sleepTime", ms);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getMintBalanceFromTokenAccounts = ({
  mint,
  tokenAccounts,
  decimals,
}: {
  mint: string;
  tokenAccounts: TokenAccount[];
  decimals: number;
}): { rawBalance: string; formattedBalance: string } => {
  const mintTokenAccounts = tokenAccounts.filter(
    ({ accountInfo: { mint: accountMint } }) => accountMint.toString() === mint,
  );

  const rawBalance = mintTokenAccounts.reduce(
    (sum: BigNumber, { accountInfo: { amount } }) => sum.plus(amount.toString()),
    new BigNumber(0),
  );

  const formattedBalance = rawBalance.div(10 ** decimals);

  return { rawBalance: rawBalance.toString(), formattedBalance: formattedBalance.toString() };
};
