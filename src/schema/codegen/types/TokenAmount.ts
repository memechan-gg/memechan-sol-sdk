import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"

export interface TokenAmountFields {
  amount: BN
}

export interface TokenAmountJSON {
  amount: string
}

export class TokenAmount {
  readonly amount: BN

  constructor(fields: TokenAmountFields) {
    this.amount = fields.amount
  }

  static layout(property?: string) {
    return borsh.struct([borsh.u64("amount")], property)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new TokenAmount({
      amount: obj.amount,
    })
  }

  static toEncodable(fields: TokenAmountFields) {
    return {
      amount: fields.amount,
    }
  }

  toJSON(): TokenAmountJSON {
    return {
      amount: this.amount.toString(),
    }
  }

  static fromJSON(obj: TokenAmountJSON): TokenAmount {
    return new TokenAmount({
      amount: new BN(obj.amount),
    })
  }

  toEncodable() {
    return TokenAmount.toEncodable(this)
  }
}
