export type Staking = {
  version: "0.2.0";
  name: "staking";
  instructions: [
    {
      name: "convertVestingToVchan";
      accounts: [
        {
          name: "vesting";
          isMut: true;
          isSigner: false;
          docs: ["Pre-existing vesting"];
        },
        {
          name: "vestingVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vestingSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "chanMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "beneficiary";
          isMut: false;
          isSigner: false;
        },
        {
          name: "stake";
          isMut: true;
          isSigner: true;
          docs: ["User's staking account for given v_mint"];
        },
        {
          name: "stakeSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "stakingState";
          isMut: true;
          isSigner: false;
          docs: ["Staking state for given v_mint"];
        },
        {
          name: "stakingStateSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userVeAcc";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "veMint";
          isMut: true;
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
          name: "token2022";
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
      name: "createStakingState";
      accounts: [
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "stakingState";
          isMut: true;
          isSigner: false;
          docs: ["Staking state for given v_mint"];
        },
        {
          name: "vMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "veMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "token2022";
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
      name: "stakeTokens";
      accounts: [
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "vesting";
          isMut: false;
          isSigner: false;
          isOptional: true;
        },
        {
          name: "stake";
          isMut: true;
          isSigner: true;
          docs: ["User's staking account for given v_mint"];
        },
        {
          name: "stakeSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "stakingState";
          isMut: true;
          isSigner: false;
          docs: ["Staking state for given v_mint"];
        },
        {
          name: "stakingStateSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userVAcc";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userVeAcc";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "veMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "token2022";
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
          name: "lockupTime";
          type: "u64";
        },
        {
          name: "tokensToUse";
          type: "u64";
        },
      ];
    },
    {
      name: "unstakeTokens";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "stake";
          isMut: true;
          isSigner: false;
          docs: ["User's staking account for given v_mint"];
        },
        {
          name: "stakeSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "stakingState";
          isMut: true;
          isSigner: false;
          docs: ["Staking state for given v_mint"];
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userVAcc";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userVeAcc";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "veMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "token2022";
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
      name: "createRewardState";
      accounts: [
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "rewardState";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stakingState";
          isMut: false;
          isSigner: false;
        },
        {
          name: "mint";
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
      name: "createReward";
      accounts: [
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "reward";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rewardState";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stakingState";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
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
          name: "rewardNumber";
          type: "u64";
        },
      ];
    },
    {
      name: "createUserRewards";
      accounts: [
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "userRewards";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stake";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rewardState";
          isMut: false;
          isSigner: false;
        },
        {
          name: "mint";
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
      name: "userSkipRewards";
      accounts: [
        {
          name: "userRewards";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stake";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rewardPrev";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rewardNext";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rewardState";
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
          name: "rewardNumberPrev";
          type: "u64";
        },
        {
          name: "rewardNumberNext";
          type: "u64";
        },
      ];
    },
    {
      name: "userWithdrawReward";
      accounts: [
        {
          name: "signer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "userRewards";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stake";
          isMut: false;
          isSigner: false;
        },
        {
          name: "reward";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rewardSigner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rewardState";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userVault";
          isMut: true;
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
          name: "rewardNumber";
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
    {
      name: "createVestingDebug";
      accounts: [
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "beneficiary";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vesting";
          isMut: true;
          isSigner: false;
          docs: ["Staking state for given v_mint"];
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
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vMint";
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
          name: "tokenAmt";
          type: "u64";
        },
      ];
    },
  ];
  accounts: [
    {
      name: "rewardState";
      type: {
        kind: "struct";
        fields: [
          {
            name: "mint";
            docs: ["The mint of the SPL token rewards to be given in."];
            type: "publicKey";
          },
          {
            name: "stakingState";
            type: "publicKey";
          },
          {
            name: "latestRewardNumber";
            type: "u64";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 16];
            };
          },
        ];
      };
    },
    {
      name: "reward";
      type: {
        kind: "struct";
        fields: [
          {
            name: "mint";
            docs: ["The mint of the SPL token rewards to be given in."];
            type: "publicKey";
          },
          {
            name: "vault";
            type: "publicKey";
          },
          {
            name: "number";
            type: "u64";
          },
          {
            name: "stakesTotal";
            type: "u64";
          },
          {
            name: "rewardAmount";
            type: "u64";
          },
          {
            name: "timestamp";
            type: "i64";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 16];
            };
          },
        ];
      };
    },
    {
      name: "stakingState";
      type: {
        kind: "struct";
        fields: [
          {
            name: "vMint";
            docs: ["The mint of the SPL token locked up."];
            type: "publicKey";
          },
          {
            name: "veMint";
            type: "publicKey";
          },
          {
            name: "veTotal";
            type: "u64";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 16];
            };
          },
        ];
      };
    },
    {
      name: "userRewards";
      type: {
        kind: "struct";
        fields: [
          {
            name: "owner";
            docs: ["The owner of this Vesting account."];
            type: "publicKey";
          },
          {
            name: "stake";
            docs: ["The mint of the SPL token locked up."];
            type: "publicKey";
          },
          {
            name: "rewardMint";
            type: "publicKey";
          },
          {
            name: "withdrawnNumber";
            type: "u64";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 8];
            };
          },
        ];
      };
    },
    {
      name: "userStake";
      type: {
        kind: "struct";
        fields: [
          {
            name: "owner";
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
            name: "stakingState";
            docs: ["State of the staking."];
            type: "publicKey";
          },
          {
            name: "amount";
            docs: ["Amount of vTokens locked"];
            type: "u64";
          },
          {
            name: "veAmount";
            docs: ["Amount of veTokens minted"];
            type: "u64";
          },
          {
            name: "stakedAt";
            type: "i64";
          },
          {
            name: "lockedUntilTs";
            docs: ["Lockup ts"];
            type: "i64";
          },
          {
            name: "withdrawnAt";
            type: "i64";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 8];
            };
          },
        ];
      };
    },
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
      name: "NoOutstandingTokensToConvert";
      msg: "No tokens to convert to vCHAN";
    },
    {
      code: 6002;
      name: "UnlockTsNotPassed";
      msg: "Unlock timestamp has not yet passed";
    },
    {
      code: 6003;
      name: "AlreadyWithdrawn";
      msg: "Cannot withdraw twice";
    },
    {
      code: 6004;
      name: "AlreadyConverted";
    },
    {
      code: 6005;
      name: "InvalidRewardNumber";
    },
    {
      code: 6006;
      name: "ZeroRewardTokens";
    },
    {
      code: 6007;
      name: "WrongRewardNumber";
    },
    {
      code: 6008;
      name: "StakedAfterReward";
    },
    {
      code: 6009;
      name: "WithdrawnBeforeReward";
    },
    {
      code: 6010;
      name: "UsingSameRewardToSkip";
      msg: "Cannot use the same reward to form skip interval";
    },
    {
      code: 6011;
      name: "NonConsecutiveRewards";
      msg: "Selected skip interval reward numbers should be consecutive";
    },
    {
      code: 6012;
      name: "StakedBeforePreviousReward";
      msg: "Stake ts is to the left of the skip interval";
    },
    {
      code: 6013;
      name: "StakedAfterNextReward";
      msg: "Stake ts is to the right of the skip interval";
    },
    {
      code: 6014;
      name: "StakingZeroTokens";
    },
  ];
};

