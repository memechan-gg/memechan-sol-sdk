export type TokenAccount = {
  address: string;
  mint: string;
  owner: string;
  amount: number;
  delegated_amount: number;
  frozen: boolean;
};

export type NormalResult = {
  jsonrpc: "2.0";
  result: {
    total: number;
    limit: number;
    page: number;
    token_accounts: TokenAccount[];
  };
  id: string;
};

export type ErrorResult = {
  jsonrpc: "2.0";
  error: {
    code: number;
    message: string;
  };
  id?: string;
};

export type Data = NormalResult | ErrorResult;

export function isTokenAccountArray(arr: unknown): arr is TokenAccount[] {
  if (!Array.isArray(arr)) return false;
  // Additional checks for individual TokenAccount properties can be added here
  return arr.every((item) => typeof item === "object" && item !== null);
}

export function isNormalResult(data: unknown): data is NormalResult {
  if (typeof data !== "object" || data === null) return false;

  const normalResult = data as NormalResult;
  return (
    normalResult.jsonrpc === "2.0" &&
    typeof normalResult.result === "object" &&
    typeof normalResult.result.total === "number" &&
    typeof normalResult.result.limit === "number" &&
    typeof normalResult.result.page === "number" &&
    isTokenAccountArray(normalResult.result.token_accounts) &&
    typeof normalResult.id === "string"
  );
}

export function isErrorResult(data: unknown): data is ErrorResult {
  if (typeof data !== "object" || data === null) return false;

  const errorResult = data as ErrorResult;
  return (
    errorResult.jsonrpc === "2.0" &&
    typeof errorResult.error === "object" &&
    typeof errorResult.error.code === "number" &&
    typeof errorResult.error.message === "string"
  );
}

export function validateTokenAccountResponseData(data: unknown): data is Data {
  return isNormalResult(data) || isErrorResult(data);
}
