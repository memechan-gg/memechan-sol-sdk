import { PublicKey } from "@solana/web3.js"
import { findProgramAddress } from "../common/helpers"

  export function getAmmConfigId(programId : PublicKey) {
    const { publicKey } = findProgramAddress([Buffer.from('amm_config_account_seed', 'utf-8')], programId)
    return publicKey
  }
