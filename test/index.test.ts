import * as authService from "./AuthService.test";
import * as chartApi from "./ChartApi.test";
import * as socialAPI from "./SocialAPI.test";
import * as tokenApi from "./TokenAPI.test";
import * as validation from "./Validation.test";
import * as poolService from "./PoolService.test";

describe("sdk tests", () => {
  describe("BE", () => {
    authService.test();
    chartApi.test();
    poolService.test();
    socialAPI.test();
    tokenApi.test();
    validation.test();
  });
});
