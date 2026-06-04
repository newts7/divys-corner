---
title: Economies of Token
date: 2026-06-04
excerpt: Why your $200 personal Claude plan feels faster than the enterprise seat your company pays for.
tags:
  - AI
  - Economics
---

### Why your $200 personal Claude plan feels faster than the enterprise seat your company pays for

*Last updated: June 2026. Prices and limits move fast in this market — treat the specifics as a snapshot, the mechanics as durable.*

---

There is a strange experience that almost every engineer at a large company has had. At home, on a personal Claude Max or ChatGPT Pro subscription, the model feels limitless — you hammer it all day, run long coding sessions, and rarely hit a wall. Then you log into the same model through your employer's enterprise account and it feels *tighter*. You hit a spend cap. An admin warns you to ease off. The "unlimited" product your company negotiated somehow gives you less room than the $200 you spend on yourself.

This isn't a bug, and it isn't your IT department being stingy. It's the economics of how AI labs price tokens — and the consumer tier and the enterprise tier are built on opposite business models. Understanding the difference is worth real money if you're the one signing the contract.

## The two pricing philosophies

Every major lab now runs two fundamentally different products that happen to share a model.

**The consumer plan is a flat-rate, subsidized bucket.** You pay a fixed monthly fee and get a generous *included* allowance of usage. The lab eats the marginal compute cost. For the heaviest users, that cost almost certainly exceeds what they pay — a power user on a $200 plan can burn far more than $200 of raw inference in a month. The labs accept this because consumer subscriptions are a land-grab: mindshare, habit, training data, and word-of-mouth are worth more right now than per-user margin.

**The enterprise plan is a metered utility with a platform fee on top.** You pay a per-seat fee for *access* — security, SSO, admin controls, compliance, data residency, longer context — and then you pay for usage separately, at standard API rates, token by token. Nothing is subsidized. Every token is a line item. The lab makes a clean margin and your finance team gets a predictable, auditable bill.

That single difference — *included-and-subsidized* versus *metered-and-passed-through* — explains almost everything about why personal feels roomier than enterprise.

## Anthropic, concretely

Here is how Claude's tiers actually stack up as of mid-2026.

| Plan | Price | Usage model | Per-session capacity¹ | Notable |
|---|---|---|---|---|
| Pro | $20/mo | Flat, included bucket | 1× (baseline) | 200K context |
| Max 5× | $100/mo | Flat, included bucket | 5× Pro | Priority access to new models |
| Max 20× | $200/mo | Flat, included bucket | 20× Pro | Highest included allowance |
| Team — Standard | $25/mo ($20 annual), per seat | Flat, included bucket | 1.25× Pro | No Claude Code; weekly limit |
| Team — Premium | $125/mo ($100 annual), per seat | Flat, included bucket | 6.25× Pro | Adds Claude Code; weekly limits |
| Enterprise | Custom seat fee (billed annually) **+ metered usage at API rates** | Seat fee buys access; usage billed separately | No fixed per-seat allowance | 500K context (1M in Claude Code with Sonnet 4.6); pooled credits |

¹ Anthropic publishes these as multiples of the Pro plan's per-session allowance rather than as raw token counts.

A few things jump out.

**The personal ceiling is enormous and it's yours alone.** A Max 20× subscription gives a single human 20× the Pro session allowance, dedicated entirely to them, for a flat $200. Nothing depletes it but you. That is, by design, more headroom than most individuals can actually consume — which is exactly why it "never runs out."

**Usage resets on rolling windows, not calendar months.** All Claude plans run on a five-hour rolling session window. Max and Team Premium add two *weekly* caps on top — one across all models, one specific to Sonnet — that reset seven days after a session starts. So even when you do hit a wall, the wait is bounded.

**Enterprise seats come with no included usage at all.** Read that again, because it's the crux. On Anthropic's current Enterprise plan, the per-seat fee buys platform access — web, desktop, mobile, Claude Code, Cowork, longer context, admin governance. It does *not* include a single token of usage. Every token your team consumes is billed separately at standard API rates.

## Why the enterprise seat feels tighter

If enterprise usage is metered rather than capped, why does it *feel* more constrained than a personal plan that has a hard cap? Four reasons, and none of them are about raw model speed.

**1. Your budget is pooled, not personal.** On Anthropic's self-serve Enterprise plan, usage is bought as credits that are *shared across the entire organization*. One colleague running a massive overnight job draws down the same balance you're using for a quick refactor. When the pool hits zero, usage stops for everyone until an owner buys more. Your effective ceiling isn't a generous personal bucket — it's your slice of a shared pool that finance sized for aggregate spend.

