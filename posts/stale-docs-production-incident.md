---
title: "Your stale docs are now a production incident"
date: 2026-08-15
excerpt: Humans smell a bad doc and route around it. Agents read it and ship it.
tags:
  - Engineering
  - AI
  - Tools
---

![A stale doc reaching a human, who catches it, and an agent, who executes it](/stale-docs-production-incident.svg)

Every codebase has a wiki page nobody has opened since 2023. A runbook for a service that got decommissioned. A setup guide with a screenshot of a UI that doesn't exist anymore.

For years that was fine. A human would open it, feel something was off, and ask in Slack. That instinct — *this smells old* — was the safety net. We never wrote it down because we never had to.

Agents don't have it.

An agent reads the wiki the way it reads the code: literally, confidently, with no sense of time. It can't tell 2019 from last Tuesday. So it plans against a deprecated API, writes code for a service that died two quarters ago, and hands you a PR that looks right. Nothing errors. It just quietly goes wrong.

A wrong doc used to cost one engineer ten minutes. Now it costs the team a day of work built carefully on a lie.

We solved this once already, for code. Untested code is a liability — we agreed on that a decade ago and built CI to enforce it. Prose got a pass, because only humans read it and humans compensate. That pass has expired. Docs are runtime input now, and they deserve the same pipeline.

**Date what you write.** A last-verified stamp costs thirty seconds and tells the reader — human or not — how much of this to trust.

**Scope the authority.** "Correct for deployments. Not for local setup." Agents take you literally. Use that.

**Fail the build on rot.** A doc untouched for six months, describing a service that ships weekly, is a failing test. Treat it like one.

And delete more. An empty shelf beats a shelf of lies.

Your docs have a reader now. It believes every word.
