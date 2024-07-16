import { PublicKey } from "@solana/web3.js";
import { getConfig, getTokenInfoByMint } from "../../../src";

// yarn tsx examples/v2/token-info/get-token-info.ts
(async () => {
  const memeMint = new PublicKey("HZUAFBsoVPb2u1paMmiNjc6QvRioXTYNvC3zXtu3HxMX");
  const tokenInfo = await getTokenInfoByMint(memeMint);
  console.debug("memeMint tokenInfo: ", tokenInfo);

  const { TOKEN_INFOS } = await getConfig();
  const WSOLMint = TOKEN_INFOS.WSOL.mint;
  const wsolTokenInfo = await getTokenInfoByMint(WSOLMint);
  console.debug("WSOL tokeninfo: ", wsolTokenInfo);

  const SLERFMint = TOKEN_INFOS.SLERF.mint;
  const slerfTokenInfo = await getTokenInfoByMint(SLERFMint);
  console.debug("SLERF tokeninfo: ", slerfTokenInfo);
})();
