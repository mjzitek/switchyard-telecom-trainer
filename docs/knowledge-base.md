# Telecom SaaS foundational knowledge

## The system in one sentence

A public caller reaches a customer-owned phone number through carrier networks; the carrier hands the call to your SIP edge; your real-time platform negotiates and moves media while a separate tenant control plane decides what should happen, records normalized events, and powers the customer product.

```text
Caller
  -> originating and terminating carrier networks
  -> customer DID route
  -> SIP trunk
  -> session border controller
  -> FreeSWITCH/media node
  -> tenant call-flow policy
  -> IVR and queue
  -> agent endpoint

Real-time events
  -> idempotent normalization
  -> interactions and call legs
  -> reporting, usage, audit, and billing
```

## Four boundaries to keep separate

### 1. Carrier, numbering, and PSTN

An E.164 telephone number is a globally formatted routing address. In the North American Numbering Plan, a DID can be assigned or ported to a customer and routed by a carrier into your platform. It is not a physical line, SIP login, or capacity allocation. Number inventory, tenant ownership, porting state, emergency address, inbound routing, outbound caller-ID authority, and concurrent-call limits must remain explicit data.

Your service normally buys origination (receiving calls) and termination (placing calls) from one or more carriers. Carrier interconnection remains a regulated service boundary even when the underlying transport is IP.

### 2. SIP signaling and SDP

SIP creates, changes, and ends sessions. A typical successful call setup is `INVITE`, provisional responses such as `100 Trying` and `180 Ringing`, a `200 OK`, and `ACK`; `BYE` ends a dialog. Carrier trunks are often authenticated by source IP rather than endpoint-style `REGISTER`.

SDP travels within signaling messages and offers or answers media parameters: address, port, direction, codecs, and related attributes. Codec negotiation selects a compatible format. Transcoding is a separate real-time conversion step that consumes compute and can reduce quality.

An SBC marks a trust boundary. It can enforce peer authentication or ACLs, rate limits, topology hiding, normalization, NAT behavior, media anchoring, and fraud policy. SIP over TLS protects a signaling hop. It does not encrypt ordinary RTP.

### 3. RTP, SRTP, and WebRTC media

RTP carries time-sensitive audio packets independently of SIP. RTCP reports reception and timing information such as loss and jitter. NAT mistakes, incorrect SDP addresses, blocked UDP, high latency, packet loss, and jitter can produce one-way or degraded audio while the SIP dialog remains healthy.

SRTP protects RTP content. Browser agents generally use WebRTC: application signaling over HTTPS, microphone permission, ICE path discovery, and DTLS-SRTP media. STUN helps discover usable network candidates. TURN relays traffic when direct connectivity fails. A TURN relay and an SBC have different jobs.

### 4. Tenant control plane and product data

FreeSWITCH is the real-time communications engine, not the entire SaaS. It owns channels, call legs, playback, bridging, conferencing, recording, and other live session mechanics. Your control plane owns customers, numbers, users, roles, prompts, queue configuration, agent policy, routing flows, reporting, usage, billing, and integrations.

Resolve tenant identity from a trusted ingress mapping such as the carrier account or trunk plus DID. Do not trust a caller-supplied SIP header. Load one versioned routing policy and carry the tenant ID and interaction ID through every command, event, recording, and database path.

## The product flow

An IVR answers, plays a short prompt, collects intent, and handles input, timeouts, retries, business hours, and escape routes. DTMF may be transported as RFC 4733 RTP telephone events, SIP INFO, or in-band audio.

A contact-center queue is more than FIFO. It includes waiting callers, agent readiness, skills or tiers, routing strategy, reservation and offer state, maximum wait, overflow, callback or voicemail, abandonment, and wrap-up. When an agent accepts, FreeSWITCH bridges distinct caller and agent legs. Transfers and conferences create more legs.

Recording requires deliberate controls for consent, start/stop/pause, channel layout, encryption, retention, deletion, and audited access. Keep payment-card data out of recordings, transcripts, and logs. Regulatory scope depends on market, customer, data, and use case.

## Events, records, and money

A real-time node emits lifecycle events and CDRs. FreeSWITCH can produce one CDR per call leg, so a CDR is not the same thing as a customer interaction. Store immutable raw events, normalize them idempotently, and reconstruct an interaction graph containing attempts, transfers, and conferences. Compute reports and billable usage from explicit, versioned rules rather than from media-node local state.

## Safety and launch gates

For a US launch, emergency calling needs dedicated routing, location, callback, direct dialing, and notification design. STIR/SHAKEN carries provider-signed caller-ID attestation and verification information; it does not prove the identity of the human speaking. Outbound consent and do-not-call obligations, recording consent, PCI scope, HIPAA duties, and emergency rules are distinct bodies of requirements—not one “compliant” checkbox.

Define the exact markets and use cases the product supports. Gate each feature on carrier capability, documented product behavior, current regulatory research, and specialist review.

## Operating and scaling

Measure SIP setup results, post-dial delay, answer rate, queue service level, abandonment, concurrent sessions, both RTP directions, packet loss, jitter, RTT, and carrier/node/tenant breakdowns. HTTP health and a running process cannot prove usable telephony. Scheduled synthetic calls should validate real signaling and recognizable two-way audio.

New calls can be distributed across media nodes. Active calls hold timing and channel state on their assigned node, so they remain pinned until hangup. A node crash generally drops those calls. Capacity admission, drain-before-deploy, carrier redundancy, regional routing, and rehearsed failure modes matter more than stateless web autoscaling metaphors.

## Build order

1. Establish the tenant and number inventory model.
2. Prove a single inbound carrier route with captured SIP and two-way RTP.
3. Put a narrow SBC policy in front of one controlled FreeSWITCH profile.
4. Compile one versioned tenant flow into IVR and queue actions.
5. Connect a browser agent and prove direct and TURN-relayed WebRTC paths.
6. Normalize raw lifecycle events into interactions, legs, and usage.
7. Add recording only with explicit policy and protected storage.
8. Complete market-specific launch gates.
9. Add end-to-end synthetic calls, capacity admission, and failure drills.
