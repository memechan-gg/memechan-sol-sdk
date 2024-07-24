import {
  NewBPInstructionParsed,
  SwapYInstructionParsed,
  SwapXInstructionParsed,
  InitStakingPoolInstructionParsed,
  CreateMetadataInstructionParsed,
  InitQuoteAmmInstructionParsed,
  InitChanAmmInstructionParsed,
  WithdrawFeesInstructionParsed,
  UnstakeInstructionParsed,
} from "./parsers";

export type ParsedTransactionDetail =
  | NewBPInstructionParsed
  | SwapYInstructionParsed
  | SwapXInstructionParsed
  | InitStakingPoolInstructionParsed
  | CreateMetadataInstructionParsed
  | InitQuoteAmmInstructionParsed
  | InitChanAmmInstructionParsed
  | WithdrawFeesInstructionParsed
  | UnstakeInstructionParsed;