export const IDL: Staking = {
  version: "0.2.0",
  name: "staking",
  instructions: [
    {
      name: "convertVestingToVchan",
      accounts: [
        {
          name: "vesting",
          isMut: true,
          isSigner: false,
          docs: ["Pre-existing vesting"],
        },
        {
          name: "vestingVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vestingSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "chanMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "beneficiary",
          isMut: false,
          isSigner: false,
        },
        {
          name: "stake",
          isMut: true,
          isSigner: true,
          docs: ["User's staking account for given v_mint"],
        },
        {
          name: "stakeSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "stakingState",
          isMut: true,
          isSigner: false,
          docs: ["Staking state for given v_mint"],
        },
        {
          name: "stakingStateSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userVeAcc",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "veMint",
          isMut: true,
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
          name: "token2022",
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
      name: "createStakingState",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "stakingState",
          isMut: true,
          isSigner: false,
          docs: ["Staking state for given v_mint"],
        },
        {
          name: "vMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "veMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "token2022",
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
      name: "stakeTokens",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "vesting",
          isMut: false,
          isSigner: false,
          isOptional: true,
        },
        {
          name: "stake",
          isMut: true,
          isSigner: true,
          docs: ["User's staking account for given v_mint"],
        },
        {
          name: "stakeSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "stakingState",
          isMut: true,
          isSigner: false,
          docs: ["Staking state for given v_mint"],
        },
        {
          name: "stakingStateSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userVAcc",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userVeAcc",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "veMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "token2022",
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
          name: "lockupTime",
          type: "u64",
        },
        {
          name: "tokensToUse",
          type: "u64",
        },
      ],
    },
    {
      name: "unstakeTokens",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "stake",
          isMut: true,
          isSigner: false,
          docs: ["User's staking account for given v_mint"],
        },
        {
          name: "stakeSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "stakingState",
          isMut: true,
          isSigner: false,
          docs: ["Staking state for given v_mint"],
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userVAcc",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userVeAcc",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "veMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "token2022",
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
      name: "createRewardState",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "rewardState",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakingState",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mint",
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
      name: "createReward",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "reward",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rewardState",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakingState",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
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
          name: "rewardNumber",
          type: "u64",
        },
      ],
    },
    {
      name: "createUserRewards",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "userRewards",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stake",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rewardState",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mint",
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
      name: "userSkipRewards",
      accounts: [
        {
          name: "userRewards",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stake",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rewardPrev",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rewardNext",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rewardState",
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
          name: "rewardNumberPrev",
          type: "u64",
        },
        {
          name: "rewardNumberNext",
          type: "u64",
        },
      ],
    },
    {
      name: "userWithdrawReward",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "userRewards",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stake",
          isMut: false,
          isSigner: false,
        },
        {
          name: "reward",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rewardSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rewardState",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userVault",
          isMut: true,
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
          name: "rewardNumber",
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
    {
      name: "createVestingDebug",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "beneficiary",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vesting",
          isMut: true,
          isSigner: false,
          docs: ["Staking state for given v_mint"],
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
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vMint",
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
          name: "tokenAmt",
          type: "u64",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "rewardState",
      type: {
        kind: "struct",
        fields: [
          {
            name: "mint",
            docs: ["The mint of the SPL token rewards to be given in."],
            type: "publicKey",
          },
          {
            name: "stakingState",
            type: "publicKey",
          },
          {
            name: "latestRewardNumber",
            type: "u64",
          },
          {
            name: "padding",
            type: {
              array: ["u8", 16],
            },
          },
        ],
      },
    },
    {
      name: "reward",
      type: {
        kind: "struct",
        fields: [
          {
            name: "mint",
            docs: ["The mint of the SPL token rewards to be given in."],
            type: "publicKey",
          },
          {
            name: "vault",
            type: "publicKey",
          },
          {
            name: "number",
            type: "u64",
          },
          {
            name: "stakesTotal",
            type: "u64",
          },
          {
            name: "rewardAmount",
            type: "u64",
          },
          {
            name: "timestamp",
            type: "i64",
          },
          {
            name: "padding",
            type: {
              array: ["u8", 16],
            },
          },
        ],
      },
    },
    {
      name: "stakingState",
      type: {
        kind: "struct",
        fields: [
          {
            name: "vMint",
            docs: ["The mint of the SPL token locked up."],
            type: "publicKey",
          },
          {
            name: "veMint",
            type: "publicKey",
          },
          {
            name: "veTotal",
            type: "u64",
          },
          {
            name: "padding",
            type: {
              array: ["u8", 16],
            },
          },
        ],
      },
    },
    {
      name: "userRewards",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            docs: ["The owner of this Vesting account."],
            type: "publicKey",
          },
          {
            name: "stake",
            docs: ["The mint of the SPL token locked up."],
            type: "publicKey",
          },
          {
            name: "rewardMint",
            type: "publicKey",
          },
          {
            name: "withdrawnNumber",
            type: "u64",
          },
          {
            name: "padding",
            type: {
              array: ["u8", 8],
            },
          },
        ],
      },
    },
    {
      name: "userStake",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
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
            name: "stakingState",
            docs: ["State of the staking."],
            type: "publicKey",
          },
          {
            name: "amount",
            docs: ["Amount of vTokens locked"],
            type: "u64",
          },
          {
            name: "veAmount",
            docs: ["Amount of veTokens minted"],
            type: "u64",
          },
          {
            name: "stakedAt",
            type: "i64",
          },
          {
            name: "lockedUntilTs",
            docs: ["Lockup ts"],
            type: "i64",
          },
          {
            name: "withdrawnAt",
            type: "i64",
          },
          {
            name: "padding",
            type: {
              array: ["u8", 8],
            },
          },
        ],
      },
    },
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
      name: "NoOutstandingTokensToConvert",
      msg: "No tokens to convert to vCHAN",
    },
    {
      code: 6002,
      name: "UnlockTsNotPassed",
      msg: "Unlock timestamp has not yet passed",
    },
    {
      code: 6003,
      name: "AlreadyWithdrawn",
      msg: "Cannot withdraw twice",
    },
    {
      code: 6004,
      name: "AlreadyConverted",
    },
    {
      code: 6005,
      name: "InvalidRewardNumber",
    },
    {
      code: 6006,
      name: "ZeroRewardTokens",
    },
    {
      code: 6007,
      name: "WrongRewardNumber",
    },
    {
      code: 6008,
      name: "StakedAfterReward",
    },
    {
      code: 6009,
      name: "WithdrawnBeforeReward",
    },
    {
      code: 6010,
      name: "UsingSameRewardToSkip",
      msg: "Cannot use the same reward to form skip interval",
    },
    {
      code: 6011,
      name: "NonConsecutiveRewards",
      msg: "Selected skip interval reward numbers should be consecutive",
    },
    {
      code: 6012,
      name: "StakedBeforePreviousReward",
      msg: "Stake ts is to the left of the skip interval",
    },
    {
      code: 6013,
      name: "StakedAfterNextReward",
      msg: "Stake ts is to the right of the skip interval",
    },
    {
      code: 6014,
      name: "StakingZeroTokens",
    },
  ],
};
