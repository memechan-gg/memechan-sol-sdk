import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import { isSorted } from "./utils";
import { TokenAPI } from "../src/api/TokenAPI";
import { Auth } from "../src/api/auth/Auth";
import { SocialAPI } from "../src/api/social/SocialAPI";
import { SolanaToken } from "../src/api/schemas/token-schemas";
import { BE_URL } from "../src";

const socialAPI = new SocialAPI(BE_URL);

export function test() {
  describe("Threads fetching", () => {
    let token: SolanaToken | undefined;
    let threadId: string | undefined;

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
      const tokenApi = new TokenAPI();
      const { token: tokenFetched } = await tokenApi.createToken({
        txDigests: ["HFKiTCkDmw1ZRuhSSBmRde7Lt6GnqwbcE3wqgQ2tVf55"],
        socialLinks: {
          twitter: "mytwitter",
          discord: "mydiscord",
        },
      });
      token = tokenFetched;
      for (let i = 0; i < 2; i++) {
        await socialAPI.createThread({
          message: `Test message ${i}`,
          coinType: token.address,
        });
        const { result } = await socialAPI.getThreads({
          sortBy: "creationTime",
          direction: "desc",
          coinType: token.address,
        });
        const alreadyLiked1 = await socialAPI.getLike({
          threadId: result[0].id,
          creator: keypair.publicKey.toBase58(),
        });
        expect(alreadyLiked1).toBe(false);
        await socialAPI.like({
          coinType: token.address,
          threadId: result[0].id,
        });
        const alreadyLiked2 = await socialAPI.getLike({
          threadId: result[0].id,
          creator: keypair.publicKey.toBase58(),
        });
        expect(alreadyLiked2).toBe(true);
        await socialAPI.unlike({
          coinType: token.address,
          threadId: result[0].id,
        });
        const alreadyLiked3 = await socialAPI.getLike({
          threadId: result[0].id,
          creator: keypair.publicKey.toBase58(),
        });
        expect(alreadyLiked3).toBe(false);
        const nReplies = Math.floor(Math.random() * (3 - 0 + 1)) + 0;
        for (let j = 0; j < nReplies; j++) {
          await socialAPI.createThreadReply({
            coinType: token.address,
            threadId: result[0].id,
            message: `Reply ${j}`,
          });
          const reply = await socialAPI.getThreadReplies({
            sortBy: "creationTime",
            direction: "desc",
            threadId: result[0].id,
          });
          const nLikes = Math.floor(Math.random() * (5 - 0 + 1)) + 0;
          for (let l = 0; l < nLikes; l++) {
            await socialAPI.like({
              coinType: token.address,
              threadId: result[0].id,
              replyId: reply.result[0].id,
            });
          }
        }
      }
    });

    it("check queryThreads retrieve successfully all threads, sorted by creationTime asc", async () => {
      const { result } = await socialAPI.getThreads({
        sortBy: "creationTime",
        direction: "asc",
        coinType: token!.address,
      });
      expect(isSorted(result, "creationDate", "asc")).toBe(true);
    });

    it("check queryThreads retrieve successfully all threads, sorted by likeCount asc", async () => {
      const { result } = await socialAPI.getThreads({
        sortBy: "likeCount",
        direction: "asc",
        coinType: token!.address,
      });
      expect(isSorted(result, "likeCounter", "asc")).toBe(true);
    });

    it("check queryThreads retrieve successfully all threads, sorted by replyCounter asc", async () => {
      const { result } = await socialAPI.getThreads({
        sortBy: "replyCount",
        direction: "asc",
        coinType: token!.address,
      });
      expect(isSorted(result, "replyCounter", "asc")).toBe(true);
    });

    it("check queryThreads retrieve successfully all threads, sorted by creationTime desc", async () => {
      const { result } = await socialAPI.getThreads({
        sortBy: "creationTime",
        direction: "desc",
        coinType: token!.address,
      });
      expect(isSorted(result, "creationDate", "desc")).toBe(true);
    });

    it("check queryThreads retrieve successfully all threads, sorted by likeCount desc", async () => {
      const { result } = await socialAPI.getThreads({
        sortBy: "likeCount",
        direction: "desc",
        coinType: token!.address,
      });
      expect(isSorted(result, "likeCounter", "desc")).toBe(true);
    });

    it("check queryThreads retrieve successfully all threads, sorted by replyCounter desc", async () => {
      const { result } = await socialAPI.getThreads({
        sortBy: "replyCount",
        direction: "desc",
        coinType: token!.address,
      });
      threadId = result[0].id;
      expect(isSorted(result, "replyCounter", "desc")).toBe(true);
    });

    it("check queryThreadsReplies retrieve successfully all threads, sorted by creationTime desc", async () => {
      const { result } = await socialAPI.getThreadReplies({
        sortBy: "creationTime",
        direction: "desc",
        threadId: threadId!,
      });
      expect(isSorted(result, "creationDate", "desc")).toBe(true);
    });

    it("check queryThreadReplies retrieve successfully all threads, sorted by likeCount desc", async () => {
      const { result } = await socialAPI.getThreadReplies({
        sortBy: "likeCount",
        direction: "desc",
        threadId: threadId!,
      });
      expect(isSorted(result, "likeCounter", "desc")).toBe(true);
    });

    it("check queryThreadsReplies retrieve successfully all threads replies, sorted by creationTime asc", async () => {
      const { result } = await socialAPI.getThreadReplies({
        sortBy: "creationTime",
        direction: "asc",
        threadId: threadId!,
      });
      expect(isSorted(result, "creationDate", "asc")).toBe(true);
    });

    it("check queryThreadReplies retrieve successfully all threads replies, sorted by likeCount asc", async () => {
      const { result } = await socialAPI.getThreadReplies({
        sortBy: "likeCount",
        direction: "asc",
        threadId: threadId!,
      });
      expect(isSorted(result, "likeCounter", "asc")).toBe(true);
    });
  });
}
