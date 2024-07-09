import { PublicKey } from "@solana/web3.js";
import { getTokenInfoByMint, TOKEN_INFOS } from "../../../src";

// yarn tsx examples/v2/token-info/get-token-info.ts
(async () => {
  const memeMint = new PublicKey("HZUAFBsoVPb2u1paMmiNjc6QvRioXTYNvC3zXtu3HxMX");
  const tokenInfo = getTokenInfoByMint(memeMint);
  console.debug("memeMint tokenInfo: ", tokenInfo);

  const WSOLMint = TOKEN_INFOS.WSOL.mint;
  const wsolTokenInfo = getTokenInfoByMint(WSOLMint);
  console.debug("WSOL tokeninfo: ", wsolTokenInfo);

  const SLERFMint = TOKEN_INFOS.SLERF.mint;
  const slerfTokenInfo = getTokenInfoByMint(SLERFMint);
  console.debug("SLERF tokeninfo: ", slerfTokenInfo);
})();
