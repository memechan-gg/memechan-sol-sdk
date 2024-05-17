// env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    TEST_PAYER_SECRET_KEY: string | undefined;
    TEST_USER_SECRET_KEY: string | undefined;
    ADMIN_PUB_KEY: string | undefined;
    MEMECHAN_PROGRAM_ID: string | undefined;
    RPC_API_CLUSTER: string | undefined;
    WSS_API_CLUSTER: string | undefined;
    BE_URL: string | undefined;
    FEE_DESTINATION_ID: string | undefined;
    USER_ID: string | undefined;
  }
}
