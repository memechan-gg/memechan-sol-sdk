export type CustomError =
  | InvalidAccountInput
  | NoOutstandingTokensToConvert
  | UnlockTsNotPassed
  | AlreadyWithdrawn
  | AlreadyConverted
  | InvalidRewardNumber
  | ZeroRewardTokens
  | WrongRewardNumber
  | StakedAfterReward
  | WithdrawnBeforeReward
  | UsingSameRewardToSkip
  | NonConsecutiveRewards
  | StakedBeforePreviousReward
  | StakedAfterNextReward
  | StakingZeroTokens;

export class InvalidAccountInput extends Error {
  readonly code = 6000;
  readonly name = "InvalidAccountInput";
  readonly msg = "undefined";

  constructor() {
    super("6000: undefined");
  }
}

export class NoOutstandingTokensToConvert extends Error {
  readonly code = 6001;
  readonly name = "NoOutstandingTokensToConvert";
  readonly msg = "No tokens to convert to vCHAN";

  constructor() {
    super("6001: No tokens to convert to vCHAN");
  }
}

export class UnlockTsNotPassed extends Error {
  readonly code = 6002;
  readonly name = "UnlockTsNotPassed";
  readonly msg = "Unlock timestamp has not yet passed";

  constructor() {
    super("6002: Unlock timestamp has not yet passed");
  }
}

export class AlreadyWithdrawn extends Error {
  readonly code = 6003;
  readonly name = "AlreadyWithdrawn";
  readonly msg = "Cannot withdraw twice";

  constructor() {
    super("6003: Cannot withdraw twice");
  }
}

export class AlreadyConverted extends Error {
  readonly code = 6004;
  readonly name = "AlreadyConverted";
  readonly msg = "undefined";

  constructor() {
    super("6004: undefined");
  }
}

export class InvalidRewardNumber extends Error {
  readonly code = 6005;
  readonly name = "InvalidRewardNumber";
  readonly msg = "undefined";

  constructor() {
    super("6005: undefined");
  }
}

export class ZeroRewardTokens extends Error {
  readonly code = 6006;
  readonly name = "ZeroRewardTokens";
  readonly msg = "undefined";

  constructor() {
    super("6006: undefined");
  }
}

export class WrongRewardNumber extends Error {
  readonly code = 6007;
  readonly name = "WrongRewardNumber";
  readonly msg = "undefined";

  constructor() {
    super("6007: undefined");
  }
}

export class StakedAfterReward extends Error {
  readonly code = 6008;
  readonly name = "StakedAfterReward";
  readonly msg = "undefined";

  constructor() {
    super("6008: undefined");
  }
}

export class WithdrawnBeforeReward extends Error {
  readonly code = 6009;
  readonly name = "WithdrawnBeforeReward";
  readonly msg = "undefined";

  constructor() {
    super("6009: undefined");
  }
}

export class UsingSameRewardToSkip extends Error {
  readonly code = 6010;
  readonly name = "UsingSameRewardToSkip";
  readonly msg = "Cannot use the same reward to form skip interval";

  constructor() {
    super("6010: Cannot use the same reward to form skip interval");
  }
}

export class NonConsecutiveRewards extends Error {
  readonly code = 6011;
  readonly name = "NonConsecutiveRewards";
  readonly msg = "Selected skip interval reward numbers should be consecutive";

  constructor() {
    super("6011: Selected skip interval reward numbers should be consecutive");
  }
}

export class StakedBeforePreviousReward extends Error {
  readonly code = 6012;
  readonly name = "StakedBeforePreviousReward";
  readonly msg = "Stake ts is to the left of the skip interval";

  constructor() {
    super("6012: Stake ts is to the left of the skip interval");
  }
}

export class StakedAfterNextReward extends Error {
  readonly code = 6013;
  readonly name = "StakedAfterNextReward";
  readonly msg = "Stake ts is to the right of the skip interval";

  constructor() {
    super("6013: Stake ts is to the right of the skip interval");
  }
}

export class StakingZeroTokens extends Error {
  readonly code = 6014;
  readonly name = "StakingZeroTokens";
  readonly msg = "undefined";

  constructor() {
    super("6014: undefined");
  }
}

export function fromCode(code: number): CustomError | null {
  switch (code) {
    case 6000:
      return new InvalidAccountInput();
    case 6001:
      return new NoOutstandingTokensToConvert();
    case 6002:
      return new UnlockTsNotPassed();
    case 6003:
      return new AlreadyWithdrawn();
    case 6004:
      return new AlreadyConverted();
    case 6005:
      return new InvalidRewardNumber();
    case 6006:
      return new ZeroRewardTokens();
    case 6007:
      return new WrongRewardNumber();
    case 6008:
      return new StakedAfterReward();
    case 6009:
      return new WithdrawnBeforeReward();
    case 6010:
      return new UsingSameRewardToSkip();
    case 6011:
      return new NonConsecutiveRewards();
    case 6012:
      return new StakedBeforePreviousReward();
    case 6013:
      return new StakedAfterNextReward();
    case 6014:
      return new StakingZeroTokens();
  }

  return null;
}
