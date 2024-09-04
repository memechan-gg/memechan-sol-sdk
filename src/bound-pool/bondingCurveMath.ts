// import { IdlTypes } from "@coral-xyz/anchor";
// import BigNumber from "bignumber.js";
// import { MemechanSol } from "../schema/types/memechan_sol";
// import BN, { min } from "bn.js";
// import { BoundPool } from "../schema/codegen/accounts";
// import { DECIMALS_S } from "../config/config";

// export type SwapAmount = {
//   amount_in: BigNumber;
//   amount_out: BigNumber;
//   admin_fee_in: BigNumber;
//   admin_fee_out: BigNumber;
// };

// export type Config = IdlTypes<MemechanSol>["Config"];

// export type Fees = IdlTypes<MemechanSol>["Fees"];

// const PRECISION = new BN("1000000000");

// export function buy_meme_swap_amounts(
//   bp: BoundPool,
//   balanceMeme: BigNumber,
//   balanceQuote: BigNumber,
//   deltaS: BigNumber,
//   minDeltaM: BigNumber,
// ): SwapAmount {
//   let [m_t0, s_t0] = balances(bp);

//   let delta_s = new BN(deltaS.toString());
//   let min_delta_m = new BN(minDeltaM.toString());

//   let p = bp.config;

//   let max_delta_s = p.gammaS.mul(p.decimals.quote).sub(s_t0);

//   let admin_fee_in = get_fee_in_amount(bp, delta_s);
//   let is_max = delta_s.sub(admin_fee_in).gte(max_delta_s);

//   let net_delta_s = min(delta_s.sub(admin_fee_in), max_delta_s);

//   let delta_m = m_t0;
//   if (!is_max) {
//     delta_m = compute_delta_m(bp.config, s_t0, s_t0.add(net_delta_s));
//   }

//   let admin_fee_out = get_fee_out_amount(bp, delta_m);
//   let net_delta_m = delta_m.sub(admin_fee_out);

//   // if (net_delta_m.lt(min_delta_m)) {
//   //     return err
//   // }

//   return {
//     amount_in: new BigNumber(net_delta_s.toString()),
//     amount_out: new BigNumber(net_delta_m.toString()),
//     admin_fee_in: new BigNumber(admin_fee_in.toString()),
//     admin_fee_out: new BigNumber(admin_fee_out.toString()),
//   };
// }

// export function sell_meme_swap_amounts(
//   bp: BoundPool,
//   balance_meme: BigNumber,
//   balance_quote: BigNumber,
//   deltaM: BigNumber,
//   minDeltaS: BigNumber,
// ): SwapAmount {
//   let m_b = new BN(balance_meme.toString());
//   let s_b = new BN(balance_quote.toString());
//   let delta_m = new BN(deltaM.toString());
//   let min_delta_s = new BN(minDeltaS.toString());

//   let p = bp.config;

//   let max_delta_m = p.gammaM.sub(m_b); // TODO: confirm

//   let admin_fee_in = get_fee_in_amount(bp, delta_m);
//   let is_max = delta_m.sub(admin_fee_in).gt(max_delta_m); // TODO: shouldn't it be >=?

//   let net_delta_m = min(delta_m.sub(admin_fee_in), max_delta_m);

//   let delta_s = s_b;
//   if (!is_max) {
//     delta_s = compute_delta_s(bp, s_b, net_delta_m);
//   }

//   let admin_fee_out = get_fee_out_amount(bp, delta_s);
//   let net_delta_s = delta_s.sub(admin_fee_out);

//   //assert!(net_delta_s >= min_delta_s, errors::slippage());
//   // if (net_delta_s.lt(min_delta_s)) {
//   //   return err;
//   // }

//   return {
//     amount_in: new BigNumber(net_delta_m.toString()),
//     amount_out: new BigNumber(net_delta_s.toString()),
//     admin_fee_in: new BigNumber(admin_fee_in.toString()),
//     admin_fee_out: new BigNumber(admin_fee_out.toString()),
//   };
// }

// function compute_delta_m(config: Config, sA: BN, sB: BN): BN {
//   let s_a = new BN(sA.toString());
//   let s_b = new BN(sB.toString());

//   let alpha_abs = config.alphaAbs;
//   let beta = config.beta;
//   let alpha_decimals = config.decimals.alpha;
//   let beta_decimals = config.decimals.beta;

//   return delta_m1_strategy(alpha_abs, beta, alpha_decimals, beta_decimals, s_a, s_b)
//   //     Some(delta_m) => return Ok(delta_m as BN),
//   //     None => {
//   //         match delta_m2_strategy(alpha_abs, beta, alpha_decimals, beta_decimals, s_a, s_b) {
//   //             Some(delta_m) => return Ok(delta_m as BN),
//   //             None => return Err(error!(AmmError::MathOverflow)),
//   //         }
//   //     }
//   // }
// }

// function compute_delta_s(bp: BoundPool, s_b: BN, delta_m: BN): BN {
//   let alpha_abs = bp.config.alphaAbs;
//   let beta = bp.config.beta;
//   let alpha_decimals = bp.config.decimals.alpha;
//   let beta_decimals = bp.config.decimals.beta;

