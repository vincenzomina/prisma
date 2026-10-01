# PRISMA

**Verifiable awards. Programmable rewards.**

## Problem

Recognition, proof and rewards are often fragmented across certificates, emails, spreadsheets and payment systems. Months later, nobody can easily prove who won what — or whether the prize was ever delivered.

## Solution

PRISMA is infrastructure for organizations to issue structured recognition, create verifiable proof of achievement and optionally distribute the associated reward.

```text
Recognition  →  Verification  →  Reward  →  Portable Proof
```

Built for hackathons, corporate innovation programs, universities, accelerators, research awards, developer programs, communities and sponsor challenges.

## Core MVP flow

1. Create Award
2. Connect organizer wallet
3. Issue Award on Solana
4. Verify attestation
5. Send optional Devnet reward
6. Confirm settlement
7. View public Award

## Technical architecture

| Layer | Implementation |
| --- | --- |
| Frontend | TanStack Start (React 19), Vite, Tailwind CSS v4 |
| Solana wallet | `@solana/kit` + `@solana/kit-plugin-wallet` (Wallet Standard: Phantom, Solflare, Backpack…) |
| Verification | Solana Attestation Service via `sas-lib` — one credential + schema per organizer wallet |
| Settlement | System transfer + SPL Memo (`PRISMA:<awardId>`) in one transaction (`@solana-program/system`, `@solana-program/memo`) |
| Proof | Solana Explorer links (Devnet) for attestations and transactions |
| Metadata | Local browser persistence (localStorage) |

"Verified on Solana" is always derived by re-reading the attestation from the network and checking every field against the Award. A payment is marked "Paid" only after the transaction is confirmed and read back (amount, recipient and memo).

## Security model

- Solana **Devnet only**
- No private keys stored
- No seed phrases requested or stored
- Every transaction is signed by the user in their own wallet
- No fake blockchain verification — success states come only from confirmed on-chain data

## Running locally

```sh
npm i
npm run dev
```

No environment variables are required. Use a Devnet wallet funded from [faucet.solana.com](https://faucet.solana.com).

## MVP limitations

Award presentation metadata is currently stored locally in the browser, so a newly created Award URL opens only on the device that created it. The production architecture would add a lightweight off-chain persistence layer to make Award URLs universally available across devices. That layer would store presentation metadata only — Solana would remain the source of truth for attestation verification, issuer proof and on-chain settlement.

Sample Awards in the app are marked **Demo**; they are illustrative and are never shown as issued or paid.