**2. Admins set spend caps — on you specifically.** Enterprise owners can set ceilings at both the organization and the individual level, and the lower of the two wins. The "limit" you bump into is often a number your finance team chose, not a technical throttle. They're optimizing the company's bill; you're feeling the result.

**3. Governance adds friction.** Logging, compliance routing, data controls, and admin policy all sit between you and the model on an enterprise deployment. None of it makes the GPU slower, but it adds steps, approvals, and the occasional "this is being monitored" speed bump that a personal account simply doesn't have.

**4. Consumer tiers get the priority halo.** Compute has been genuinely scarce through 2025–2026, and labs route their best availability and earliest model access to the high-visibility consumer tiers. Anthropic explicitly markets Max as getting "priority access" to new models and features. When Anthropic announced its SpaceX/Colossus compute deal in May 2026, it doubled Claude Code's five-hour limits and removed peak-hour throttling *for Pro and Max* — the consumer tiers got the headline relief first.

Put together: the personal plan is a subsidized, dedicated, friction-free bucket the lab *wants* you to overuse. The enterprise seat is a metered utility wrapped in governance, where your personal ceiling is whatever your company budgeted. The model is identical. The economics around it are opposite.

## OpenAI is running the same playbook

If you're evaluating both vendors, it's worth knowing the pattern is industry-wide, not Anthropic-specific.

- **ChatGPT Plus ($20/mo)** is the subsidized consumer bucket: roughly 160 GPT-5.5 messages every three hours plus a few thousand "thinking" messages a week, on rolling windows.
- **ChatGPT Pro** was restructured in April 2026 into two flat tiers — $100 and $200 — running identical models and differing only in usage volume, with the $200 tier landing around 5× Plus plus access to the top-end Pro model. Same idea as Max 5× vs Max 20×.
- **ChatGPT Business (~$25–30/user)** offers near-unlimited messaging under a fair-use policy — but as of April 2026, OpenAI split Codex onto **usage-based seats**, so a Business workspace now mixes fixed-cost standard seats with metered Codex seats.
- **ChatGPT Enterprise** is "virtually unlimited" on paper, but it's negotiated, and the heavy agentic surfaces are increasingly metered.

The Codex shift is the tell. In April 2026 OpenAI moved Codex usage to **API-token-based credit pricing** across Plus, Pro, Business, and Enterprise — credits per million input, cached, and output tokens. Plus and Pro users who exhaust their allowance buy more credits; Business and Enterprise workspaces buy pooled workspace credits. That's the same migration Anthropic made: the moment usage gets serious and agentic, the flat "unlimited" bucket quietly becomes a metered one. The subsidy is a consumer-acquisition tool, and labs pull it back exactly where usage is highest and most commercial.

## What this means if you're the buyer

The instinct is to read "enterprise" as "the unlimited tier." It usually isn't — it's the *governed, metered* tier, and that's a feature, not a downgrade, for an organization that needs audit trails, security, and predictable spend. But it has real consequences for how you plan.

**Budget for usage as a variable cost, separate from seats.** The seat fee is the small, predictable part. On a metered enterprise plan, actual token consumption is the number that moves — and it can dwarf the seat line. Model your heaviest 10% of users, because on a pooled plan they set the pace for everyone.

**Right-size the model, not just the plan.** Because enterprise usage is metered at API rates, the cheapest lever you have is steering routine work to smaller, cheaper models and reserving the frontier model for tasks that need it. On a flat consumer plan there's no incentive to do this; on a metered plan it's the whole game.

**Know that your power users may legitimately be cheaper on a personal-tier plan** — and that this creates a shadow-IT temptation. If an engineer's workload genuinely fits inside a $200 Max bucket, the company is paying *more* to meter them through enterprise. The enterprise premium buys governance, security, and data guarantees; make sure you're actually using those, or you're paying for compliance you don't need.

**Negotiate the usage rate and the pooling model, not just the seat price.** The seat fee is the headline; the per-token rate, the credit structure (prepaid vs. monthly-arrears), and the spend-control granularity are where the real money lives over a year.

## The bottom line

Your personal plan feels faster because it's a loss-leader designed to make you fall in love with the product, sized so you can't easily exhaust it, dedicated entirely to you, and stripped of every ounce of governance friction. Your enterprise seat feels tighter because it's an honest utility meter wrapped in the controls a company actually needs — and your personal ceiling inside it is whatever your finance team decided to allocate from a shared pool.

Same model. Same weights. Opposite economics. That's the economy of tokens: the bucket the lab gives *you* is a marketing expense, and the meter it gives *your company* is the business.