//   // match delta_s_strategy(alpha_abs, beta, alpha_decimals, beta_decimals, s_b, delta_m) {
//   //     Some(delta_s) => Ok(delta_s as BN),
//   //     None => Err(error!(AmmError::MathOverflow)),
//   // }
// }

// function delta_s_strategy(
//   alpha_abs: BN,
//   beta: BN,
//   alpha_decimals: BN,
//   beta_decimals: BN,
//   s_b: BN,
//   delta_m: BN,
// ) : BN {

//   let decimals_s = new BN(DECIMALS_S);

//   let u = new BN(2)
//       .mul(beta)
//       .mul(alpha_decimals)
//       .mul(decimals_s)
//       .sub(
//           new BN(2)
//               .mul(alpha_abs)
//               .mul(s_b)
//               .mul(beta_decimals),
//       );

//   if let None = u {
//       return None;
//   }
//   let u = u.unwrap();

//   let v = alpha_decimals
//       .mul(beta_decimals)
//       .mul(decimals_s);

//   if let None = v {
//       return None;
//   }
//   let v = v.unwrap();

//   let w = new BN(8).mul(delta_m).mul(alpha_abs);

//   if let None = w {
//       return None;
//   }
//   let w = w.unwrap();

//   let a = compute_a(u, alpha_decimals, w, v, new BN(1));
//   if let None = a {
//       return None;
//   }
//   let a = a.unwrap();

//   let b = ((v.pow(new BN(2))).mul(alpha_decimals)).sqrt();

//   if let None = b {
//       return None;
//   }
//   let b = b.unwrap();

//   let num_1 = vec![decimals_s, alpha_decimals, a, v];
//   let num_2 = vec![decimals_s, alpha_decimals, u, b];
//   let denom_ = vec![new BN(2), alpha_abs, b, v];

//   let left = multiply_divide(num_1, denom_.clone());
//   let right = multiply_divide(num_2, denom_);

//   left.sub_(right).map(|value| value.as_BN())
// }

// function compute_a(u: BN, alpha_decimals: BN, w: BN, v: BN, scale: BN) : BN {
//   let left = u
//       .div(scale)
//       .mul(u)
//       .mul(alpha_decimals);

//   let right = v.div(scale).mul(v).mul(w);

//   let result = left
//       .add(right)
//       .pow(new BN(0.5))
//       .mul(scale.pow(new BN(0.5)));

//   match result {
//       Some(value) => Some(value),
//       None => compute_a(
//           u,
//           alpha_decimals,
//           w,
//           v,
//           scale.mul(new BN(100)).unwrap(),
//       ),
//   }
// }

// fn delta_m1_strategy(
//   alpha_abs: u128,
//   beta: u128,
//   alpha_decimals: u128,
//   beta_decimals: u128,
//   s_a: u128,
//   s_b: u128,
// ) -> Option<u128> {
//   let left_num = (s_b.checked_sub(s_a)).checked_mul(beta);

//   if let None = left_num {
//       return None;
//   }

//   let left_denom = beta_decimals.checked_mul(DECIMALS_S);

//   if let None = left_denom {
//       return None;
//   }

//   let left = left_num.checked_div_(left_denom);

//   if let None = left {
//       return None;
//   }

//   let right = s_b
//       .checked_pow(2)
//       .checked_sub_(s_a.checked_pow(2))
//       .checked_div_(DECIMALS_S.checked_pow(2))
//       .checked_mul(alpha_abs)
//       .checked_div(2 * alpha_decimals);

//   if let None = right {
//       return None;
//   }

//   left.checked_sub_(right)
// }

// fn delta_m2_strategy(
//   alpha_abs: BN,
//   beta: BN,
//   alpha_decimals: BN,
//   beta_decimals: BN,
//   s_a: BN,
//   s_b: BN,
// ) -> Option<BN> {
//   let left = (beta * 2)
//       .mul(DECIMALS_S)
//       .mul(alpha_decimals)
//       .mul(s_b - s_a);

//   if let None = left {
//       return None;
//   }

//   let right = alpha_abs
//       .mul(beta_decimals)
//       .mul_(s_b.pow(2).sub_(s_a.pow(2)));

//   if let None = right {
//       return None;
//   }

//   let denom = (2 * alpha_decimals)
//       .mul(beta_decimals)
//       .mul_(DECIMALS_S.pow(2));

//   if let None = denom {
//       return None;
//   }

//   left.sub_(right).div_(denom)
// }

// export function balances(bp: BoundPool): [BN, BN] {
//   return [bp.memeReserve.tokens, bp.quoteReserve.tokens];
// }

// export function get_fee_in_amount(bp: BoundPool, amount: BN): BN {
//   return get_fee_amount(amount, bp.fees.feeInPercent);
// }

// export function get_fee_out_amount(bp: BoundPool, amount: BN): BN {
//   return get_fee_amount(amount, bp.fees.feeOutPercent);
// }

// export function get_fee_amount(x: BN, percent: BN): BN {
//   return x.mul(percent).div(PRECISION);
// }
