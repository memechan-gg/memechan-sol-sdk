export type CustomError =
  | InvalidAccountInput
  | InvalidArg
  | SlippageExceeded
  | InvariantViolation
  | InvalidTokenMints
  | MulDivOverflow
  | DivideByZero
  | ZeroInAmt
  | ZeroMemeVault
  | InsufficientBalance
  | PoolIsLocked
  | NoZeroTokens
  | NoTokensToWithdraw
  | NotEnoughTicketTokens
  | TicketTokensLocked
  | NonZeroAmountTicket
  | NotEnoughTokensToRelease
  | BondingCurveMustBeNegativelySloped
  | BondingCurveInterceptMustBePositive

export class InvalidAccountInput extends Error {
  readonly code = 6000
  readonly name = "InvalidAccountInput"
  readonly msg =
    "Provided account breaks some constraints, see logs for more info"

  constructor() {
    super(
      "6000: Provided account breaks some constraints, see logs for more info"
    )
  }
}

export class InvalidArg extends Error {
  readonly code = 6001
  readonly name = "InvalidArg"
  readonly msg = "One of the provided input arguments is invalid"

  constructor() {
    super("6001: One of the provided input arguments is invalid")
  }
}

export class SlippageExceeded extends Error {
  readonly code = 6002
  readonly name = "SlippageExceeded"
  readonly msg =
    "Given amount of tokens to swap would result in \
        less than minimum requested tokens to receive"

  constructor() {
    super(
      "6002: Given amount of tokens to swap would result in \
        less than minimum requested tokens to receive"
    )
  }
}

export class InvariantViolation extends Error {
  readonly code = 6003
  readonly name = "InvariantViolation"
  readonly msg = "There's a bug in the program, see logs for more info"

  constructor() {
    super("6003: There's a bug in the program, see logs for more info")
  }
}

export class InvalidTokenMints extends Error {
  readonly code = 6004
  readonly name = "InvalidTokenMints"
  readonly msg = "Provided mints are not available on the pool"

  constructor() {
    super("6004: Provided mints are not available on the pool")
  }
}

export class MulDivOverflow extends Error {
  readonly code = 6005
  readonly name = "MulDivOverflow"
  readonly msg = "undefined"

  constructor() {
    super("6005: undefined")
  }
}

export class DivideByZero extends Error {
  readonly code = 6006
  readonly name = "DivideByZero"
  readonly msg = "undefined"

  constructor() {
    super("6006: undefined")
  }
}

export class ZeroInAmt extends Error {
  readonly code = 6007
  readonly name = "ZeroInAmt"
  readonly msg = "undefined"

  constructor() {
    super("6007: undefined")
  }
}

export class ZeroMemeVault extends Error {
  readonly code = 6008
  readonly name = "ZeroMemeVault"
  readonly msg = "undefined"

  constructor() {
    super("6008: undefined")
  }
}

export class InsufficientBalance extends Error {
  readonly code = 6009
  readonly name = "InsufficientBalance"
  readonly msg = "undefined"

  constructor() {
    super("6009: undefined")
  }
}

export class PoolIsLocked extends Error {
  readonly code = 6010
  readonly name = "PoolIsLocked"
  readonly msg = "Pool can't be interacted with until going into live phase"

  constructor() {
    super("6010: Pool can't be interacted with until going into live phase")
  }
}

export class NoZeroTokens extends Error {
  readonly code = 6011
  readonly name = "NoZeroTokens"
  readonly msg = "Shouldn't provide zero tokens in"

  constructor() {
    super("6011: Shouldn't provide zero tokens in")
  }
}

export class NoTokensToWithdraw extends Error {
  readonly code = 6012
  readonly name = "NoTokensToWithdraw"
  readonly msg = "undefined"

  constructor() {
    super("6012: undefined")
  }
}

export class NotEnoughTicketTokens extends Error {
  readonly code = 6013
  readonly name = "NotEnoughTicketTokens"
  readonly msg = "Amount of tokens in ticket is lower than needed to swap"

  constructor() {
    super("6013: Amount of tokens in ticket is lower than needed to swap")
  }
}

export class TicketTokensLocked extends Error {
  readonly code = 6014
  readonly name = "TicketTokensLocked"
  readonly msg = "Not enough time passed to unlock tokens bound to the ticket"

  constructor() {
    super("6014: Not enough time passed to unlock tokens bound to the ticket")
  }
}

export class NonZeroAmountTicket extends Error {
  readonly code = 6015
  readonly name = "NonZeroAmountTicket"
  readonly msg = "Can't close ticket with non-zero bound token amount"

  constructor() {
    super("6015: Can't close ticket with non-zero bound token amount")
  }
}

export class NotEnoughTokensToRelease extends Error {
  readonly code = 6016
  readonly name = "NotEnoughTokensToRelease"
  readonly msg = "Can't unstake the required amount of tokens"

  constructor() {
    super("6016: Can't unstake the required amount of tokens")
  }
}

export class BondingCurveMustBeNegativelySloped extends Error {
  readonly code = 6017
  readonly name = "BondingCurveMustBeNegativelySloped"
  readonly msg = "undefined"

  constructor() {
    super("6017: undefined")
  }
}

export class BondingCurveInterceptMustBePositive extends Error {
  readonly code = 6018
  readonly name = "BondingCurveInterceptMustBePositive"
  readonly msg = "undefined"

  constructor() {
    super("6018: undefined")
  }
}

export function fromCode(code: number): CustomError | null {
  switch (code) {
    case 6000:
      return new InvalidAccountInput()
    case 6001:
      return new InvalidArg()
    case 6002:
      return new SlippageExceeded()
    case 6003:
      return new InvariantViolation()
    case 6004:
      return new InvalidTokenMints()
    case 6005:
      return new MulDivOverflow()
    case 6006:
      return new DivideByZero()
    case 6007:
      return new ZeroInAmt()
    case 6008:
      return new ZeroMemeVault()
    case 6009:
      return new InsufficientBalance()
    case 6010:
      return new PoolIsLocked()
    case 6011:
      return new NoZeroTokens()
    case 6012:
      return new NoTokensToWithdraw()
    case 6013:
      return new NotEnoughTicketTokens()
    case 6014:
      return new TicketTokensLocked()
    case 6015:
      return new NonZeroAmountTicket()
    case 6016:
      return new NotEnoughTokensToRelease()
    case 6017:
      return new BondingCurveMustBeNegativelySloped()
    case 6018:
      return new BondingCurveInterceptMustBePositive()
  }

  return null
}