import {
  createAccount,
  createMint,
  createSyncNativeInstruction,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  PublicKey,
  Keypair,
  Signer,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
  Connection,
} from "@solana/web3.js";
import { Token } from "@raydium-io/raydium-sdk";

import { BoundPoolArgs, GoLiveArgs, InitStakingPoolArgs, SwapXArgs, SwapYArgs } from "./types";
import { AnchorError, BN, Provider } from "@coral-xyz/anchor";
import { MemeTicket } from "../memeticket/MemeTicket";
import { StakingPool } from "../staking-pool/StakingPool";
import { MemechanClient } from "../MemechanClient";
import { ATA_PROGRAM_ID, PROGRAMIDS } from "../raydium/config";
import { createMarket } from "../raydium/openBookCreateMarket";

import { findProgramAddress } from "../common/helpers";

export class BoundPool {
  private constructor(
    public id: PublicKey,
    public admin: Keypair,
    public solVault: PublicKey,
    public memeVault: PublicKey,
    public client: MemechanClient,
  ) {
    //
  }

  public static findSignerPda(publicKey: PublicKey, memechanProgramId: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync([Buffer.from("signer"), publicKey.toBytes()], memechanProgramId)[0];
  }

  public static findBoundPoolPda(
    memeMintPubkey: PublicKey,
    solMintPubkey: PublicKey,
    memechanProgramId: PublicKey,
  ): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("bound_pool"), memeMintPubkey.toBytes(), solMintPubkey.toBytes()],
      memechanProgramId,
    )[0];
  }

  public static findStakingPda(memeMintPubkey: PublicKey, memechanProgramId: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("staking_pool"), memeMintPubkey.toBytes()],
      memechanProgramId,
    )[0];
  }

  public static findMemeTicketPda(stakingPubKey: PublicKey, memechanProgramId: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("admin_ticket"), stakingPubKey.toBytes()],
      memechanProgramId,
    )[0];
  }

  public static async new(args: BoundPoolArgs): Promise<BoundPool> {
    const { admin, payer, signer, client } = args;
    const { connection, memechanProgram } = client;

    const memeMintKeypair = Keypair.generate();
    const id = this.findBoundPoolPda(memeMintKeypair.publicKey, NATIVE_MINT, args.client.memechanProgram.programId);
    const poolSigner = BoundPool.findSignerPda(id, args.client.memechanProgram.programId);

    const memeMint = await createMint(connection, payer, poolSigner, null, 6, memeMintKeypair);

    console.log("memeMint: " + memeMint.toBase58());

    const adminSolVault = (await getOrCreateAssociatedTokenAccount(connection, payer, NATIVE_MINT, admin)).address;
    const poolSolVaultid = Keypair.generate();
    const poolSolVault = await createAccount(connection, payer, NATIVE_MINT, poolSigner, poolSolVaultid);

    const launchVaultid = Keypair.generate();
    const launchVault = await createAccount(connection, payer, memeMint, poolSigner, launchVaultid);

    console.log(
      `pool id: ${id.toBase58()} memeMint: ${memeMint.toBase58()}, adminSolVault: ${adminSolVault.toBase58()}, poolSolVault: ${poolSolVault.toBase58()}, launchVault: ${launchVault.toBase58()}`,
    );

    const result = await memechanProgram.methods
      .new()
      .accounts({
        adminSolVault: adminSolVault,
        launchVault: launchVault,
        solVault: poolSolVault,
        memeMint: memeMint,
        pool: id,
        poolSigner: poolSigner,
        sender: signer.publicKey,
        solMint: NATIVE_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([signer])
      .rpc();

    console.log("new pool tx result: " + result);

    return new BoundPool(id, signer, poolSolVault, launchVault, client);
  }

  //  public async fetch() {
  //    return this.client.memechanProgram.account.boundPool.fetch(this.id);
  //  }

  public async fetch(program = this.client.memechanProgram, accountId = this.id, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const accountInfo = await program.account.boundPool.fetch(accountId, "confirmed");
        //const accountInfo = await this.client.connection.getAccountInfo(accountId);

        return accountInfo;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000)); // wait 1 second before retrying
      }
    }
  }

  public findSignerPda(): PublicKey {
    return BoundPool.findSignerPda(this.id, this.client.memechanProgram.programId);
  }

  public static async airdropLiquidityTokens(
    mint: PublicKey,
    wallet: PublicKey,
    authority: Signer,
    provider: Provider,
    payer: Signer,
    amount: number = 1_000_000,
  ) {
    return mintTo(provider.connection, payer, mint, wallet, authority, amount);
  }

  public async swapY(input: Partial<SwapYArgs>): Promise<MemeTicket> {
    const id = Keypair.generate();
    const user = input.user!;
    const payer = input.payer!;

    const pool = input.pool ?? this.id;
    const poolSignerPda = BoundPool.findSignerPda(pool, this.client.memechanProgram.programId);
    const sol_in = input.solAmountIn;
    const meme_out = input.memeTokensOut;

    const userSolAcc =
      input.userSolAcc ??
      (await getOrCreateAssociatedTokenAccount(this.client.connection, payer, NATIVE_MINT, user.publicKey)).address;

    const balance = await this.client.connection.getBalance(payer.publicKey);
    console.log(`${balance / LAMPORTS_PER_SOL} SOL`);

    const transferTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: userSolAcc,
        lamports: sol_in,
      }),
      createSyncNativeInstruction(userSolAcc),
    );

    const transferResult = await sendAndConfirmTransaction(this.client.connection, transferTx, [payer], {
      skipPreflight: true,
    });

    console.log("3 transferResult: " + transferResult);

    await this.client.memechanProgram.methods
      .swapY(new BN(sol_in), new BN(meme_out))
      .accounts({
        memeTicket: id.publicKey,
        owner: user.publicKey,
        pool: pool,
        poolSignerPda: poolSignerPda,
        solVault: this.solVault,
        userSol: userSolAcc,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user, id])
      .rpc({ skipPreflight: true, maxRetries: 3 })
      .catch((e) => console.error(e));

    return new MemeTicket(id.publicKey, this.client);
  }

  public async swapX(input: Partial<SwapXArgs>): Promise<void> {
    const user = input.user;

    const pool = input.pool ?? this.id;
    const poolSigner = input.poolSignerPda ?? this.findSignerPda();
    const meme_in = input.memeAmountIn;
    const sol_out = input.solTokensOut;

    const memeTicket = input.userMemeTicket;
    const userSolAcc = input.userSolAcc;

    await this.client.memechanProgram.methods
      .swapX(new BN(meme_in), new BN(sol_out))
      .accounts({
        memeTicket: memeTicket?.id,
        owner: user?.publicKey,
        pool: pool,
        poolSigner,
        solVault: this.solVault,
        userSol: userSolAcc,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user!])
      .rpc();
  }

  async retryInitStakingPool(client, methodArgs, maxRetries, initialTimeout) {
    let attempts = 0;
    let timeout = initialTimeout;

    while (attempts < maxRetries) {
      try {
        // Adjust the timeout for the RPC call
        const options = {
          skipPreflight: true,
          commitment: "confirmed",
          preflightCommitment: "confirmed",
          timeout: timeout, // Timeout in milliseconds
        };

        const result = await client.memechanProgram.methods
          .initStakingPool()
          .accounts(methodArgs)
          .signers([methodArgs.user])
          .rpc(options);

        console.log("Transaction successful:", result);
        return result;
      } catch (error) {
        console.error(`Attempt ${attempts + 1} failed:`, error);
        if (error.message.includes("Transaction was not confirmed in")) {
          attempts++;
          timeout += 30000; // Increase timeout by 30 seconds for each retry
          if (attempts >= maxRetries) {
            throw new Error("All attempts to send transaction failed");
          }
        } else {
          // If the error is not related to timeout, rethrow it
          throw error;
        }
      }
    }
  }

  public async initStakingPool(input: Partial<InitStakingPoolArgs>): Promise<string> {
    const user = input.user!;
    const pool = input.pool ?? this.id;

    //console.log("initStakingPool fetch: " + this.id.toBase58());
    //const boundPoolInfo = await this.fetch();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const boundPoolInfo = input.boundPoolInfo as any;

    console.log("initStakingPool.boundPoolInfo: " + JSON.stringify(boundPoolInfo));

    const stakingId = BoundPool.findStakingPda(boundPoolInfo.memeReserve.mint, this.client.memechanProgram.programId);
    const stakingSigner = StakingPool.findSignerPda(stakingId, this.client.memechanProgram.programId);

    const adminTicketId = BoundPool.findMemeTicketPda(stakingId, this.client.memechanProgram.programId);

    //const feeDestination = new PublicKey(process.env.FEE_DESTINATION_ID as string);

    //const userDestinationLpTokenAta = getATAAddress(TOKEN_PROGRAM_ID, user.publicKey, boundPoolInfo.lpMint).publicKey;

    try {
      const methodArgs = {
        pool: pool,
        signer: user.publicKey,
        boundPoolSignerPda: this.findSignerPda(),
        memeTicket: adminTicketId,
        poolMemeVault: boundPoolInfo.memeReserve.vault,
        poolWsolVault: boundPoolInfo.solReserve.vault,
        solMint: NATIVE_MINT,
        staking: stakingId,
        stakingPoolSignerPda: stakingSigner,
        adminVaultSol: boundPoolInfo.adminVaultSol,
        marketProgramId: PROGRAMIDS.OPENBOOK_MARKET,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        clock: SYSVAR_CLOCK_PUBKEY,
        rent: SYSVAR_RENT_PUBKEY,
        memeMint: boundPoolInfo.memeReserve.mint,
        ataProgram: ATA_PROGRAM_ID,
        user: user,
      };

      const result = await this.retryInitStakingPool(this.client, methodArgs, 3, 30000); // Retry up to 3 times with an initial timeout of 30 seconds
      console.log("initStakingPool Final result:", result);

      return result;
    } catch (error) {
      console.error("Failed to initialize staking pool:", error);
    }

    // const result = await this.client.memechanProgram.methods
    //   .initStakingPool()
    //   .accounts({
    //     pool: pool,
    //     signer: user.publicKey,
    //     boundPoolSignerPda: this.findSignerPda(),
    //     memeTicket: adminTicketId,
    //     poolMemeVault: boundPoolInfo.memeReserve.vault,
    //     poolWsolVault: boundPoolInfo.solReserve.vault,
    //     solMint: NATIVE_MINT,
    //     staking: stakingId,
    //     stakingPoolSignerPda: stakingSigner,
    //     adminVaultSol: boundPoolInfo.adminVaultSol,
    //     marketProgramId: PROGRAMIDS.OPENBOOK_MARKET,
    //     systemProgram: SystemProgram.programId,
    //     tokenProgram: TOKEN_PROGRAM_ID,
    //     clock: SYSVAR_CLOCK_PUBKEY,
    //     rent: SYSVAR_RENT_PUBKEY,
    //     memeMint: boundPoolInfo.memeReserve.mint,
    //     ataProgram: ATA_PROGRAM_ID,
    //   })
    //   .signers([user])
    //   .rpc({ skipPreflight: true });

    // console.log("initStakingPool tx result: " + result);

    return "";
  }

  public async goLive(input: Partial<GoLiveArgs>): Promise<[StakingPool]> {
    const user = input.user!;
    // const pool = input.pool ?? this.id;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const boundPoolInfo = input.boundPoolInfo as any;
    console.log("goLive.boundPoolInfo: " + JSON.stringify(boundPoolInfo));

    // tmp new test token
    // const testTokenMint = await createMint(this.client.connection, user, user.publicKey, null, 6);
    // const testTokenATA = await getOrCreateAssociatedTokenAccount(
    //   this.client.connection,
    //   user,
    //   testTokenMint,
    //   user.publicKey,
    // );

    // console.log("testTokenMint: " + testTokenMint.toBase58());
    // console.log("testTokenATA: " + testTokenATA.address.toBase58());

    // await mintTo(this.client.connection, user, testTokenMint, testTokenATA.address, user, 1000000000);

   //const baseMint = new PublicKey("DEPipWZkmZcr1sL6pVwj8amRjr9kw91UkFR7tvqdvMy2");
   //const quoteMint = new PublicKey("BfvE9DViu6SkSMBz4TYVftd5DNp7bafemMujXBdVwFYN");

    //const baseTokenInfo = { mint: boundPoolInfo.memeMint, decimals: 6 };
    const baseTokenInfo = { mint: boundPoolInfo.memeReserve.mint, decimals: 6 };
    const quoteTokenInfo = Token.WSOL;

    const { txids: createMarketTxIds, marketId } = await createMarket({
      baseToken: baseTokenInfo,
      quoteToken: quoteTokenInfo,
      wallet: user,
      connection: this.client.connection,
    });

    console.log("createMarketTxIds: " + JSON.stringify(createMarketTxIds));

    const createMarkeLatestBH0 = await this.client.connection.getLatestBlockhash("confirmed");
    const createMarketTxResult = await this.client.connection.confirmTransaction(
      {
        signature: createMarketTxIds[0],
        blockhash: createMarkeLatestBH0.blockhash,
        lastValidBlockHeight: createMarkeLatestBH0.lastValidBlockHeight,
      },
      "confirmed",
    );

    if (createMarketTxResult.value.err) {
      console.error("createMarketTxResult", createMarketTxResult);
      throw new Error("createMarketTxResult failed");
    }

    console.log("marketId", marketId.toBase58());

    const stakingId = BoundPool.findStakingPda(boundPoolInfo.memeReserve.mint, this.client.memechanProgram.programId);
    const stakingSigner = StakingPool.findSignerPda(stakingId, this.client.memechanProgram.programId);

    console.log("stakingId: " + stakingId.toBase58());

     const transferTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: user.publicKey,
        toPubkey: stakingSigner,
        lamports: 2_000_000_000,
      })
    );

    const transferSignature = await sendAndConfirmTransaction(this.client.connection, transferTx, [user], {
      skipPreflight: true,
    });

    console.log("transferSignature: " + transferSignature);

    const transferTxBH0 = await this.client.connection.getLatestBlockhash("confirmed");
    const transferTxSyncResult = await this.client.connection.confirmTransaction(
      {
        signature: transferSignature,
        blockhash: transferTxBH0.blockhash,
        lastValidBlockHeight: transferTxBH0.lastValidBlockHeight,
      },
      "confirmed",
    );

    if (transferTxSyncResult.value.err) {
      console.error("transferTxSyncResult error: ", JSON.stringify(createMarketTxResult));
      throw new Error("transferTxSyncResult failed");
    }
    else
    {
      console.log("transferTxSyncResult: " + JSON.stringify(transferTxSyncResult));
    }

    const feeDestination = new PublicKey(process.env.FEE_DESTINATION_ID as string);
    const ammId = BoundPool.getAssociatedId({ programId: PROGRAMIDS.AmmV4, marketId });
    const raydiumAmmAuthority = BoundPool.getAssociatedAuthority({ programId: PROGRAMIDS.AmmV4 });
    const openOrders = BoundPool.getAssociatedOpenOrders({ programId: PROGRAMIDS.AmmV4, marketId });
    const targetOrders = BoundPool.getAssociatedTargetOrders({ programId: PROGRAMIDS.AmmV4, marketId });
    const ammConfig = BoundPool.getAssociatedConfigId({ programId: PROGRAMIDS.AmmV4 });
    const raydiumLpMint = BoundPool.getAssociatedLpMint({ programId: PROGRAMIDS.AmmV4, marketId });

    const raydiumMemeVault = BoundPool.getAssociatedBaseVault({ programId: PROGRAMIDS.AmmV4, marketId });
    const raydiumWsolVault = BoundPool.getAssociatedQuoteVault({ programId: PROGRAMIDS.AmmV4, marketId });

    const userDestinationLpTokenAta = BoundPool.getATAAddress(stakingSigner, raydiumLpMint, TOKEN_PROGRAM_ID).publicKey;

    try {
      const result = await this.client.memechanProgram.methods
        .goLive(raydiumAmmAuthority.nonce)
        .accounts({
          signer: user.publicKey,
          poolMemeVault: input.memeVault,
          poolWsolVault: input.wSolVault,
          solMint: NATIVE_MINT,
          staking: stakingId,
          stakingPoolSignerPda: stakingSigner,
          raydiumLpMint: raydiumLpMint,
          raydiumAmm: ammId,
          raydiumAmmAuthority: raydiumAmmAuthority.publicKey,
          raydiumMemeVault: raydiumMemeVault,
          raydiumWsolVault: raydiumWsolVault,
          marketProgramId: PROGRAMIDS.OPENBOOK_MARKET,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          marketAccount: marketId,
          clock: SYSVAR_CLOCK_PUBKEY,
          rent: SYSVAR_RENT_PUBKEY,
          openOrders: openOrders,
          targetOrders: targetOrders,
          memeMint: boundPoolInfo.memeReserve.mint,
          ammConfig: ammConfig,
          ataProgram: ATA_PROGRAM_ID,
          feeDestinationInfo: feeDestination,
          userDestinationLpTokenAta: userDestinationLpTokenAta,
          raydiumProgram: PROGRAMIDS.AmmV4,
        })
        .signers([user]) // ammid?
        .rpc({ skipPreflight: true });

      console.log("goLive Transaction successful:", result);

      return [
        new StakingPool(stakingId, this.client),
      ];
    } catch (error) {
      if (error instanceof AnchorError) {
        console.error("Error details:", error);
        if (error.logs) {
          error.logs.forEach((log) => console.log("Program log:", log));
        }
      } else {
        console.error("Unexpected error:", error);
      }

      throw error;
    }
  }

