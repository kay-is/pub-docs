---
permalink: "docs/misc/ethareum/"
prev: false
next: false
---

# EthAReum

## Overview

EthAReum is a new key derivation protocol that enables the generation of private keys for an Arweave wallet using a signature from an Ethereum wallet. This allows users to create an Arweave wallet directly through an Ethereum wallet provider like [MetaMask](https://metamask.io/).

These generated private keys provide a fully functional Arweave wallet, equipped to perform all standard operations, including holding AR tokens and [Turbo Credits](../turbo/what-is-turbo.md), and uploading data to the Arweave network.

## Password

The EthAReum protocol incorporates a user-generated password in the process of deriving an Arweave wallet from an Ethereum wallet. This password provides an extra layer of security by contributing additional entropy to the wallet's derivation. It also serves as a critical verification step for wallet access.

For instance, when creating a new account with ArDrive, users are required to set a password for their wallet. This password is then used for subsequent logins and for encrypting private uploads. The password established during the wallet derivation process on ArDrive will be the same password used for future logins.

**NOTE**: The password used during the derivation of private keys is permanent and ***CAN NOT*** be changed or recovered by an administrator. It is crucial to keep this password secure.

## Public Address

The Public address of the generated Arweave wallet is derived from its public key. The public address of the generated wallet will be different from the public address of the Ethereum wallet used to generate it. 

The exact steps needed to obtain the public address of the generated wallet will differ depending on the user interface of the dApp you use for interacting with the protocol. With ArDrive, the information can be viewed at any time you are logged in to the app by clicking on the user profile icon at the top right of the screen.

## Keyfile and Seed Phrase

The primary method used in the Arweave ecosystem for accessing or importing a wallet is through the use of a keyfile, rather than a seed phrase like is commonplace in Ethereum wallet providers. Seed phrases are supported though, so you will be able to obtain a seed phrase for your generated Arweave wallet and use it to import the wallet into other dApps or wallet providers in the Arweave ecosystem. Just be aware that not every dApp in the ecosystem has an interface that can facilitate this.

A keyfile is a json file that contains a Json Web Key (JWK) which act as the private keys for a wallet. Always be sure to treat your keyfile with the same care as you would the private keys for an Ethereum wallet. Find out more about keyfiles from the [Arweave Cookbook](https://cookbook.arweave.dev/concepts/keyfiles-and-wallets.html).

Similar to the public address of your generated wallet, the method used to access your new keyfile or seed phrase will differ based on the dApp you used to generate your wallet. With ArDrive, both are available for download at any time you are logged in to the app by clicking on the user profile icon at the top right of the screen.

## Security

EthAReum generates the private keys of an Arweave wallet using a signature from your Ethereum wallet, ensuring that control only extends in one direction. The EthAReum protocol does not access or control the Ethereum wallet used for generation, thereby safeguarding your Ethereum assets.

However, it's important to be vigilant as some malicious dApps or websites may disguise a high-risk authorization transaction as a simple signature request. Always ensure that you only provide signatures to reputable and trusted dApps like [ArDrive](https://app.ardrive.io/).
