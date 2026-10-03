# `@fmcg/ai` — vendor-abstracted AI layer (Phase 7, ADR-0009)

Tasks: `parseSearchQuery`, `draftListing`, `summariseThread`, `reorderSuggest`.
Vendors: `stub` (deterministic, offline) and `ollama` (local LLM). Swap via env —
business logic never imports a vendor directly.

## Run free locally (Ollama)

```powershell
ollama pull llama3.1
ollama run llama3.1
pnpm --filter ./packages/ai eval
```

## Swap to Groq / Gemini free tier

Set env only — no code change:

```powershell
$env:AI_VENDOR="groq"            # or "gemini"
$env:GROQ_API_KEY="gsk_..."      # free tier key, .env only — never commit
$env:GEMINI_API_KEY="AIza..."
```

The task functions keep the same `TaskOutput<T>` shape; only the adapter's
`complete()` implementation changes. Add `src/vendors/groq.ts` /
`src/vendors/gemini.ts` implementing `VendorAdapter` when keys exist.

## Guardrails (PRD §10.3)

- **Human-confirm:** every `TaskOutput` has `needsConfirm: true`. Search shows an
  editable interpretation string; listings stay `draft: true` until the seller
  publishes; summaries need buyer confirm; reorders are recommendations only.
- **Audit logging:** log `{ task, prompt, output, model, confidence, actor }` to
  `audit_events` on every AI-assisted action (see `docs/QA_PLAN.md`).
- **PII minimization:** strip phone numbers, addresses, OTPs from prompts before
  sending to any vendor; stub adapter never leaves the process.
- **Evals:** `src/eval.ts` runs 10 pidgin + formal-English fixtures
  (Indomie/Milo/sugar/water). Gate: 10/10 before demoing vendor swaps.
