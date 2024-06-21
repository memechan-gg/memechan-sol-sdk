import * as authService from "./AuthService.test";
import * as chartApi from "./ChartApi.test";
import * as txParsing from "./TxParsing.test";
import * as quoteTokenMint from "./QuoteTokenMint.test";
import * as socialAPI from "./SocialAPI.test";
import * as tokenApi from "./TokenAPI.test";
import * as boundPool from "./BoundPool.test";
import * as memeTicket from "./MemeTicket.test";
import * as boundPoolCreation from "./BoundPool.Creation.test";
import * as boundPoolTrading from "./BoundPool.Trading.test";
import * as holders from "./Holders.test";
import * as stakingPool from "./StakingPool.test";
import * as swapY from "./SwapY.test";
import * as swapX from "./SwapX.test";
import * as targetConfig from "./TargetConfig.test";
import * as validation from "./Validation.test";
import * as poolService from "./PoolService.test";

describe("sdk tests", () => {
  describe("BE", () => {
    authService.test();
    chartApi.test();
    poolService.test();
    socialAPI.test();
    tokenApi.test();
    txParsing.test();
  });

  describe.skip("contract", () => {
    boundPoolCreation.test();
    boundPool.test();
    boundPoolTrading.test();
    holders.test();
    memeTicket.test();
    quoteTokenMint.test();
    stakingPool.test();
    swapX.test();
    swapY.test();
    targetConfig.test();
    validation.test();
  });
});
