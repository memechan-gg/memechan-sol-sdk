export type MemechanSol = {
  "version": "0.2.0",
  "name": "memechan_sol",
  "instructions": [
    {
      "name": "newPool",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memeMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeQuoteVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "memeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "targetConfig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poolSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "vestingPeriod",
          "type": "u64"
        },
        {
          "name": "shouldAirdrop",
          "type": "bool"
        }
      ]
    },
    {
      "name": "createMetadata",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "memeMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memeMplMetadata",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "To store metaplex metadata. Created in the function scope"
          ]
        },
        {
          "name": "poolSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Program to create NFT metadata"
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "getSwapXAmt",
      "accounts": [
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteVault",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "coinInAmount",
          "type": "u64"
        },
        {
          "name": "coinYMinValue",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swapX",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memeTicket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userSol",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "poolSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "coinInAmount",
          "type": "u64"
        },
        {
          "name": "coinYMinValue",
          "type": "u64"
        }
      ]
    },
    {
      "name": "getSwapYAmt",
      "accounts": [
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteVault",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "coinInAmount",
          "type": "u64"
        },
        {
          "name": "coinXMinValue",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swapY",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userSol",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memeTicket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "poolSignerPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "coinInAmount",
          "type": "u64"
        },
        {
          "name": "coinXMinValue",
          "type": "u64"
        },
        {
          "name": "ticketNumber",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initStakingPool",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Signer"
          ]
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Bonding Pool account"
          ]
        },
        {
          "name": "boundPoolSignerPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poolMemeVault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Bonding Pool Meme vault"
          ]
        },
        {
          "name": "poolQuoteVault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Bonding Pool WSOL vault"
          ]
        },
        {
          "name": "feeVaultQuote",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Bonding Pool Admin Vault"
          ]
        },
        {
          "name": "memeMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Mint Account for Meme"
          ]
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Mint Account for WSOL"
          ]
        },
        {
          "name": "staking",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Account"
          ]
        },
        {
          "name": "stakingPoolSignerPda",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Signer"
          ]
        },
        {
          "name": "stakingMemeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingQuoteVault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Bonding Pool Quote vault"
          ]
        },
        {
          "name": "stakingChanVault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Bonding Pool CHAN vault"
          ]
        },
        {
          "name": "memeTicket",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Meme Ticket Account of Admin"
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "sendAirdropFunds",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "staking",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingPoolSignerPda",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Signer"
          ]
        },
        {
          "name": "stakingMemeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memeMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "airdropTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "airdropOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initMemeAmmPool",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Signer"
          ]
        },
        {
          "name": "staking",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Account"
          ]
        },
        {
          "name": "stakingPoolSignerPda",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Signer"
          ]
        },
        {
          "name": "stakingMemeVault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Meme vault"
          ]
        },
        {
          "name": "stakingQuoteVault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Quote vault"
          ]
        },
        {
          "name": "memeMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Mint Account for Meme"
          ]
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Mint Account for WSOL"
          ]
        },
        {
          "name": "lpMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payerPoolLp",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ammPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aVaultLp",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aVaultLpMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bVaultLp",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bVaultLpMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "adminTokenAFee",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "adminTokenBFee",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lockEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ammProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initChanAmmPool",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Signer"
          ]
        },
        {
          "name": "staking",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Account"
          ]
        },
        {
          "name": "stakingPoolSignerPda",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Signer"
          ]
        },
        {
          "name": "stakingQuoteVault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Chan vault"
          ]
        },
        {
          "name": "stakingMemeVault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Meme vault"
          ]
        },
        {
          "name": "stakingChanVault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Chan vault"
          ]
        },
        {
          "name": "memeMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Mint Account for Meme"
          ]
        },
        {
          "name": "chanMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Mint Account for Quote"
          ]
        },
        {
          "name": "chanSwap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "chanSwapSignerPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "chanSwapVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeQuoteVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lpMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payerPoolLp",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ammPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aVaultLp",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aVaultLpMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bVaultLp",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bVaultLpMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "adminTokenAFee",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "adminTokenBFee",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lockEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ammProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "newTargetConfig",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "targetConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "targetAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "changeTargetConfig",
      "accounts": [
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "targetConfig",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "targetAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "newChanSwap",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "chanSwap",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "chanSwapSignerPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "chanVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newPriceNum",
          "type": "u64"
        },
        {
          "name": "newPriceDenom",
          "type": "u64"
        }
      ]
    },
    {
      "name": "changeChanPrice",
      "accounts": [
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "chanSwap",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newPriceNum",
          "type": "u64"
        },
        {
          "name": "newPriceDenom",
          "type": "u64"
        }
      ]
    },
    {
      "name": "addFees",
      "accounts": [
        {
          "name": "staking",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memeMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "memeFeeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteFeeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingSignerPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ammPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lpMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aVaultLp",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aVaultLpMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bVaultLp",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bVaultLpMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lockEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sourceTokens",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ammProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "memoProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "staking",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memeTicket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userMeme",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userQuote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userChan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "chanVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "stakingSignerPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "releaseAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawFees",
      "accounts": [
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "staking",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "memeTicket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStats",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "userMeme",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userQuote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userChan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "chanVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "beMeme",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "stakingSignerPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "boundMergeTickets",
      "accounts": [
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ticketInto",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticketFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "stakingMergeTickets",
      "accounts": [
        {
          "name": "staking",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ticketInto",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticketFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "closeTicket",
      "accounts": [
        {
          "name": "ticket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "withdrawAdminFee",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "boundPoolSignerPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poolQuoteVault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Bonding Pool Quote Vault"
          ]
        },
        {
          "name": "feeVaultQuote",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Bonding Pool Fee Vault"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "increaseVesting",
      "accounts": [
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "staking",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "vestingTsIncrease",
          "type": "u64"
        }
      ]
    },
    {
      "name": "fixAdminTicket",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "staking",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "adminTicket",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "newUserStatsIdempotent",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "referral",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "userStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "boundPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "memeReserve",
            "type": {
              "defined": "Reserve"
            }
          },
          {
            "name": "quoteReserve",
            "type": {
              "defined": "Reserve"
            }
          },
          {
            "name": "adminFeesMeme",
            "type": "u64"
          },
          {
            "name": "adminFeesQuote",
            "type": "u64"
          },
          {
            "name": "feeVaultQuote",
            "type": "publicKey"
          },
          {
            "name": "creatorAddr",
            "type": "publicKey"
          },
          {
            "name": "fees",
            "type": {
              "defined": "Fees"
            }
          },
          {
            "name": "config",
            "type": {
              "defined": "Config"
            }
          },
          {
            "name": "airdroppedTokens",
            "type": "u64"
          },
          {
            "name": "locked",
            "type": "bool"
          },
          {
            "name": "vestingPeriod",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "chanSwap",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "chanSolPriceNum",
            "type": "u64"
          },
          {
            "name": "chanSolPriceDenom",
            "type": "u64"
          },
          {
            "name": "chanVault",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "memeTicket",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "withdrawsMeme",
            "type": "u64"
          },
          {
            "name": "withdrawsQuote",
            "type": "u64"
          },
          {
            "name": "withdrawsChan",
            "type": "u64"
          },
          {
            "name": "untilTimestamp",
            "type": "i64"
          },
          {
            "name": "vesting",
            "type": {
              "defined": "VestingData"
            }
          }
        ]
      }
    },
    {
      "name": "stakingPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "memeVault",
            "type": "publicKey"
          },
          {
            "name": "memeMint",
            "type": "publicKey"
          },
          {
            "name": "quoteVault",
            "type": "publicKey"
          },
          {
            "name": "quoteMint",
            "type": "publicKey"
          },
          {
            "name": "chanVault",
            "type": "publicKey"
          },
          {
            "name": "quoteAmmPool",
            "type": "publicKey"
          },
          {
            "name": "chanAmmPool",
            "type": "publicKey"
          },
          {
            "name": "vestingConfig",
            "type": {
              "defined": "VestingConfig"
            }
          },
          {
            "name": "stakesTotal",
            "type": "u64"
          },
          {
            "name": "feesXTotal",
            "type": "u64"
          },
          {
            "name": "feesYTotal",
            "type": "u64"
          },
          {
            "name": "feesZTotal",
            "type": "u64"
          },
          {
            "name": "toAirdrop",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "adminFeePosition",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "targetConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenTargetAmount",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "userStats",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "referral",
            "type": "publicKey"
          },
          {
            "name": "memeFees",
            "type": "u64"
          },
          {
            "name": "quoteFees",
            "type": "u64"
          },
          {
            "name": "memeReceived",
            "type": "u64"
          },
          {
            "name": "quoteReceived",
            "type": "u64"
          },
          {
            "name": "chanReceived",
            "type": "u64"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Decimals",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "alpha",
            "type": "u128"
          },
          {
            "name": "beta",
            "type": "u128"
          },
          {
            "name": "quote",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "Config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "alphaAbs",
            "type": "u128"
          },
          {
            "name": "beta",
            "type": "u128"
          },
          {
            "name": "priceFactorNum",
            "type": "u64"
          },
          {
            "name": "priceFactorDenom",
            "type": "u64"
          },
          {
            "name": "gammaS",
            "type": "u64"
          },
          {
            "name": "gammaM",
            "type": "u64"
          },
          {
            "name": "omegaM",
            "type": "u64"
          },
          {
            "name": "decimals",
            "type": {
              "defined": "Decimals"
            }
          }
        ]
      }
    },
    {
      "name": "Fees",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feeMemePercent",
            "type": "u64"
          },
          {
            "name": "feeQuotePercent",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "TokenLimit",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "tokens",
            "type": {
              "defined": "TokenAmount"
            }
          }
        ]
      }
    },
    {
      "name": "TokenAmount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "Reserve",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokens",
            "type": "u64"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "vault",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "VestingConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "cliffTs",
            "type": "i64"
          },
          {
            "name": "endTs",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "VestingData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "released",
            "type": "u64"
          },
          {
            "name": "notional",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "DecimalError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "MathOverflow"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAccountInput",
      "msg": "Provided account breaks some constraints, see logs for more info"
    },
    {
      "code": 6001,
      "name": "InvalidArg",
      "msg": "One of the provided input arguments is invalid"
    },
    {
      "code": 6002,
      "name": "SlippageExceeded",
      "msg": "Given amount of tokens to swap would result in less than minimum requested tokens to receive"
    },
    {
      "code": 6003,
      "name": "InvariantViolation",
      "msg": "There's a bug in the program, see logs for more info"
    },
    {
      "code": 6004,
      "name": "InvalidTokenMints",
      "msg": "Provided mints are not available on the pool"
    },
    {
      "code": 6005,
      "name": "MathOverflow"
    },
    {
      "code": 6006,
      "name": "MulDivOverflow"
    },
    {
      "code": 6007,
      "name": "DivideByZero"
    },
    {
      "code": 6008,
      "name": "ZeroInAmt"
    },
    {
      "code": 6009,
      "name": "ZeroMemeVault"
    },
    {
      "code": 6010,
      "name": "InsufficientBalance"
    },
    {
      "code": 6011,
      "name": "PoolIsLocked",
      "msg": "Pool can't be interacted with until going into live phase"
    },
    {
      "code": 6012,
      "name": "NoZeroTokens",
      "msg": "Shouldn't provide zero tokens in"
    },
    {
      "code": 6013,
      "name": "NoTokensToWithdraw"
    },
    {
      "code": 6014,
      "name": "NotEnoughTicketTokens",
      "msg": "Amount of tokens in ticket is lower than needed to swap"
    },
    {
      "code": 6015,
      "name": "TicketTokensLocked",
      "msg": "Not enough time passed to unlock tokens bound to the ticket"
    },
    {
      "code": 6016,
      "name": "NonZeroAmountTicket",
      "msg": "Can't close ticket with non-zero bound token amount"
    },
    {
      "code": 6017,
      "name": "NotEnoughTokensToRelease",
      "msg": "Can't unstake the required amount of tokens"
    },
    {
      "code": 6018,
      "name": "BondingCurveMustBeNegativelySloped"
    },
    {
      "code": 6019,
      "name": "BondingCurveInterceptMustBePositive"
    },
    {
      "code": 6020,
      "name": "EGammaSAboveRelativeLimit"
    },
    {
      "code": 6021,
      "name": "EScaleTooLow"
    },
    {
      "code": 6022,
      "name": "InvalidAmmAccountOwner"
    },
    {
      "code": 6023,
      "name": "ExpectedAccount"
    },
    {
      "code": 6024,
      "name": "InvalidStatus"
    },
    {
      "code": 6025,
      "name": "CantUnstakeBeforeCliff"
    },
    {
      "code": 6026,
      "name": "NoFeesToAdd"
    },
    {
      "code": 6027,
      "name": "StakingIsNotActive",
      "msg": "Staking should be fully initialized before it can be interacted with"
    },
    {
      "code": 6028,
      "name": "NonZeroInitialMemeSupply"
    },
    {
      "code": 6029,
      "name": "AirdroppedTokensOvercap"
    },
    {
      "code": 6030,
      "name": "InvalidVestingPeriod"
    },
    {
      "code": 6031,
      "name": "AdminShouldNotUnstake"
    },
    {
      "code": 6032,
      "name": "ShouldProvideBackendVault"
    },
    {
      "code": 6033,
      "name": "ShouldProvideUserStats"
    }
  ]
};

