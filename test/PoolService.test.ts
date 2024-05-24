import { SolanaSeedPool, solanaLivePool, solanaSeedPool, solanaStakingPool } from "../src/api/schemas/pools-schema";
import { BE_URL } from "../src/config/config";
import { PoolAPI } from "../src/api/PoolApi";

const api = new PoolAPI(BE_URL);

describe("PoolService", () => {
  let sp: SolanaSeedPool | undefined;

  test("get all seed pools", async () => {
    const pools = await api.getAllSeedPools();
    expect(Array.isArray(pools.result)).toBe(true);
    for (const parsedResult of pools.result) {
      solanaSeedPool.parse(parsedResult);
    }
    sp = pools.result[0];
  });

  test("Get a pool for a specific coin", async () => {
    if (sp) {
      const pool = await api.getSeedPoolByTokenAddress(sp.tokenAddress);
      solanaSeedPool.parse(pool);
    }
  });

  test("Ensure that the staking pools is returning the staking pools stored into BE", async () => {
    const poolApi = new PoolAPI(BE_URL);
    const { result: stakingPools } = await poolApi.getStakingPools();
    expect(Array.isArray(stakingPools)).toBe(true);
    for (const parsedResult of stakingPools) {
      solanaStakingPool.parse(parsedResult);
    }
  });

  test("Get a pool for a specific coin", async () => {
    if (sp) {
      const pool = await api.getSeedPoolByTokenAddress(sp.tokenAddress);
      solanaSeedPool.parse(pool);
    }
  });

  test("Ensure that the live pools is returning the live pools stored into BE", async () => {
    const poolApi = new PoolAPI(BE_URL);
    const { result: livePools } = await poolApi.getLivePools();
    expect(Array.isArray(livePools)).toBe(true);
    for (const parsedResult of livePools) {
      if (solanaLivePool.safeParse(parsedResult).success) {
        console.warn("Invalid live pool found with format", parsedResult);
      }
    }
  });
});
