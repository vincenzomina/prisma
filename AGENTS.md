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
