import { Keypair } from "@solana/web3.js";
import { Auth } from "../src/api/auth/Auth";
import { BE_URL, isSorted } from "./utils";
import nacl from "tweetnacl";
import { TokenAPI } from "../src/api/TokenAPI";
import { SolanaToken, solanaTokenSchema } from "../src/api/schemas/token-schemas";
// eslint-disable-next-line max-len

describe("TokenService authenticated operations", () => {
  beforeAll(async () => {
    const authService = new Auth(BE_URL);
    const keypair = new Keypair();
    const messageToSign = await authService.requestMessageToSign(keypair.publicKey.toBase58());
    console.log("message to sign", messageToSign, keypair.publicKey.toBase58());
    const signature = nacl.sign.detached(Buffer.from(messageToSign), keypair.secretKey);
    await authService.refreshSession({
      walletAddress: keypair.publicKey.toBase58(),
      signedMessage: Buffer.from(signature).toString("hex"),
    });
    console.log("Wallet authenticated");
  });

  test("Create a token", async () => {
    const tokenApi = new TokenAPI(BE_URL);
    /* 
    UNCOMMENT IN CASE YOU WANT TO CREATE A NEW TX, remember to use the SUI_WALLET_SEED_PHRASE env var
    const { digest } = await createCoinAndTicket({
      description: "testtoken4am description",
      name: "testtoken4am",
      signerAddress: user,
      symbol: "TEST_TOKEN_4am",
      url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8iB11vE7qmEdgHxD7Hnm4_gi6R4KJ9B8nzs_su6iaGg&s",
      decimals: "9",
      fixedSupply: false,
      mintAmount: "9000",
    });
    */

    const { token } = await tokenApi.createToken({
      txDigests: ["37QSkf6zxCASvBqTLso1n67Asx3o6hTcJxaAprvPDhvgfLXZn8qBCGAPtG4fmLfPx7yuha5UPcSiTGKvbEQvy9Q8"],
      socialLinks: {
        twitter: "mytwitter",
        discord: "mydiscord",
      },
    });
  });
});

describe("CoinService unauthenticated operations", () => {
  let token: SolanaToken;
  test("check queryCoins retrieve successfully all coins, sorted by marketcap in asc", async () => {
    const tokenService = new TokenAPI(BE_URL);
    const { result } = await tokenService.queryTokens({
      status: "PRESALE",
      sortBy: "marketcap",
      direction: "asc",
    });
    expect(isSorted(result, "marketcap", "asc")).toBe(true);
    token = result[0];
  });

  test("check queryCoins retrieve successfully all coins, sorted by marketcap in desc", async () => {
    const tokenService = new TokenAPI(BE_URL);
    const { result } = await tokenService.queryTokens({
      status: "PRESALE",
      sortBy: "marketcap",
      direction: "desc",
    });
    expect(isSorted(result, "marketcap", "desc")).toBe(true);
  });

  test("check queryCoins retrieve successfully all coins, sorted by lastReply in desc", async () => {
    const tokenService = new TokenAPI(BE_URL);
    const { result } = await tokenService.queryTokens({
      status: "PRESALE",
      sortBy: "lastReply",
      direction: "desc",
    });
    expect(isSorted(result, "lastReply", "desc")).toBe(true);
  });

  test("check queryCoins retrieve successfully all coins, sorted by lastReply in asc", async () => {
    const tokenService = new TokenAPI(BE_URL);
    const { result } = await tokenService.queryTokens({
      status: "PRESALE",
      sortBy: "lastReply",
      direction: "asc",
    });
    expect(isSorted(result, "lastReply", "asc")).toBe(true);
  });

  test("check queryCoins retrieve successfully all coins, sorted by creationTime in desc", async () => {
    const tokenService = new TokenAPI(BE_URL);
    const { result } = await tokenService.queryTokens({
      status: "PRESALE",
      sortBy: "creationTime",
      direction: "desc",
    });
    expect(isSorted(result, "creationTime", "desc")).toBe(true);
  });

  test("check queryCoins retrieve successfully all coins, sorted by creationTime in asc", async () => {
    const tokenService = new TokenAPI(BE_URL);
    const { result } = await tokenService.queryTokens({
      status: "PRESALE",
      sortBy: "creationTime",
      direction: "asc",
    });
    expect(isSorted(result, "creationTime", "asc")).toBe(true);
  });

  test("check getCoin on presale by coinType is retrieved successfully", async () => {
    const tokenService = new TokenAPI(BE_URL);
    const result = await tokenService.getToken("PRESALE", token.address);
    solanaTokenSchema.parse(result);
  });
});
