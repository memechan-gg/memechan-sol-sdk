// Define the types
export type NativeTransfer = {
  fromUserAccount: string;
  toUserAccount: string;
  amount: number;
};

export type AccountData = {
  account: string;
  nativeBalanceChange: number;
  tokenBalanceChanges: unknown[]; // Adjust type if needed
};

export type Instruction = {
  accounts: string[];
  data: string;
  programId: string;
  innerInstructions: unknown[]; // Adjust type if needed
};

export type TransactionDataByDigest = {
  description: string;
  type: string;
  source: string;
  fee: number;
  feePayer: string;
  signature: string;
  slot: number;
  timestamp: number;
  tokenTransfers: unknown[]; // Adjust type if needed
  nativeTransfers: NativeTransfer[];
  accountData: AccountData[];
  transactionError: null | string;
  instructions: Instruction[];
  events: Record<string, unknown>;
};

// Type guard functions
export function isNativeTransfer(obj: unknown): obj is NativeTransfer {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as NativeTransfer).fromUserAccount === "string" &&
    typeof (obj as NativeTransfer).toUserAccount === "string" &&
    typeof (obj as NativeTransfer).amount === "number"
  );
}

export function isAccountData(obj: unknown): obj is AccountData {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as AccountData).account === "string" &&
    typeof (obj as AccountData).nativeBalanceChange === "number" &&
    Array.isArray((obj as AccountData).tokenBalanceChanges)
  );
}

export function isInstruction(obj: unknown): obj is Instruction {
  return (
    typeof obj === "object" &&
    obj !== null &&
    Array.isArray((obj as Instruction).accounts) &&
    typeof (obj as Instruction).data === "string" &&
    typeof (obj as Instruction).programId === "string" &&
    Array.isArray((obj as Instruction).innerInstructions)
  );
}

export function isTransactionDataByDigest(obj: unknown): obj is TransactionDataByDigest {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as TransactionDataByDigest).description === "string" &&
    typeof (obj as TransactionDataByDigest).type === "string" &&
    typeof (obj as TransactionDataByDigest).source === "string" &&
    typeof (obj as TransactionDataByDigest).fee === "number" &&
    typeof (obj as TransactionDataByDigest).feePayer === "string" &&
    typeof (obj as TransactionDataByDigest).signature === "string" &&
    typeof (obj as TransactionDataByDigest).slot === "number" &&
    typeof (obj as TransactionDataByDigest).timestamp === "number" &&
    Array.isArray((obj as TransactionDataByDigest).tokenTransfers) &&
    Array.isArray((obj as TransactionDataByDigest).nativeTransfers) &&
    // (obj as TransactionDataByDigest).nativeTransfers.every(isNativeTransfer) &&
    Array.isArray((obj as TransactionDataByDigest).accountData) &&
    // (obj as TransactionDataByDigest).accountData.every(isAccountData) &&
    // ((obj as TransactionDataByDigest).transactionError === null ||
    // typeof (obj as TransactionDataByDigest).transactionError === "string") &&
    Array.isArray((obj as TransactionDataByDigest).instructions) &&
    // (obj as TransactionDataByDigest).instructions.every(isInstruction) &&
    typeof (obj as TransactionDataByDigest).events === "object" &&
    (obj as TransactionDataByDigest).events !== null
  );
}

export function isArrayOfTransactionDataByDigest(obj: unknown): obj is TransactionDataByDigest[] {
  return Array.isArray(obj) && obj.every(isTransactionDataByDigest);
}
