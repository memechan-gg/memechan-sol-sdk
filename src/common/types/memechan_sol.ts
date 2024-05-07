export type MemechanSol = {
  version: "0.1.0";
  name: "memechan_sol";
  instructions: [
    {
      name: "new";
      accounts: [
        {
          name: "sender";
          isMut: true;
          isSigner: true;
        },
        {
          name: "pool";
          isMut: true;
          isSigner: true;
        },
        {
          name: "memeMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "solVault";
          isMut: false;
          isSigner: false;
        },
        {
          name: "solMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "adminSolVault";
          isMut: false;
          isSigner: false;
        },
        {
          name: "launchVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "poolSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: "swapX";
      accounts: [
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "memeTicket";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userSol";
          isMut: true;
          isSigner: false;
        },
        {
          name: "solVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "owner";
          isMut: false;
          isSigner: true;
        },
        {
          name: "poolSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: "coinInAmount";
          type: "u64";
        },
        {
          name: "coinYMinValue";
          type: "u64";
        },
      ];
    },
    {
      name: "swapY";
      accounts: [
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "solVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userSol";
          isMut: true;
          isSigner: false;
        },
        {
          name: "memeTicket";
          isMut: true;
          isSigner: true;
        },
        {
          name: "owner";
          isMut: true;
          isSigner: true;
        },
        {
          name: "poolSignerPda";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: "coinInAmount";
          type: "u64";
        },
        {
          name: "coinXMinValue";
          type: "u64";
        },
      ];
    },
    {
      name: "goLive";
      accounts: [
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "staking";
          isMut: true;
          isSigner: true;
        },
        {
          name: "launchTokenVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "poolWsolVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "adminVaultSol";
          isMut: true;
          isSigner: false;
        },
        {
          name: "memeTicket";
          isMut: true;
          isSigner: true;
        },
        {
          name: "boundPoolSignerPda";
          isMut: false;
          isSigner: false;
        },
        {
          name: "stakingPoolSignerPda";
          isMut: true;
          isSigner: false;
        },
        {
          name: "memeMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "solMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "aldrinPoolAcc";
          isMut: true;
          isSigner: true;
        },
        {
          name: "aldrinPoolSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "aldrinProgramToll";
          isMut: false;
          isSigner: false;
        },
        {
          name: "aldrinProgramTollWallet";
          isMut: false;
          isSigner: false;
        },
        {
          name: "aldrinLpMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "lpTokenWallet";
          isMut: true;
          isSigner: false;
        },
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "aldrinAmmProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: "addFees";
      accounts: [
        {
          name: "staking";
          isMut: true;
          isSigner: false;
        },
        {
          name: "memeVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "wsolVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stakingSignerPda";
          isMut: false;
          isSigner: false;
        },
        {
          name: "aldrinPoolAcc";
          isMut: true;
          isSigner: false;
        },
        {
          name: "aldrinLpMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "aldrinPoolSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "aldrinPoolLpWallet";
          isMut: true;
          isSigner: false;
        },
        {
          name: "aldrinAmmProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: "unstake";
      accounts: [
        {
          name: "staking";
          isMut: true;
          isSigner: false;
        },
        {
          name: "memeTicket";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userMeme";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userWsol";
          isMut: true;
          isSigner: false;
        },
        {
          name: "memeVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "wsolVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "stakingSignerPda";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: "releaseAmount";
          type: "u64";
        },
      ];
    },
    {
      name: "withdrawFees";
      accounts: [
        {
          name: "staking";
          isMut: false;
          isSigner: false;
        },
        {
          name: "memeTicket";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userMeme";
          isMut: false;
          isSigner: false;
        },
        {
          name: "userWsol";
          isMut: false;
          isSigner: false;
        },
        {
          name: "memeVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "wsolVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stakingSignerPda";
          isMut: false;
          isSigner: false;
        },
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: "boundMergeTickets";
      accounts: [
        {
          name: "pool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "ticketInto";
          isMut: true;
          isSigner: false;
        },
        {
          name: "ticketFrom";
          isMut: true;
          isSigner: false;
        },
        {
          name: "owner";
          isMut: true;
          isSigner: true;
        },
      ];
      args: [];
    },
    {
      name: "stakingMergeTickets";
      accounts: [
        {
          name: "staking";
          isMut: false;
          isSigner: false;
        },
        {
          name: "ticketInto";
          isMut: true;
          isSigner: false;
        },
        {
          name: "ticketFrom";
          isMut: true;
          isSigner: false;
        },
        {
          name: "owner";
          isMut: true;
          isSigner: true;
        },
      ];
      args: [];
    },
    {
      name: "closeTicket";
      accounts: [
        {
          name: "ticket";
          isMut: true;
          isSigner: false;
        },
        {
          name: "owner";
          isMut: true;
          isSigner: true;
        },
      ];
      args: [];
    },
  ];
  accounts: [
    {
      name: "memeTicket";
      type: {
        kind: "struct";
        fields: [
          {
            name: "owner";
            type: "publicKey";
          },
          {
            name: "pool";
            type: "publicKey";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "withdrawsMeme";
            type: "u64";
          },
          {
            name: "withdrawsWsol";
            type: "u64";
          },
          {
            name: "untilTimestamp";
            type: "i64";
          },
          {
            name: "vesting";
            type: {
              defined: "VestingData";
            };
          },
        ];
      };
    },
    {
      name: "stakingPool";
      type: {
        kind: "struct";
        fields: [
          {
            name: "pool";
            type: "publicKey";
          },
          {
            name: "memeVault";
            type: "publicKey";
          },
          {
            name: "memeMint";
            type: "publicKey";
          },
          {
            name: "wsolVault";
            type: "publicKey";
          },
          {
            name: "vestingConfig";
            type: {
              defined: "VestingConfig";
            };
          },
          {
            name: "stakesTotal";
            type: "u64";
          },
          {
            name: "feesXTotal";
            type: "u64";
          },
          {
            name: "feesYTotal";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "boundPool";
      type: {
        kind: "struct";
        fields: [
          {
            name: "memeAmt";
            type: "u64";
          },
          {
            name: "memeMint";
            type: "publicKey";
          },
          {
            name: "solReserve";
            type: {
              defined: "Reserve";
            };
          },
          {
            name: "adminFeesMeme";
            type: "u64";
          },
          {
            name: "adminFeesSol";
            type: "u64";
          },
          {
            name: "adminVaultSol";
            type: "publicKey";
          },
          {
            name: "launchTokenVault";
            type: "publicKey";
          },
          {
            name: "fees";
            type: {
              defined: "Fees";
            };
          },
          {
            name: "config";
            type: {
              defined: "Config";
            };
          },
          {
            name: "locked";
            type: "bool";
          },
        ];
      };
    },
  ];
  types: [
    {
      name: "Fees";
      type: {
        kind: "struct";
        fields: [
          {
            name: "feeInPercent";
            type: "u64";
          },
          {
            name: "feeOutPercent";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "VestingConfig";
      type: {
        kind: "struct";
        fields: [
          {
            name: "startTs";
            type: "i64";
          },
          {
            name: "cliffTs";
            type: "i64";
          },
          {
            name: "endTs";
            type: "i64";
          },
        ];
      };
    },
    {
      name: "VestingData";
      type: {
        kind: "struct";
        fields: [
          {
            name: "released";
            type: "u64";
          },
          {
            name: "notional";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "Config";
      type: {
        kind: "struct";
        fields: [
          {
            name: "alphaAbs";
            type: "u128";
          },
          {
            name: "beta";
            type: "u128";
          },
          {
            name: "priceFactor";
            type: "u64";
          },
          {
            name: "gammaS";
            type: "u64";
          },
          {
            name: "gammaM";
            type: "u64";
          },
          {
            name: "omegaM";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "Reserve";
      type: {
        kind: "struct";
        fields: [
          {
            name: "tokens";
            type: "u64";
          },
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "vault";
            type: "publicKey";
          },
        ];
      };
    },
  ];
  errors: [
    {
      code: 6000;
      name: "InvalidAccountInput";
      msg: "Provided account breaks some constraints, see logs for more info";
    },
    {
      code: 6001;
      name: "InvalidArg";
      msg: "One of the provided input arguments is invalid";
    },
    {
      code: 6002;
      name: "SlippageExceeded";
      msg: "Given amount of tokens to swap would result in \\\n        less than minimum requested tokens to receive";
    },
    {
      code: 6003;
      name: "InvariantViolation";
      msg: "There's a bug in the program, see logs for more info";
    },
    {
      code: 6004;
      name: "InvalidTokenMints";
      msg: "Provided mints are not available on the pool";
    },
    {
      code: 6005;
      name: "MulDivOverflow";
    },
    {
      code: 6006;
      name: "DivideByZero";
    },
    {
      code: 6007;
      name: "ZeroInAmt";
    },
    {
      code: 6008;
      name: "ZeroMemeVault";
    },
    {
      code: 6009;
      name: "InsufficientBalance";
    },
    {
      code: 6010;
      name: "PoolIsLocked";
      msg: "Pool can't be interacted with until going into live phase";
    },
    {
      code: 6011;
      name: "NoZeroTokens";
      msg: "Shouldn't provide zero tokens in";
    },
    {
      code: 6012;
      name: "NoTokensToWithdraw";
    },
    {
      code: 6013;
      name: "NotEnoughTicketTokens";
      msg: "Amount of tokens in ticket is lower than needed to swap";
    },
    {
      code: 6014;
      name: "TicketTokensLocked";
      msg: "Not enough time passed to unlock tokens bound to the ticket";
    },
    {
      code: 6015;
      name: "NonZeroAmountTicket";
      msg: "Can't close ticket with non-zero bound token amount";
    },
    {
      code: 6016;
      name: "NotEnoughTokensToRelease";
      msg: "Can't unstake the required amount of tokens";
    },
    {
      code: 6017;
      name: "BondingCurveMustBeNegativelySloped";
    },
    {
      code: 6018;
      name: "BondingCurveInterceptMustBePositive";
    },
  ];
};

export const IDL: MemechanSol = {
  version: "0.1.0",
  name: "memechan_sol",
  instructions: [
    {
      name: "new",
      accounts: [
        {
          name: "sender",
          isMut: true,
          isSigner: true,
        },
        {
          name: "pool",
          isMut: true,
          isSigner: true,
        },
        {
          name: "memeMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "solVault",
          isMut: false,
          isSigner: false,
        },
        {
          name: "solMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "adminSolVault",
          isMut: false,
          isSigner: false,
        },
        {
          name: "launchVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "poolSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "swapX",
      accounts: [
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "memeTicket",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userSol",
          isMut: true,
          isSigner: false,
        },
        {
          name: "solVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: false,
          isSigner: true,
        },
        {
          name: "poolSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "coinInAmount",
          type: "u64",
        },
        {
          name: "coinYMinValue",
          type: "u64",
        },
      ],
    },
    {
      name: "swapY",
      accounts: [
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "solVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userSol",
          isMut: true,
          isSigner: false,
        },
        {
          name: "memeTicket",
          isMut: true,
          isSigner: true,
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
        {
          name: "poolSignerPda",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "coinInAmount",
          type: "u64",
        },
        {
          name: "coinXMinValue",
          type: "u64",
        },
      ],
    },
    {
      name: "goLive",
      accounts: [
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "staking",
          isMut: true,
          isSigner: true,
        },
        {
          name: "launchTokenVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "poolWsolVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "adminVaultSol",
          isMut: true,
          isSigner: false,
        },
        {
          name: "memeTicket",
          isMut: true,
          isSigner: true,
        },
        {
          name: "boundPoolSignerPda",
          isMut: false,
          isSigner: false,
        },
        {
          name: "stakingPoolSignerPda",
          isMut: true,
          isSigner: false,
        },
        {
          name: "memeMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "solMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "aldrinPoolAcc",
          isMut: true,
          isSigner: true,
        },
        {
          name: "aldrinPoolSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "aldrinProgramToll",
          isMut: false,
          isSigner: false,
        },
        {
          name: "aldrinProgramTollWallet",
          isMut: false,
          isSigner: false,
        },
        {
          name: "aldrinLpMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "lpTokenWallet",
          isMut: true,
          isSigner: false,
        },
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "aldrinAmmProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "addFees",
      accounts: [
        {
          name: "staking",
          isMut: true,
          isSigner: false,
        },
        {
          name: "memeVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "wsolVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakingSignerPda",
          isMut: false,
          isSigner: false,
        },
        {
          name: "aldrinPoolAcc",
          isMut: true,
          isSigner: false,
        },
        {
          name: "aldrinLpMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "aldrinPoolSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "aldrinPoolLpWallet",
          isMut: true,
          isSigner: false,
        },
        {
          name: "aldrinAmmProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "unstake",
      accounts: [
        {
          name: "staking",
          isMut: true,
          isSigner: false,
        },
        {
          name: "memeTicket",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userMeme",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userWsol",
          isMut: true,
          isSigner: false,
        },
        {
          name: "memeVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "wsolVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "stakingSignerPda",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "releaseAmount",
          type: "u64",
        },
      ],
    },
    {
      name: "withdrawFees",
      accounts: [
        {
          name: "staking",
          isMut: false,
          isSigner: false,
        },
        {
          name: "memeTicket",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userMeme",
          isMut: false,
          isSigner: false,
        },
        {
          name: "userWsol",
          isMut: false,
          isSigner: false,
        },
        {
          name: "memeVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "wsolVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakingSignerPda",
          isMut: false,
          isSigner: false,
        },
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "boundMergeTickets",
      accounts: [
        {
          name: "pool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "ticketInto",
          isMut: true,
          isSigner: false,
        },
        {
          name: "ticketFrom",
          isMut: true,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: "stakingMergeTickets",
      accounts: [
        {
          name: "staking",
          isMut: false,
          isSigner: false,
        },
        {
          name: "ticketInto",
          isMut: true,
          isSigner: false,
        },
        {
          name: "ticketFrom",
          isMut: true,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: "closeTicket",
      accounts: [
        {
          name: "ticket",
          isMut: true,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "memeTicket",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "publicKey",
          },
          {
            name: "pool",
            type: "publicKey",
          },
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "withdrawsMeme",
            type: "u64",
          },
          {
            name: "withdrawsWsol",
            type: "u64",
          },
          {
            name: "untilTimestamp",
            type: "i64",
          },
          {
            name: "vesting",
            type: {
              defined: "VestingData",
            },
          },
        ],
      },
    },
    {
      name: "stakingPool",
      type: {
        kind: "struct",
        fields: [
          {
            name: "pool",
            type: "publicKey",
          },
          {
            name: "memeVault",
            type: "publicKey",
          },
          {
            name: "memeMint",
            type: "publicKey",
          },
          {
            name: "wsolVault",
            type: "publicKey",
          },
          {
            name: "vestingConfig",
            type: {
              defined: "VestingConfig",
            },
          },
          {
            name: "stakesTotal",
            type: "u64",
          },
          {
            name: "feesXTotal",
            type: "u64",
          },
          {
            name: "feesYTotal",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "boundPool",
      type: {
        kind: "struct",
        fields: [
          {
            name: "memeAmt",
            type: "u64",
          },
          {
            name: "memeMint",
            type: "publicKey",
          },
          {
            name: "solReserve",
            type: {
              defined: "Reserve",
            },
          },
          {
            name: "adminFeesMeme",
            type: "u64",
          },
          {
            name: "adminFeesSol",
            type: "u64",
          },
          {
            name: "adminVaultSol",
            type: "publicKey",
          },
          {
            name: "launchTokenVault",
            type: "publicKey",
          },
          {
            name: "fees",
            type: {
              defined: "Fees",
            },
          },
          {
            name: "config",
            type: {
              defined: "Config",
            },
          },
          {
            name: "locked",
            type: "bool",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "Fees",
      type: {
        kind: "struct",
        fields: [
          {
            name: "feeInPercent",
            type: "u64",
          },
          {
            name: "feeOutPercent",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "VestingConfig",
      type: {
        kind: "struct",
        fields: [
          {
            name: "startTs",
            type: "i64",
          },
          {
            name: "cliffTs",
            type: "i64",
          },
          {
            name: "endTs",
            type: "i64",
          },
        ],
      },
    },
    {
      name: "VestingData",
      type: {
        kind: "struct",
        fields: [
          {
            name: "released",
            type: "u64",
          },
          {
            name: "notional",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "Config",
      type: {
        kind: "struct",
        fields: [
          {
            name: "alphaAbs",
            type: "u128",
          },
          {
            name: "beta",
            type: "u128",
          },
          {
            name: "priceFactor",
            type: "u64",
          },
          {
            name: "gammaS",
            type: "u64",
          },
          {
            name: "gammaM",
            type: "u64",
          },
          {
            name: "omegaM",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "Reserve",
      type: {
        kind: "struct",
        fields: [
          {
            name: "tokens",
            type: "u64",
          },
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "vault",
            type: "publicKey",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidAccountInput",
      msg: "Provided account breaks some constraints, see logs for more info",
    },
    {
      code: 6001,
      name: "InvalidArg",
      msg: "One of the provided input arguments is invalid",
    },
    {
      code: 6002,
      name: "SlippageExceeded",
      msg: "Given amount of tokens to swap would result in \\\n        less than minimum requested tokens to receive",
    },
    {
      code: 6003,
      name: "InvariantViolation",
      msg: "There's a bug in the program, see logs for more info",
    },
    {
      code: 6004,
      name: "InvalidTokenMints",
      msg: "Provided mints are not available on the pool",
    },
    {
      code: 6005,
      name: "MulDivOverflow",
    },
    {
      code: 6006,
      name: "DivideByZero",
    },
    {
      code: 6007,
      name: "ZeroInAmt",
    },
    {
      code: 6008,
      name: "ZeroMemeVault",
    },
    {
      code: 6009,
      name: "InsufficientBalance",
    },
    {
      code: 6010,
      name: "PoolIsLocked",
      msg: "Pool can't be interacted with until going into live phase",
    },
    {
      code: 6011,
      name: "NoZeroTokens",
      msg: "Shouldn't provide zero tokens in",
    },
    {
      code: 6012,
      name: "NoTokensToWithdraw",
    },
    {
      code: 6013,
      name: "NotEnoughTicketTokens",
      msg: "Amount of tokens in ticket is lower than needed to swap",
    },
    {
      code: 6014,
      name: "TicketTokensLocked",
      msg: "Not enough time passed to unlock tokens bound to the ticket",
    },
    {
      code: 6015,
      name: "NonZeroAmountTicket",
      msg: "Can't close ticket with non-zero bound token amount",
    },
    {
      code: 6016,
      name: "NotEnoughTokensToRelease",
      msg: "Can't unstake the required amount of tokens",
    },
    {
      code: 6017,
      name: "BondingCurveMustBeNegativelySloped",
    },
    {
      code: 6018,
      name: "BondingCurveInterceptMustBePositive",
    },
  ],
};
