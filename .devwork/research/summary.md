# Research Summary

## Prompt
# PR #220: Simple APR calculation

## Description
Average APR calculation using current token price values.

## Diff
```diff
diff --git a/src/config/config.ts b/src/config/config.ts
index 6f7fd27d..53dafeae 100644
--- a/src/config/config.ts
+++ b/src/config/config.ts
@@ -96,3 +96,5 @@ export const CHAN_TOKEN = new PublicKey("ChanGGuDHboPswpTmKDfsTVGQL96VHhmvpwrE4U
 export const CHAN_TOKEN_DECIMALS = 9;
 export const PRESALE_AMOUNT_IN_CHAN = new BigNumber(380_000_000);
 export const PRESALE_AMOUNT_IN_CHAN_RAW = PRESALE_AMOUNT_IN_CHAN.multipliedBy(10 ** CHAN_TOKEN_DECIMALS);
+
+export const VCHAN_TOKEN_DECIMALS = 9;
diff --git a/src/vechan-vesting/VeChanStakingClient.ts b/src/vechan-vesting/VeChanStakingClient.ts
index 7f6485c0..7bced726 100644
--- a/src/vechan-vesting/VeChanStakingClient.ts
+++ b/src/vechan-vesting/VeChanStakingClient.ts
@@ -26,7 +26,7 @@ import {
   getUserRewardsPDA,
   getUserStakeSigner,
 } from "./utils";
-import { COMPUTE_UNIT_PRICE, TOKEN_INFOS, WSOL_DECIMALS } from "../config/config";
+import { COMPUTE_UNIT_PRICE, TOKEN_INFOS, VCHAN_TOKEN_DECIMALS, WSOL_DECIMALS } from "../config/config";
 import { Reward, UserRewards, UserStake } from "./schema/codegen/accounts";
 import BigNumber from "bignumber.js";
 import { ParsedReward } from "./types";
@@ -135,6 +135,46 @@ export class VeChanStakingClient {
     return parsedRewards;
   }
 
+  public static getRewardAPR(reward: ParsedReward, vChanPrice: BigNumber, solPrice: BigNumber) {
+    const timeTotalDays = new BigNumber(30);
+    const totalRewardUsdValue = new BigNumber(reward.fields.rewardAmount.toString())
+      .multipliedBy(solPrice)
+      .dividedBy(WSOL_DECIMALS);
+
+    const totalStakeUsdValue = new BigNumber(reward.fields.stakesTotal.toString())
+      .multipliedBy(vChanPrice)
+      .dividedBy(10 ** VCHAN_TOKEN_DECIMALS);
+
+    return totalRewardUsdValue.multipliedBy(new BigNumber(365)).dividedBy(totalStakeUsdValue).dividedBy(timeTotalDays);
+  }
+
+  public static getRewardsAvgAPR(rewards: ParsedReward[], vChanPrice: BigNumber, solPrice: BigNumber) {
+    const aprs: BigNumber[] = rewards.map((reward) => VeChanStakingClient.getRewardAPR(reward, vChanPrice, solPrice));
+    const totalAPR = aprs.reduce((sum, current) => sum.plus(current), new BigNumber(0));
+    return totalAPR.dividedBy(rewards.length);
+  }
+
+  public static getAvgAPR(allRewards: ParsedReward[], vChanPrice: BigNumber, solPrice: BigNumber) {
+    let rewardTotal = new BN(0);
+    let stakeTotalAvg = new BN(0);
+    for (const reward of allRewards) {
+      rewardTotal = rewardTotal.add(reward.fields.rewardAmount);
+      stakeTotalAvg = stakeTotalAvg.add(reward.fields.stakesTotal);
+    }
+
+    stakeTotalAvg = stakeTotalAvg.div(new BN(allRewards.length));
+
+    const timeTotal = allRewards[allRewards.length - 1].fields.timestamp.sub(allRewards[0].fields.timestamp);
+    const timeTotalDays = new BigNumber(timeTotal.div(new BN(3600 * 24)).toString());
+    const totalRewardUsdValue = new BigNumber(rewardTotal.toString()).dividedBy(WSOL_DECIMALS).multipliedBy(solPrice);
+
+    const totalStakeUsdValue = new BigNumber(stakeTotalAvg.toString())
+      .dividedBy(10 ** VCHAN_TOKEN_DECIMALS)
+      .multipliedBy(vChanPrice);
+
+    return totalRewardUsdValue.multipliedBy(new BigNumber(365)).dividedBy(totalStakeUsdValue).dividedBy(timeTotalDays);
+  }
+
   /**
    * Get the number of tokens that can be withdrawn by user for the provided userRewards account
    */
```