static getATAAddress(owner: PublicKey, mint: PublicKey, programId: PublicKey) {
  return findProgramAddress(
    [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
    new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
  )
}

  static getAssociatedId({ programId, marketId }: { programId: PublicKey; marketId: PublicKey }) {
    const { publicKey } = findProgramAddress(
      [programId.toBuffer(), marketId.toBuffer(), Buffer.from('amm_associated_seed', 'utf-8')],
      programId,
    )
    return publicKey
  }

  static getAssociatedAuthority({ programId }: { programId: PublicKey }) {
    return findProgramAddress(
      // new Uint8Array(Buffer.from('amm authority'.replace('\u00A0', ' '), 'utf-8'))
      [Buffer.from([97, 109, 109, 32, 97, 117, 116, 104, 111, 114, 105, 116, 121])],
      programId,
    )
  }

  static getAssociatedBaseVault({ programId, marketId }: { programId: PublicKey; marketId: PublicKey }) {
    const { publicKey } = findProgramAddress(
      [programId.toBuffer(), marketId.toBuffer(), Buffer.from('coin_vault_associated_seed', 'utf-8')],
      programId,
    )
    return publicKey
  }

  static getAssociatedQuoteVault({ programId, marketId }: { programId: PublicKey; marketId: PublicKey }) {
    const { publicKey } = findProgramAddress(
      [programId.toBuffer(), marketId.toBuffer(), Buffer.from('pc_vault_associated_seed', 'utf-8')],
      programId,
    )
    return publicKey
  }

  static getAssociatedLpMint({ programId, marketId }: { programId: PublicKey; marketId: PublicKey }) {
    const { publicKey } = findProgramAddress(
      [programId.toBuffer(), marketId.toBuffer(), Buffer.from('lp_mint_associated_seed', 'utf-8')],
      programId,
    )
    return publicKey
  }

  static getAssociatedLpVault({ programId, marketId }: { programId: PublicKey; marketId: PublicKey }) {
    const { publicKey } = findProgramAddress(
      [programId.toBuffer(), marketId.toBuffer(), Buffer.from('temp_lp_token_associated_seed', 'utf-8')],
      programId,
    )
    return publicKey
  }

  static getAssociatedTargetOrders({ programId, marketId }: { programId: PublicKey; marketId: PublicKey }) {
    const { publicKey } = findProgramAddress(
      [programId.toBuffer(), marketId.toBuffer(), Buffer.from('target_associated_seed', 'utf-8')],
      programId,
    )
    return publicKey
  }

  static getAssociatedWithdrawQueue({ programId, marketId }: { programId: PublicKey; marketId: PublicKey }) {
    const { publicKey } = findProgramAddress(
      [programId.toBuffer(), marketId.toBuffer(), Buffer.from('withdraw_associated_seed', 'utf-8')],
      programId,
    )
    return publicKey
  }

  static getAssociatedOpenOrders({ programId, marketId }: { programId: PublicKey; marketId: PublicKey }) {
    const { publicKey } = findProgramAddress(
      [programId.toBuffer(), marketId.toBuffer(), Buffer.from('open_order_associated_seed', 'utf-8')],
      programId,
    )
    return publicKey
  }

  static getAssociatedConfigId({ programId }: { programId: PublicKey }) {
    const { publicKey } = findProgramAddress([Buffer.from('amm_config_account_seed', 'utf-8')], programId)
    return publicKey
  }

  async airdrop(connection: Connection, to: PublicKey, amount: number = 5_000_000_000) {
  await connection.confirmTransaction(
    await connection.requestAirdrop(to, amount),
    "confirmed"
  );
}
}
