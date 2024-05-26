import * as splToken from "@solana/spl-token";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import { MEMECHAN_MEME_TOKEN_DECIMALS } from "../config/config";

export interface TokenData {
  mint: PublicKey;
  startingPrice: number;
  nbDecimals: number;
  priceOracle: Keypair | undefined;
}

export class MintUtils {
  private conn: Connection;
  private authority: Keypair;

  constructor(conn: Connection, authority: Keypair) {
    this.conn = conn;
    this.authority = authority;
  }

  async createMint(nbDecimals = MEMECHAN_MEME_TOKEN_DECIMALS): Promise<PublicKey> {
    const kp = Keypair.generate();
    return await splToken.createMint(
      this.conn,
      this.authority,
      this.authority.publicKey,
      null,
      // this.authority.publicKey,
      nbDecimals,
      kp,
    );
  }

  public async createMints(nbMints: number): Promise<PublicKey[]> {
    return await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Array.from(Array(nbMints).keys()).map((_) => {
        return this.createMint();
      }),
    );
  }

  public async createNewToken(nbDecimals = MEMECHAN_MEME_TOKEN_DECIMALS, startingPrice = 1_000_000) {
    const mint = await this.createMint(nbDecimals);
    const tokenData: TokenData = {
      mint: mint,
      startingPrice: startingPrice,
      nbDecimals: nbDecimals,
      priceOracle: undefined,
    };
    return tokenData;
  }

  public async createTokenAccount(mint: PublicKey, payer: Keypair, owner: PublicKey) {
    const account = Keypair.generate();
    return splToken.createAccount(this.conn, payer, mint, owner, account);
  }

  public async getOrCreateTokenAccount(mint: PublicKey, payer: Keypair, owner: PublicKey) {
    return await splToken.getOrCreateAssociatedTokenAccount(this.conn, payer, mint, owner, false);
  }

  public async mintTo(mint: PublicKey, tokenAccount: PublicKey, amount: bigint = BigInt("0x2F00000000000000")) {
    await splToken.mintTo(this.conn, this.authority, mint, tokenAccount, this.authority, amount);
  }
}
