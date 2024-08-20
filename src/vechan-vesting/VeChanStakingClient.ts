import { PublicKey, Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { BN, Program } from "@coral-xyz/anchor";
import { IDL, Staking } from "./schema/types/staking";
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { getStakingStatePDA, getStakingStateSigner, getUserStakeSigner } from "./utils";
import { TOKEN_INFOS } from "../config/config";

export class VeChanStakingClient {
  public program: Program<Staking>;
  private vChanMint: PublicKey;
  private veChanMint: PublicKey;
  private stakingState: PublicKey;
  private stakingStateSigner: PublicKey;

  constructor(programId: PublicKey) {
    this.program = new Program(IDL, programId);
    this.vChanMint = TOKEN_INFOS.vCHAN.mint;
    this.veChanMint = TOKEN_INFOS.veCHAN.mint;
    this.stakingState = getStakingStatePDA(this.vChanMint, this.veChanMint);
    this.stakingStateSigner = getStakingStateSigner(this.stakingState);
  }

  async buildStakeTokensTransaction(
    user: Keypair,
    time: BN,
    amount: BN,
    userVAcc: PublicKey,
    userVeAcc: PublicKey,
    vesting: PublicKey | null,
  ): Promise<{ transaction: Transaction; signers: Keypair[] }> {
    const stake = Keypair.generate();
    const stakeSigner = getUserStakeSigner(stake.publicKey);
    const vault = getAssociatedTokenAddressSync(this.vChanMint, stakeSigner, true);

    const vaultCTX = createAssociatedTokenAccountInstruction(user.publicKey, vault, stakeSigner, this.vChanMint);

    const stakeTokensInstruction = await this.program.methods
      .stakeTokens(time, amount)
      .accounts({
        signer: user.publicKey,
        stake: stake.publicKey,
        stakeSigner: stakeSigner,
        stakingState: this.stakingState,
        stakingStateSigner: this.stakingStateSigner,
        vesting,
        userVAcc,
        userVeAcc,
        vault: vault,
        vMint: this.vChanMint,
        veMint: this.veChanMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        token2022: TOKEN_2022_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    const transaction = new Transaction().add(vaultCTX, stakeTokensInstruction);

    return { transaction, signers: [user, stake] };
  }

  async buildUnstakeTokensTransaction(
    user: Keypair,
    stake: PublicKey,
  ): Promise<{ transaction: Transaction; signers: Keypair[] }> {
    const stakeSigner = getUserStakeSigner(stake);
    const userVAcc = getAssociatedTokenAddressSync(this.vChanMint, user.publicKey);
    const userVeAcc = getAssociatedTokenAddressSync(this.veChanMint, user.publicKey, false, TOKEN_2022_PROGRAM_ID);
    const vault = getAssociatedTokenAddressSync(this.vChanMint, stakeSigner, true);

    const unstakeTokensInstruction = await this.program.methods
      .unstakeTokens()
      .accounts({
        signer: user.publicKey,
        stake,
        stakeSigner: stakeSigner,
        stakingState: this.stakingState,
        userVAcc,
        userVeAcc,
        vault,
        vMint: this.vChanMint,
        veMint: this.veChanMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        token2022: TOKEN_2022_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    const transaction = new Transaction().add(unstakeTokensInstruction);

    return { transaction, signers: [user] };
  }
}
