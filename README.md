# Switchyard

Switchyard is an interactive, low-poly technical trainer for learning how a multi-tenant telecom/contact-center SaaS works. It follows one support call from a public phone number through carrier interconnection, SIP signaling, RTP media, FreeSWITCH, tenant routing, IVR, queueing, a browser agent, recording, product data, compliance, and operations.

The central teaching rule is that four layers remain separate:

1. carrier, numbering, and PSTN interconnection
2. SIP signaling and SDP negotiation
3. RTP/SRTP/WebRTC media
4. tenant configuration, policy, events, and product data

## Run locally

```bash
npm install
npm run dev
```

Vite serves the app at `http://127.0.0.1:41739`.

## Verify

```bash
npm test
npm run build
```

## Trainer controls

- Select any building or numbered label to open its lesson.
- Pause/resume the animated flow, advance one step, or change speed.
- Switch among an inbound support call, a no-audio investigation, and a launch-readiness path.
- Toggle follow mode and station labels on larger screens.
- Use the Accuracy & sources panel to inspect scope, corrected misconceptions, and primary references.
- Press Space to pause/resume and the arrow keys to move between lessons.

## Knowledge and review

- [Foundational knowledge base](docs/knowledge-base.md)
- [Accuracy review](docs/accuracy-review.md)

The app's curriculum, station sequence, map coordinates, route definitions, and source registry have one source of truth: `src/curriculum.js`.

## Scope

The trainer is a deterministic educational model of an inbound, US-oriented contact-center architecture. It is not a carrier, a functioning media switch, legal advice, or a production deployment blueprint. Regulatory requirements change and depend on jurisdiction and use case.