export const IDL: MemechanSol = {
  "version": "0.2.0",
  "name": "memechan_sol",
  "instructions": [
    {
      "name": "newPool",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memeMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeQuoteVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "memeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "targetConfig",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poolSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "vestingPeriod",
          "type": "u64"
        },
        {
          "name": "shouldAirdrop",
          "type": "bool"
        }
      ]
    },
    {
      "name": "createMetadata",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "memeMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memeMplMetadata",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "To store metaplex metadata. Created in the function scope"
          ]
        },
        {
          "name": "poolSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Program to create NFT metadata"
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "getSwapXAmt",
      "accounts": [
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteVault",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "coinInAmount",
          "type": "u64"
        },
        {
          "name": "coinYMinValue",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swapX",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memeTicket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userSol",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "poolSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "coinInAmount",
          "type": "u64"
        },
        {
          "name": "coinYMinValue",
          "type": "u64"
        }
      ]
    },
    {
      "name": "getSwapYAmt",
      "accounts": [
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteVault",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "coinInAmount",
          "type": "u64"
        },
        {
          "name": "coinXMinValue",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swapY",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userSol",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memeTicket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "poolSignerPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "coinInAmount",
          "type": "u64"
        },
        {
          "name": "coinXMinValue",
          "type": "u64"
        },
        {
          "name": "ticketNumber",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initStakingPool",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Signer"
          ]
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Bonding Pool account"
          ]
        },
        {
          "name": "boundPoolSignerPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poolMemeVault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Bonding Pool Meme vault"
          ]
        },
        {
          "name": "poolQuoteVault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Bonding Pool WSOL vault"
          ]
        },
        {
          "name": "feeVaultQuote",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Bonding Pool Admin Vault"
          ]
        },
        {
          "name": "memeMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Mint Account for Meme"
          ]
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Mint Account for WSOL"
          ]
        },
        {
          "name": "staking",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Account"
          ]
        },
        {
          "name": "stakingPoolSignerPda",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Signer"
          ]
        },
        {
          "name": "stakingMemeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingQuoteVault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Bonding Pool Quote vault"
          ]
        },
        {
          "name": "stakingChanVault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Bonding Pool CHAN vault"
          ]
        },
        {
          "name": "memeTicket",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Meme Ticket Account of Admin"
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "sendAirdropFunds",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "staking",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingPoolSignerPda",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Signer"
          ]
        },
        {
          "name": "stakingMemeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memeMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "airdropTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "airdropOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initMemeAmmPool",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Signer"
          ]
        },
        {
          "name": "staking",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Account"
          ]
        },
        {
          "name": "stakingPoolSignerPda",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Signer"
          ]
        },
        {
          "name": "stakingMemeVault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Meme vault"
          ]
        },
        {
          "name": "stakingQuoteVault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Quote vault"
          ]
        },
        {
          "name": "memeMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Mint Account for Meme"
          ]
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Mint Account for WSOL"
          ]
        },
        {
          "name": "lpMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payerPoolLp",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ammPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aVaultLp",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aVaultLpMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bVaultLp",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bVaultLpMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "adminTokenAFee",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "adminTokenBFee",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lockEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ammProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initChanAmmPool",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Signer"
          ]
        },
        {
          "name": "staking",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Account"
          ]
        },
        {
          "name": "stakingPoolSignerPda",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Signer"
          ]
        },
        {
          "name": "stakingQuoteVault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Chan vault"
          ]
        },
        {
          "name": "stakingMemeVault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Meme vault"
          ]
        },
        {
          "name": "stakingChanVault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staking Pool Chan vault"
          ]
        },
        {
          "name": "memeMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Mint Account for Meme"
          ]
        },
        {
          "name": "chanMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Mint Account for Quote"
          ]
        },
        {
          "name": "chanSwap",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "chanSwapSignerPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "chanSwapVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeQuoteVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lpMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payerPoolLp",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ammPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aVaultLp",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aVaultLpMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bVaultLp",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bVaultLpMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "adminTokenAFee",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "adminTokenBFee",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lockEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ammProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "newTargetConfig",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "targetConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "targetAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "changeTargetConfig",
      "accounts": [
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "targetConfig",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "targetAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "newChanSwap",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "chanSwap",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "chanSwapSignerPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "chanVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newPriceNum",
          "type": "u64"
        },
        {
          "name": "newPriceDenom",
          "type": "u64"
        }
      ]
    },
    {
      "name": "changeChanPrice",
      "accounts": [
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "chanSwap",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newPriceNum",
          "type": "u64"
        },
        {
          "name": "newPriceDenom",
          "type": "u64"
        }
      ]
    },
    {
      "name": "addFees",
      "accounts": [
        {
          "name": "staking",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memeMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "memeFeeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteFeeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingSignerPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ammPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lpMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aVaultLp",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aVaultLpMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bVaultLp",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bVaultLpMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lockEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sourceTokens",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ammProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "memoProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "staking",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memeTicket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userMeme",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userQuote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userChan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "chanVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "stakingSignerPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "releaseAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawFees",
      "accounts": [
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "staking",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "memeTicket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userStats",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "userMeme",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userQuote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userChan",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "chanVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "beMeme",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "stakingSignerPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "boundMergeTickets",
      "accounts": [
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ticketInto",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticketFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "stakingMergeTickets",
      "accounts": [
        {
          "name": "staking",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ticketInto",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticketFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "closeTicket",
      "accounts": [
        {
          "name": "ticket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "withdrawAdminFee",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "boundPoolSignerPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poolQuoteVault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Bonding Pool Quote Vault"
          ]
        },
        {
          "name": "feeVaultQuote",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Bonding Pool Fee Vault"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "increaseVesting",
      "accounts": [
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "staking",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "vestingTsIncrease",
          "type": "u64"
        }
      ]
    },
    {
      "name": "fixAdminTicket",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "staking",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "adminTicket",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "newUserStatsIdempotent",
      "accounts": [
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "referral",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "userStats",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "boundPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "memeReserve",
            "type": {
              "defined": "Reserve"
            }
          },
          {
            "name": "quoteReserve",
            "type": {
              "defined": "Reserve"
            }
          },
          {
            "name": "adminFeesMeme",
            "type": "u64"
          },
          {
            "name": "adminFeesQuote",
            "type": "u64"
          },
          {
            "name": "feeVaultQuote",
            "type": "publicKey"
          },
          {
            "name": "creatorAddr",
            "type": "publicKey"
          },
          {
            "name": "fees",
            "type": {
              "defined": "Fees"
            }
          },
          {
            "name": "config",
            "type": {
              "defined": "Config"
            }
          },
          {
            "name": "airdroppedTokens",
            "type": "u64"
          },
          {
            "name": "locked",
            "type": "bool"
          },
          {
            "name": "vestingPeriod",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "chanSwap",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "chanSolPriceNum",
            "type": "u64"
          },
          {
            "name": "chanSolPriceDenom",
            "type": "u64"
          },
          {
            "name": "chanVault",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "memeTicket",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "withdrawsMeme",
            "type": "u64"
          },
          {
            "name": "withdrawsQuote",
            "type": "u64"
          },
          {
            "name": "withdrawsChan",
            "type": "u64"
          },
          {
            "name": "untilTimestamp",
            "type": "i64"
          },
          {
            "name": "vesting",
            "type": {
              "defined": "VestingData"
            }
          }
        ]
      }
    },
    {
      "name": "stakingPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "memeVault",
            "type": "publicKey"
          },
          {
            "name": "memeMint",
            "type": "publicKey"
          },
          {
            "name": "quoteVault",
            "type": "publicKey"
          },
          {
            "name": "quoteMint",
            "type": "publicKey"
          },
          {
            "name": "chanVault",
            "type": "publicKey"
          },
          {
            "name": "quoteAmmPool",
            "type": "publicKey"
          },
          {
            "name": "chanAmmPool",
            "type": "publicKey"
          },
          {
            "name": "vestingConfig",
            "type": {
              "defined": "VestingConfig"
            }
          },
          {
            "name": "stakesTotal",
            "type": "u64"
          },
          {
            "name": "feesXTotal",
            "type": "u64"
          },
          {
            "name": "feesYTotal",
            "type": "u64"
          },
          {
            "name": "feesZTotal",
            "type": "u64"
          },
          {
            "name": "toAirdrop",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "adminFeePosition",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "targetConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenTargetAmount",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "userStats",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "referral",
            "type": "publicKey"
          },
          {
            "name": "memeFees",
            "type": "u64"
          },
          {
            "name": "quoteFees",
            "type": "u64"
          },
          {
            "name": "memeReceived",
            "type": "u64"
          },
          {
            "name": "quoteReceived",
            "type": "u64"
          },
          {
            "name": "chanReceived",
            "type": "u64"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Decimals",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "alpha",
            "type": "u128"
          },
          {
            "name": "beta",
            "type": "u128"
          },
          {
            "name": "quote",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "Config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "alphaAbs",
            "type": "u128"
          },
          {
            "name": "beta",
            "type": "u128"
          },
          {
            "name": "priceFactorNum",
            "type": "u64"
          },
          {
            "name": "priceFactorDenom",
            "type": "u64"
          },
          {
            "name": "gammaS",
            "type": "u64"
          },
          {
            "name": "gammaM",
            "type": "u64"
          },
          {
            "name": "omegaM",
            "type": "u64"
          },
          {
            "name": "decimals",
            "type": {
              "defined": "Decimals"
            }
          }
        ]
      }
    },
    {
      "name": "Fees",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feeMemePercent",
            "type": "u64"
          },
          {
            "name": "feeQuotePercent",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "TokenLimit",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "tokens",
            "type": {
              "defined": "TokenAmount"
            }
          }
        ]
      }
    },
    {
      "name": "TokenAmount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "Reserve",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokens",
            "type": "u64"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "vault",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "VestingConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "cliffTs",
            "type": "i64"
          },
          {
            "name": "endTs",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "VestingData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "released",
            "type": "u64"
          },
          {
            "name": "notional",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "DecimalError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "MathOverflow"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAccountInput",
      "msg": "Provided account breaks some constraints, see logs for more info"
    },
    {
      "code": 6001,
      "name": "InvalidArg",
      "msg": "One of the provided input arguments is invalid"
    },
    {
      "code": 6002,
      "name": "SlippageExceeded",
      "msg": "Given amount of tokens to swap would result in less than minimum requested tokens to receive"
    },
    {
      "code": 6003,
      "name": "InvariantViolation",
      "msg": "There's a bug in the program, see logs for more info"
    },
    {
      "code": 6004,
      "name": "InvalidTokenMints",
      "msg": "Provided mints are not available on the pool"
    },
    {
      "code": 6005,
      "name": "MathOverflow"
    },
    {
      "code": 6006,
      "name": "MulDivOverflow"
    },
    {
      "code": 6007,
      "name": "DivideByZero"
    },
    {
      "code": 6008,
      "name": "ZeroInAmt"
    },
    {
      "code": 6009,
      "name": "ZeroMemeVault"
    },
    {
      "code": 6010,
      "name": "InsufficientBalance"
    },
    {
      "code": 6011,
      "name": "PoolIsLocked",
      "msg": "Pool can't be interacted with until going into live phase"
    },
    {
      "code": 6012,
      "name": "NoZeroTokens",
      "msg": "Shouldn't provide zero tokens in"
    },
    {
      "code": 6013,
      "name": "NoTokensToWithdraw"
    },
    {
      "code": 6014,
      "name": "NotEnoughTicketTokens",
      "msg": "Amount of tokens in ticket is lower than needed to swap"
    },
    {
      "code": 6015,
      "name": "TicketTokensLocked",
      "msg": "Not enough time passed to unlock tokens bound to the ticket"
    },
    {
      "code": 6016,
      "name": "NonZeroAmountTicket",
      "msg": "Can't close ticket with non-zero bound token amount"
    },
    {
      "code": 6017,
      "name": "NotEnoughTokensToRelease",
      "msg": "Can't unstake the required amount of tokens"
    },
    {
      "code": 6018,
      "name": "BondingCurveMustBeNegativelySloped"
    },
    {
      "code": 6019,
      "name": "BondingCurveInterceptMustBePositive"
    },
    {
      "code": 6020,
      "name": "EGammaSAboveRelativeLimit"
    },
    {
      "code": 6021,
      "name": "EScaleTooLow"
    },
    {
      "code": 6022,
      "name": "InvalidAmmAccountOwner"
    },
    {
      "code": 6023,
      "name": "ExpectedAccount"
    },
    {
      "code": 6024,
      "name": "InvalidStatus"
    },
    {
      "code": 6025,
      "name": "CantUnstakeBeforeCliff"
    },
    {
      "code": 6026,
      "name": "NoFeesToAdd"
    },
    {
      "code": 6027,
      "name": "StakingIsNotActive",
      "msg": "Staking should be fully initialized before it can be interacted with"
    },
    {
      "code": 6028,
      "name": "NonZeroInitialMemeSupply"
    },
    {
      "code": 6029,
      "name": "AirdroppedTokensOvercap"
    },
    {
      "code": 6030,
      "name": "InvalidVestingPeriod"
    },
    {
      "code": 6031,
      "name": "AdminShouldNotUnstake"
    },
    {
      "code": 6032,
      "name": "ShouldProvideBackendVault"
    },
    {
      "code": 6033,
      "name": "ShouldProvideUserStats"
    }
  ]
};
