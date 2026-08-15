# Blog Ideas

Running backlog of post ideas. Not built by `npm run build` — this lives outside `posts/`.

---

## Your stale docs are now a production incident

**Status:** drafted — `posts/stale-docs-production-incident.md` (awaiting approval to publish)
**Tags:** Engineering, AI, Documentation

**Premise**
Outdated internal documentation used to be a mild annoyance — a human would read it, smell that something was off, ask in Slack, and route around it. That instinct was the safety net. Agents don't have it. They read the wiki with total confidence and act on it. A stale runbook is no longer a bad page; it's bad input to an automated system that will happily execute it.

**The angle**
The cost of a wrong doc has changed shape. Before: one confused engineer, ten minutes lost. Now: an agent builds a plan on a deprecated API, writes code against a service that was decommissioned two quarters ago, and hands a confident-looking PR to a reviewer who trusts it because it looks right. The blast radius is the whole team's throughput, and the failure is silent — nothing errors, it just quietly goes wrong.

**Beats to hit**
- Humans have a built-in staleness detector ("this screenshot is from the old UI"). Agents don't. They can't tell 2019 from last Tuesday unless you tell them.
- The asymmetry: writing "⚠️ This doc is outdated, see X" takes 30 seconds. Not writing it costs hours of agent-driven wrong work, downstream.
- Deleting a doc is a legitimate, often superior act of maintenance. An empty shelf beats a shelf of lies.
- Metadata is now load-bearing: last-verified date, owner, "this is authoritative for X / not for Y". Write docs to be read by something that takes them literally.
- Docs have quietly become part of the runtime. If you'd never ship code without CI, why do you ship prose with no verification at all?
- The perverse incentive today: there is no consequence for leaving a doc rotting. Nobody gets paged. Propose one — treat doc ownership like on-call, or add a staleness check to CI.

**Possible close**
We spent a decade learning that untested code is a liability. Docs got a pass because only humans read them, and humans compensate. That pass has expired.

**Open questions / things to sharpen**
- Do I have a concrete story of an agent confidently following a stale doc? A real one lands harder than the argument.
- Is the fix process (owners, review cadence) or tooling (CI staleness checks, agent-readable metadata)? Probably both — pick a side to argue.
