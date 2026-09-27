# ADR-0009 — AI vendor abstraction, human-confirm by default

Status: accepted.

Context: NL search, listing copilot and reorder assistants must work on free tiers
today (Ollama local, Groq/Gemini free) and paid APIs later — without ever moving
money or stock on their own.

Decision: `packages/ai` exposes task functions (`parseSearchQuery`,
`draftListing`, `summariseThread`); vendor adapters sit underneath. Every
high-impact output (price, order, refund, settlement, restriction) requires
explicit human confirmation; prompts/outputs are audit-logged.

Consequences: free local dev, swappable vendors, AI errors stay advisory per
PRD §9.3/§10.3.
