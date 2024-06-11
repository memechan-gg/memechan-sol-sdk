export type CustomError =
  | InvalidAccountInput
  | InvalidTimestamp
  | InvalidPeriod
  | InvalidDepositAmount
  | InsufficientWithdrawalBalance
  | InvalidSchedule;

export class InvalidAccountInput extends Error {
  readonly code = 6000;
  readonly name = "InvalidAccountInput";
  readonly msg = "undefined";

  constructor() {
    super("6000: undefined");
  }
}

export class InvalidTimestamp extends Error {
  readonly code = 6001;
  readonly name = "InvalidTimestamp";
  readonly msg = "Vesting end must be greater than the current unix timestamp.";

  constructor() {
    super("6001: Vesting end must be greater than the current unix timestamp.");
  }
}

export class InvalidPeriod extends Error {
  readonly code = 6002;
  readonly name = "InvalidPeriod";
  readonly msg = "The number of vesting periods must be greater than zero.";

  constructor() {
    super("6002: The number of vesting periods must be greater than zero.");
  }
}

export class InvalidDepositAmount extends Error {
  readonly code = 6003;
  readonly name = "InvalidDepositAmount";
  readonly msg = "The vesting deposit amount must be greater than zero.";

  constructor() {
    super("6003: The vesting deposit amount must be greater than zero.");
  }
}

export class InsufficientWithdrawalBalance extends Error {
  readonly code = 6004;
  readonly name = "InsufficientWithdrawalBalance";
  readonly msg = "Insufficient withdrawal balance.";

  constructor() {
    super("6004: Insufficient withdrawal balance.");
  }
}

export class InvalidSchedule extends Error {
  readonly code = 6005;
  readonly name = "InvalidSchedule";
  readonly msg = "Invalid vesting schedule given.";

  constructor() {
    super("6005: Invalid vesting schedule given.");
  }
}

export function fromCode(code: number): CustomError | null {
  switch (code) {
    case 6000:
      return new InvalidAccountInput();
    case 6001:
      return new InvalidTimestamp();
    case 6002:
      return new InvalidPeriod();
    case 6003:
      return new InvalidDepositAmount();
    case 6004:
      return new InsufficientWithdrawalBalance();
    case 6005:
      return new InvalidSchedule();
  }

  return null;
}
