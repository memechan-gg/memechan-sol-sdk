export type Lockup = {
  version: "0.1.0";
  name: "lockup";
  instructions: [
    {
      name: "createVesting";
      accounts: [
        {
          name: "vesting";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vestingSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "beneficiary";
          isMut: false;
          isSigner: false;
        },
        {
          name: "depositorTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "depositorAuthority";
          isMut: true;
          isSigner: true;
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
          name: "vestingNumber";
          type: "u64";
        },
        {
          name: "depositAmount";
          type: "u64";
        },
        {
          name: "startTs";
          type: "i64";
        },
        {
          name: "endTs";
          type: "i64";
        },
        {
          name: "periodCount";
          type: "u64";
        },
      ];
    },
    {
      name: "withdraw";
      accounts: [
        {
          name: "vesting";
          isMut: true;
          isSigner: false;
        },
        {
          name: "beneficiary";
          isMut: false;
          isSigner: true;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vestingSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "userTokenAccount";
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
          name: "amount";
          type: "u64";
        },
      ];
    },
    {
      name: "availableForWithdrawal";
      accounts: [
        {
          name: "vesting";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
  ];
  accounts: [
    {
      name: "vesting";
      type: {
        kind: "struct";
        fields: [
          {
            name: "beneficiary";
            docs: ["The owner of this Vesting account."];
            type: "publicKey";
          },
          {
            name: "mint";
            docs: ["The mint of the SPL token locked up."];
            type: "publicKey";
          },
          {
            name: "vault";
            docs: ["Address of the account's token vault."];
            type: "publicKey";
          },
          {
            name: "grantor";
            docs: ["The owner of the token account funding this account."];
            type: "publicKey";
          },
          {
            name: "outstanding";
            docs: [
              "The outstanding SRM deposit backing this vesting account. All",
              "withdrawals will deduct this balance.",
            ];
            type: "u64";
          },
          {
            name: "startBalance";
            docs: ["The starting balance of this vesting account, i.e., how much was", "originally deposited."];
            type: "u64";
          },
          {
            name: "createdTs";
            docs: ["The unix timestamp at which this vesting account was created."];
            type: "i64";
          },
          {
            name: "startTs";
            docs: ["The time at which vesting begins."];
            type: "i64";
          },
          {
            name: "endTs";
            docs: ["The time at which all tokens are vested."];
            type: "i64";
          },
          {
            name: "periodCount";
            docs: [
              "The number of times vesting will occur. For example, if vesting",
              "is once a year over seven years, this will be 7.",
            ];
            type: "u64";
          },
          {
            name: "whitelistOwned";
            docs: ["The amount of tokens in custody of whitelisted programs."];
            type: "u64";
          },
          {
            name: "nonce";
            docs: ["Signer nonce."];
            type: "u8";
          },
        ];
      };
    },
  ];
  errors: [
    {
      code: 6000;
      name: "InvalidAccountInput";
    },
    {
      code: 6001;
      name: "InvalidTimestamp";
      msg: "Vesting end must be greater than the current unix timestamp.";
    },
    {
      code: 6002;
      name: "InvalidPeriod";
      msg: "The number of vesting periods must be greater than zero.";
    },
    {
      code: 6003;
      name: "InvalidDepositAmount";
      msg: "The vesting deposit amount must be greater than zero.";
    },
    {
      code: 6004;
      name: "InsufficientWithdrawalBalance";
      msg: "Insufficient withdrawal balance.";
    },
    {
      code: 6005;
      name: "InvalidSchedule";
      msg: "Invalid vesting schedule given.";
    },
  ];
};

export const IDL: Lockup = {
  version: "0.1.0",
  name: "lockup",
  instructions: [
    {
      name: "createVesting",
      accounts: [
        {
          name: "vesting",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vestingSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "beneficiary",
          isMut: false,
          isSigner: false,
        },
        {
          name: "depositorTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositorAuthority",
          isMut: true,
          isSigner: true,
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
          name: "vestingNumber",
          type: "u64",
        },
        {
          name: "depositAmount",
          type: "u64",
        },
        {
          name: "startTs",
          type: "i64",
        },
        {
          name: "endTs",
          type: "i64",
        },
        {
          name: "periodCount",
          type: "u64",
        },
      ],
    },
    {
      name: "withdraw",
      accounts: [
        {
          name: "vesting",
          isMut: true,
          isSigner: false,
        },
        {
          name: "beneficiary",
          isMut: false,
          isSigner: true,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vestingSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "userTokenAccount",
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
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "availableForWithdrawal",
      accounts: [
        {
          name: "vesting",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "vesting",
      type: {
        kind: "struct",
        fields: [
          {
            name: "beneficiary",
            docs: ["The owner of this Vesting account."],
            type: "publicKey",
          },
          {
            name: "mint",
            docs: ["The mint of the SPL token locked up."],
            type: "publicKey",
          },
          {
            name: "vault",
            docs: ["Address of the account's token vault."],
            type: "publicKey",
          },
          {
            name: "grantor",
            docs: ["The owner of the token account funding this account."],
            type: "publicKey",
          },
          {
            name: "outstanding",
            docs: [
              "The outstanding SRM deposit backing this vesting account. All",
              "withdrawals will deduct this balance.",
            ],
            type: "u64",
          },
          {
            name: "startBalance",
            docs: ["The starting balance of this vesting account, i.e., how much was", "originally deposited."],
            type: "u64",
          },
          {
            name: "createdTs",
            docs: ["The unix timestamp at which this vesting account was created."],
            type: "i64",
          },
          {
            name: "startTs",
            docs: ["The time at which vesting begins."],
            type: "i64",
          },
          {
            name: "endTs",
            docs: ["The time at which all tokens are vested."],
            type: "i64",
          },
          {
            name: "periodCount",
            docs: [
              "The number of times vesting will occur. For example, if vesting",
              "is once a year over seven years, this will be 7.",
            ],
            type: "u64",
          },
          {
            name: "whitelistOwned",
            docs: ["The amount of tokens in custody of whitelisted programs."],
            type: "u64",
          },
          {
            name: "nonce",
            docs: ["Signer nonce."],
            type: "u8",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidAccountInput",
    },
    {
      code: 6001,
      name: "InvalidTimestamp",
      msg: "Vesting end must be greater than the current unix timestamp.",
    },
    {
      code: 6002,
      name: "InvalidPeriod",
      msg: "The number of vesting periods must be greater than zero.",
    },
    {
      code: 6003,
      name: "InvalidDepositAmount",
      msg: "The vesting deposit amount must be greater than zero.",
    },
    {
      code: 6004,
      name: "InsufficientWithdrawalBalance",
      msg: "Insufficient withdrawal balance.",
    },
    {
      code: 6005,
      name: "InvalidSchedule",
      msg: "Invalid vesting schedule given.",
    },
  ],
};
