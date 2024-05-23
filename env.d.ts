// env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    TEST_USER_SECRET_KEY: string | undefined;
    RPC_API_CLUSTER: string | undefined;
    WSS_API_CLUSTER: string | undefined;
    FEE_DESTINATION_ID: string | undefined;
    USER_ID: string | undefined;
    HELIUS_API_URL: string | undefined;
  }
}
