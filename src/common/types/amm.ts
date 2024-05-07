export type Amm = {
  version: "2.0.1";
  name: "amm";
  instructions: [
    {
      name: "createProgramToll";
      accounts: [
        {
          name: "programTollAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "programToll";
          isMut: true;
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
      name: "createDiscountSettings";
      accounts: [
        {
          name: "discountSettingsAuthority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "discountSettings";
          isMut: true;
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
      name: "createPool";
      accounts: [
        {
          name: "admin";
          isMut: true;
          isSigner: true;
        },
        {
          name: "pool";
          isMut: true;
          isSigner: true;
        },
        {
          name: "poolSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "programToll";
          isMut: false;
          isSigner: false;
        },
        {
          name: "programTollWallet";
          isMut: false;
          isSigner: false;
        },
        {
          name: "lpMint";
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
          name: "amplifier";
          type: "u64";
        },
      ];
    },
    {
      name: "putDiscount";
      accounts: [
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "discount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "discountSettings";
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
          name: "user";
          type: "publicKey";
        },
        {
          name: "discountAmount";
          type: {
            defined: "Permillion";
          };
        },
        {
          name: "validUntil";
          type: {
            defined: "Slot";
          };
        },
      ];
    },
    {
      name: "setPoolSwapFee";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: "fee";
          type: {
            defined: "Permillion";
          };
        },
      ];
    },
    {
      name: "depositLiquidity";
      accounts: [
        {
          name: "user";
          isMut: false;
          isSigner: true;
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "poolSignerPda";
          isMut: false;
          isSigner: false;
        },
        {
          name: "lpMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "lpTokenWallet";
          isMut: true;
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
          name: "maxAmountTokens";
          type: {
            vec: {
              defined: "TokenLimit";
            };
          };
        },
      ];
    },
    {
      name: "redeemLiquidity";
      accounts: [
        {
          name: "user";
          isMut: false;
          isSigner: true;
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "poolSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "lpMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "lpTokenWallet";
          isMut: true;
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
          name: "lpTokensToBurn";
          type: {
            defined: "TokenAmount";
          };
        },
        {
          name: "minAmountTokens";
          type: {
            vec: {
              defined: "TokenLimit";
            };
          };
        },
      ];
    },
    {
      name: "swap";
      accounts: [
        {
          name: "user";
          isMut: false;
          isSigner: true;
        },
        {
          name: "discount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "poolSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "sellWallet";
          isMut: true;
          isSigner: false;
        },
        {
          name: "buyWallet";
          isMut: true;
          isSigner: false;
        },
        {
          name: "sellVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "buyVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "lpMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "programTollWallet";
          isMut: true;
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
          name: "sell";
          type: {
            defined: "TokenAmount";
          };
        },
        {
          name: "minBuy";
          type: {
            defined: "TokenAmount";
          };
        },
      ];
    },
  ];
  accounts: [
    {
      name: "discountSettings";
      type: {
        kind: "struct";
        fields: [
          {
            name: "authority";
            type: "publicKey";
          },
        ];
      };
    },
    {
      name: "discount";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amount";
            type: {
              defined: "Permillion";
            };
          },
          {
            name: "validUntil";
            type: {
              defined: "Slot";
            };
          },
        ];
      };
    },
    {
      name: "pool";
      type: {
        kind: "struct";
        fields: [
          {
            name: "admin";
            type: "publicKey";
          },
          {
            name: "signer";
            type: "publicKey";
          },
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "programTollWallet";
            type: "publicKey";
          },
          {
            name: "dimension";
            type: "u64";
          },
          {
            name: "reserves";
            type: {
              array: [
                {
                  defined: "Reserve";
                },
                4,
              ];
            };
          },
          {
            name: "curve";
            type: {
              defined: "Curve";
            };
          },
          {
            name: "swapFee";
            type: {
              defined: "Permillion";
            };
          },
        ];
      };
    },
    {
      name: "programToll";
      type: {
        kind: "struct";
        fields: [
          {
            name: "authority";
            type: "publicKey";
          },
        ];
      };
    },
  ];
  types: [
    {
      name: "SDecimal";
      type: {
        kind: "struct";
        fields: [
          {
            name: "u192";
            type: {
              array: ["u64", 3];
            };
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
            type: {
              defined: "TokenAmount";
            };
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
    {
      name: "TokenLimit";
      type: {
        kind: "struct";
        fields: [
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "tokens";
            type: {
              defined: "TokenAmount";
            };
          },
        ];
      };
    },
    {
      name: "TokenAmount";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amount";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "Slot";
      type: {
        kind: "struct";
        fields: [
          {
            name: "slot";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "Permillion";
      type: {
        kind: "struct";
        fields: [
          {
            name: "permillion";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "Curve";
      type: {
        kind: "enum";
        variants: [
          {
            name: "ConstProd";
          },
          {
            name: "Stable";
            fields: [
              {
                name: "amplifier";
                type: "u64";
              },
              {
                name: "invariant";
                type: {
                  defined: "SDecimal";
                };
              },
            ];
          },
        ];
      };
    },
  ];
  errors: [
    {
      code: 6000;
      name: "MathOverflow";
      msg: "Operation would result in an overflow";
    },
    {
      code: 6001;
      name: "InvalidAccountInput";
      msg: "Provided account breaks some constraints, see logs for more info";
    },
    {
      code: 6002;
      name: "InvalidArg";
      msg: "One of the provided input arguments is invalid";
    },
    {
      code: 6003;
      name: "SlippageExceeded";
      msg: "Given amount of tokens to swap would result in \\\n        less than minimum requested tokens to receive";
    },
    {
      code: 6004;
      name: "InvariantViolation";
      msg: "There's a bug in the program, see logs for more info";
    },
    {
      code: 6005;
      name: "InvalidTokenMints";
      msg: "Provided mints are not available on the pool";
    },
    {
      code: 6006;
      name: "InvalidLpTokenAmount";
      msg: "Invalid lp token amount to burn";
    },
  ];
};

export const IDL: Amm = {
  version: "2.0.1",
  name: "amm",
  instructions: [
    {
      name: "createProgramToll",
      accounts: [
        {
          name: "programTollAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "programToll",
          isMut: true,
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
      name: "createDiscountSettings",
      accounts: [
        {
          name: "discountSettingsAuthority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "discountSettings",
          isMut: true,
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
      name: "createPool",
      accounts: [
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "pool",
          isMut: true,
          isSigner: true,
        },
        {
          name: "poolSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "programToll",
          isMut: false,
          isSigner: false,
        },
        {
          name: "programTollWallet",
          isMut: false,
          isSigner: false,
        },
        {
          name: "lpMint",
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
          name: "amplifier",
          type: "u64",
        },
      ],
    },
    {
      name: "putDiscount",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "discount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "discountSettings",
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
          name: "user",
          type: "publicKey",
        },
        {
          name: "discountAmount",
          type: {
            defined: "Permillion",
          },
        },
        {
          name: "validUntil",
          type: {
            defined: "Slot",
          },
        },
      ],
    },
    {
      name: "setPoolSwapFee",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "fee",
          type: {
            defined: "Permillion",
          },
        },
      ],
    },
    {
      name: "depositLiquidity",
      accounts: [
        {
          name: "user",
          isMut: false,
          isSigner: true,
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "poolSignerPda",
          isMut: false,
          isSigner: false,
        },
        {
          name: "lpMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "lpTokenWallet",
          isMut: true,
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
          name: "maxAmountTokens",
          type: {
            vec: {
              defined: "TokenLimit",
            },
          },
        },
      ],
    },
    {
      name: "redeemLiquidity",
      accounts: [
        {
          name: "user",
          isMut: false,
          isSigner: true,
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "poolSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "lpMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "lpTokenWallet",
          isMut: true,
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
          name: "lpTokensToBurn",
          type: {
            defined: "TokenAmount",
          },
        },
        {
          name: "minAmountTokens",
          type: {
            vec: {
              defined: "TokenLimit",
            },
          },
        },
      ],
    },
    {
      name: "swap",
      accounts: [
        {
          name: "user",
          isMut: false,
          isSigner: true,
        },
        {
          name: "discount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "poolSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "sellWallet",
          isMut: true,
          isSigner: false,
        },
        {
          name: "buyWallet",
          isMut: true,
          isSigner: false,
        },
        {
          name: "sellVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "buyVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "lpMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "programTollWallet",
          isMut: true,
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
          name: "sell",
          type: {
            defined: "TokenAmount",
          },
        },
        {
          name: "minBuy",
          type: {
            defined: "TokenAmount",
          },
        },
      ],
    },
  ],
  accounts: [
    {
      name: "discountSettings",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authority",
            type: "publicKey",
          },
        ],
      },
    },
    {
      name: "discount",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amount",
            type: {
              defined: "Permillion",
            },
          },
          {
            name: "validUntil",
            type: {
              defined: "Slot",
            },
          },
        ],
      },
    },
    {
      name: "pool",
      type: {
        kind: "struct",
        fields: [
          {
            name: "admin",
            type: "publicKey",
          },
          {
            name: "signer",
            type: "publicKey",
          },
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "programTollWallet",
            type: "publicKey",
          },
          {
            name: "dimension",
            type: "u64",
          },
          {
            name: "reserves",
            type: {
              array: [
                {
                  defined: "Reserve",
                },
                4,
              ],
            },
          },
          {
            name: "curve",
            type: {
              defined: "Curve",
            },
          },
          {
            name: "swapFee",
            type: {
              defined: "Permillion",
            },
          },
        ],
      },
    },
    {
      name: "programToll",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authority",
            type: "publicKey",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "SDecimal",
      type: {
        kind: "struct",
        fields: [
          {
            name: "u192",
            type: {
              array: ["u64", 3],
            },
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
            type: {
              defined: "TokenAmount",
            },
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
    {
      name: "TokenLimit",
      type: {
        kind: "struct",
        fields: [
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "tokens",
            type: {
              defined: "TokenAmount",
            },
          },
        ],
      },
    },
    {
      name: "TokenAmount",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amount",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "Slot",
      type: {
        kind: "struct",
        fields: [
          {
            name: "slot",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "Permillion",
      type: {
        kind: "struct",
        fields: [
          {
            name: "permillion",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "Curve",
      type: {
        kind: "enum",
        variants: [
          {
            name: "ConstProd",
          },
          {
            name: "Stable",
            fields: [
              {
                name: "amplifier",
                type: "u64",
              },
              {
                name: "invariant",
                type: {
                  defined: "SDecimal",
                },
              },
            ],
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "MathOverflow",
      msg: "Operation would result in an overflow",
    },
    {
      code: 6001,
      name: "InvalidAccountInput",
      msg: "Provided account breaks some constraints, see logs for more info",
    },
    {
      code: 6002,
      name: "InvalidArg",
      msg: "One of the provided input arguments is invalid",
    },
    {
      code: 6003,
      name: "SlippageExceeded",
      msg: "Given amount of tokens to swap would result in \\\n        less than minimum requested tokens to receive",
    },
    {
      code: 6004,
      name: "InvariantViolation",
      msg: "There's a bug in the program, see logs for more info",
    },
    {
      code: 6005,
      name: "InvalidTokenMints",
      msg: "Provided mints are not available on the pool",
    },
    {
      code: 6006,
      name: "InvalidLpTokenAmount",
      msg: "Invalid lp token amount to burn",
    },
  ],
};