## Task
Average APR calculation using current token price values.


## Findings
## Detailed Research Summary

### Project Overview
This is a TypeScript SDK for memechan.gg built on Solana blockchain. It's a monorepo with the main SDK at `/tmp/claudev-pr-67377`.

---

### Package Versions
| Package | Version in package.json | Latest |
|---------|------------------------|--------|
| bignumber.js | ^9.1.2 | 9.3.1 |
| bn.js | ^5.2.1 | 5.2.1 |
| @solana/web3.js | ^1.91.8 | Latest: ~2.x |
| @coral-xyz/anchor | 0.29.0 | Latest: 0.30.x |
| typescript | ^5.4.5 | 5.7.x |

---

### Code Already Implemented (PR #220)

The diff shows three new static methods added to `VeChanStakingClient`:

1. **`getRewardAPR(reward, vChanPrice, solPrice)`** (line 138)
   - Calculates APR for a single reward period
   - Uses fixed 30-day period (`timeTotalDays = new BigNumber(30)`)
   - Formula: `(rewardUSD / stakeUSD) * 365 / 30`

2. **`getRewardsAvgAPR(rewards, vChanPrice, solPrice)`** (line 151)
   - Averages APRs from multiple rewards
   - Simple mean calculation

3. **`getAvgAPR(allRewards, vChanPrice, solPrice)`** (line 157)
   - Calculates weighted average using total rewards and average stake
   - Uses actual time difference between first and last reward

---

### Configuration Already Added

**`src/config/config.ts`** - Line 99:
```typescript
export const VCHAN_TOKEN_DECIMALS = 9;
```

---

### Key Implementation Details

**Import statement** (already in VeChanStakingClient.ts line 26):
```typescript
import { COMPUTE_UNIT_PRICE, TOKEN_INFOS, VCHAN_TOKEN_DECIMALS, WSOL_DECIMALS } from "../config/config";
```

**API Method Signatures:**
```typescript
// Public static methods - all take parsed rewards and price BigNumbers
public static getRewardAPR(reward: ParsedReward, vChanPrice: BigNumber, solPrice: BigNumber): BigNumber

public static getRewardsAvgAPR(rewards: ParsedReward[], vChanPrice: BigNumber, solPrice: BigNumber): BigNumber

public static getAvgAPR(allRewards: ParsedReward[], vChanPrice: BigNumber, solPrice: BigNumber): BigNumber
```

**Dependencies:**
- `BigNumber` from "bignumber.js" - used for all decimal calculations
- `BN` from "@coral-xyz/anchor" - used for integer arithmetic on chain data
- `ParsedReward` from local types
- `WSOL_DECIMALS` = 1_000_000_000 (9 decimals)

---

### Project Structure Conventions
- Source code: `/src`
- Config: `/src/config/config.ts`
- Staking client: `/src/vechan-vesting/VeChanStakingClient.ts`
- Uses BigNumber.js for financial calculations (not native JS numbers)
- Uses BN.js for on-chain integer operations

---

### Gotchas / Notes
1. **Fixed time period**: `getRewardAPR` uses hardcoded 30 days - this may need to be dynamic based on actual reward period
2. **Division by zero risk**: Methods don't check for zero stakes or prices
3. **Time calculation in `getAvgAPR`**: Uses `3600 * 24` seconds per day (86400), which is correct
4. **The import already includes VCHAN_TOKEN_DECIMALS** - the diff shows it's already properly imported
5. Both `.multipliedBy()` and `.dividedBy()` are BigNumber.js methods (not `.times()` / `.div()`)
