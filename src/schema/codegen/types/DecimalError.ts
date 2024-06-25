import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh";

export interface MathOverflowJSON {
  kind: "MathOverflow";
}

export class MathOverflow {
  readonly discriminator = 0;
  readonly kind = "MathOverflow";

  toJSON(): MathOverflowJSON {
    return {
      kind: "MathOverflow",
    };
  }

  toEncodable() {
    return {
      MathOverflow: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.DecimalErrorKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("MathOverflow" in obj) {
    return new MathOverflow();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(obj: types.DecimalErrorJSON): types.DecimalErrorKind {
  switch (obj.kind) {
    case "MathOverflow": {
      return new MathOverflow();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([borsh.struct([], "MathOverflow")]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
