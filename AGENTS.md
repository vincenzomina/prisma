<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Award domain logic lives in `src/lib/awards/` (types, logic, demo, store); UI components only consume it — keeps business logic testable and separate from UI.
- Blockchain status fields (verificationStatus, paymentStatus, signatures) may only be set from confirmed Solana results — never from UI state — because the product must never fake on-chain verification.
- Phase 1 persistence is localStorage via `useSyncExternalStore` (server snapshot = demo data) — no database until the user explicitly approves one.
- Styles come from semantic classes/tokens in `src/styles.css` (`.btn-*`, `.surface`, `.chip-*`, `.field-input`) — keeps the design system in one place.
- Solana wallet logic lives in `src/lib/solana/` (config, address, wallet) using `@solana/kit` + `@solana/kit-plugin-wallet` (Wallet Standard); UI only calls `useWallet()` — official current tooling, keeps wallet code out of components.
- The Solana client is created lazily in the browser, never at module scope — the worker runtime forbids global-scope side effects and wallets are browser-only.
- Award attestations use the Solana Attestation Service via `sas-lib` in `src/lib/solana/attestations/`; "Verified" is always derived by re-reading and checking the on-chain attestation (`verifyAwardAttestation`), never from the stored `verificationStatus` — stored fields are only a cache/pointer.
- Each organizer wallet is its own SAS credential authority (credential `PRISMA`, schema `PRISMA_AWARD` v1, created on first issue); attestation nonce = sha256("PRISMA:"+awardId) so anyone can recompute the address — no server keys needed.
- Reward settlement lives in `src/lib/solana/payments/` (System transfer + SPL Memo `PRISMA:<awardId>` in one tx); `paymentStatus: "paid"` is written only after confirmation and a read-back check of amount, recipient and memo — never from UI state.
- `vite.config.ts` resolves `@solana/kit-plugin-*` to their browser builds — those packages publish no worker build, and without this the production build fails.
