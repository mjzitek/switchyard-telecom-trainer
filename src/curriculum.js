export const LAYERS = {
  carrier: { label: "Carrier & PSTN", color: "#d66843", short: "PSTN" },
  signal: { label: "SIP signaling", color: "#e0a526", short: "SIP" },
  media: { label: "Media path", color: "#1d8f86", short: "RTP" },
  control: { label: "SaaS control plane", color: "#5b67a5", short: "APP" },
  safety: { label: "Safety & operations", color: "#b24c68", short: "OPS" },
};

export const SOURCES = [
  { id: "rfc3261", title: "SIP: Session Initiation Protocol", org: "IETF", url: "https://datatracker.ietf.org/doc/html/rfc3261" },
  { id: "rfc3264", title: "SDP Offer/Answer Model", org: "IETF", url: "https://datatracker.ietf.org/doc/html/rfc3264" },
  { id: "rfc3550", title: "RTP and RTCP", org: "IETF", url: "https://datatracker.ietf.org/doc/html/rfc3550" },
  { id: "rfc3711", title: "Secure RTP", org: "IETF", url: "https://datatracker.ietf.org/doc/html/rfc3711" },
  { id: "rfc4733", title: "RTP Telephone Events", org: "IETF", url: "https://datatracker.ietf.org/doc/html/rfc4733" },
  { id: "rfc8445", title: "Interactive Connectivity Establishment", org: "IETF", url: "https://datatracker.ietf.org/doc/html/rfc8445" },
  { id: "rfc8489", title: "Session Traversal Utilities for NAT", org: "IETF", url: "https://datatracker.ietf.org/doc/html/rfc8489" },
  { id: "rfc8656", title: "Traversal Using Relays around NAT", org: "IETF", url: "https://datatracker.ietf.org/doc/html/rfc8656" },
  { id: "webrtc", title: "WebRTC Recommendation", org: "W3C", url: "https://www.w3.org/TR/webrtc/" },
  { id: "fs-core", title: "FreeSWITCH Foundations", org: "SignalWire", url: "https://developer.signalwire.com/freeswitch/foundations/introduction/" },
  { id: "fs-queues", title: "FreeSWITCH Call Queues", org: "SignalWire", url: "https://developer.signalwire.com/freeswitch/applications/call-queues/" },
  { id: "fs-cdr", title: "FreeSWITCH CDRs", org: "SignalWire", url: "https://developer.signalwire.com/freeswitch/integration/cdr/" },
  { id: "nanpa", title: "North American Numbering Plan", org: "NANPA", url: "https://www.nanpa.com/about" },
  { id: "fcc911", title: "Emergency Calling Rules", org: "eCFR", url: "https://www.ecfr.gov/current/title-47/chapter-I/subchapter-A/part-9" },
  { id: "fccstir", title: "STIR/SHAKEN Framework", org: "FCC", url: "https://docs.fcc.gov/public/attachments/FCC-20-42A1.pdf" },
  { id: "ftc", title: "Telemarketing Sales Rule", org: "FTC", url: "https://www.ftc.gov/business-guidance/resources/complying-telemarketing-sales-rule" },
  { id: "pci", title: "Protecting Telephone-Based Payment Card Data", org: "PCI SSC", url: "https://www.pcisecuritystandards.org/documents/Protecting_Telephone_Based_Payment_Card_Data_v3-0_nov_2018.pdf" },
  { id: "hhs", title: "HIPAA Cloud Computing Guidance", org: "HHS", url: "https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html" },
];

export const STATIONS = [
  {
    id: "number-yard", number: 1, name: "Number Yard", kicker: "Give the customer an address", layer: "carrier",
    x: -8.2, z: 4.9, kind: "tower", metric: "Inventory state", failure: "Number is not mapped to a tenant",
    summary: "A DID is a routable telephone number—not a physical line, login, or promise of call capacity.",
    lesson: "Your carrier assigns or ports an E.164 number and routes calls for it toward your service. Keep number inventory, tenant ownership, routing state, and concurrent-call capacity as separate records.",
    build: "Create a tenant, reserve a number, verify its regulatory address where required, and make one authoritative tenant + DID mapping.",
    signal: "No SIP dialog exists yet.", media: "No media exists yet.", state: "tenant_17 owns +1 520 555 0142",
    sources: ["nanpa"]
  },
  {
    id: "pstn", number: 2, name: "PSTN Interchange", kicker: "The caller enters the phone network", layer: "carrier",
    x: -5.6, z: 4.9, kind: "exchange", metric: "Route completion", failure: "Unreachable or misrouted number",
    summary: "The PSTN finds the provider responsible for the dialed number; it is not simply “the Internet for phones.”",
    lesson: "A caller's access network and upstream carriers perform numbering and interconnection work before your software sees a call. Much transport is IP, but carriers still own regulated numbering and routing boundaries.",
    build: "Choose origination and termination carriers with coverage, emergency services, porting support, and redundant interconnects.",
    signal: "Carrier signaling is translated toward your SIP interconnect.", media: "Audio has not reached your edge.", state: "dialed_number = +15205550142",
    sources: ["nanpa"]
  },
  {
    id: "carrier", number: 3, name: "Carrier Dock", kicker: "Interconnect the public network", layer: "carrier",
    x: -2.8, z: 4.9, kind: "warehouse", metric: "PDD / carrier ASR", failure: "Carrier returns 503 or no route",
    summary: "The carrier delivers inbound calls and accepts outbound calls across a provisioned SIP trunk.",
    lesson: "DID routing, outbound termination, porting, caller-ID authority, and trunk capacity are related but distinct carrier products. Production designs use explicit failover routes.",
    build: "Provision trunk IPs, authentication, number routes, call limits, codecs, and a secondary carrier path.",
    signal: "An inbound INVITE approaches your edge.", media: "Carrier offers media IP, port, and codecs in SDP.", state: "ingress_trunk = carrier_us_west_1",
    sources: ["rfc3261", "rfc3264"]
  },
  {
    id: "sip-gate", number: 4, name: "SIP Trunk Gate", kicker: "Set up the call dialog", layer: "signal",
    x: 0.2, z: 4.9, kind: "gate", metric: "Setup success / response code", failure: "4xx, 5xx, or timeout",
    summary: "SIP is the signaling conversation that creates, changes, and ends a call—not the voice itself.",
    lesson: "A common successful exchange is INVITE → 100 Trying → 180 Ringing → 200 OK → ACK, then BYE to hang up. Carrier trunks are often IP-authenticated and may not REGISTER like a desk phone.",
    build: "Capture one call with a SIP ladder and learn which system owns every response.",
    signal: "INVITE → 100 → 180 → 200 → ACK … BYE", media: "SDP is carried inside SIP messages.", state: "dialog_id + call legs are created",
    sources: ["rfc3261"]
  },
  {
    id: "sbc", number: 5, name: "SBC Checkpoint", kicker: "Defend and normalize the edge", layer: "signal",
    x: 3.2, z: 4.9, kind: "checkpoint", metric: "Rejected / rate-limited attempts", failure: "Fraud, malformed SIP, or topology leak",
    summary: "An SBC enforces trust at the SIP/media boundary; it is more than a firewall and not the PBX itself.",
    lesson: "The edge can apply ACLs or authentication, rate limits, SIP normalization, topology hiding, NAT handling, media anchoring, and fraud controls. TLS protects a signaling hop; it does not encrypt ordinary RTP.",
    build: "Allow only expected peers, normalize a narrow SIP profile, cap call rates, and log every rejection reason.",
    signal: "Validate peer, headers, rate, and dialog behavior.", media: "Optionally anchor media; require SRTP where supported.", state: "trusted_ingress + normalized tenant key",
    sources: ["rfc3261", "rfc3711"]
  },
  {
    id: "sdp", number: 6, name: "SDP Lab", kicker: "Agree where audio should go", layer: "signal",
    x: 6.1, z: 4.9, kind: "lab", metric: "Negotiated codec", failure: "No common codec or bad IP/port",
    summary: "SDP offer/answer negotiates media addresses, direction, and codecs; negotiation is not transcoding.",
    lesson: "Each side advertises media capabilities. A compatible codec can pass without conversion; transcoding is needed only when policy or endpoints require it, consuming CPU and potentially quality.",
    build: "Start with a small codec policy, inspect the offer and answer, and prove both endpoints send to the negotiated addresses.",
    signal: "Offer in INVITE; answer in 200 OK.", media: "Codec + IP + port + direction are selected.", state: "codec = PCMU; direction = sendrecv",
    sources: ["rfc3264"]
  },
  {
    id: "media", number: 7, name: "Media Rail", kicker: "Move the actual audio", layer: "media",
    x: 8.4, z: 2.3, kind: "pipes", metric: "Loss / jitter / RTT / MOS estimate", failure: "One-way audio or choppy speech",
    summary: "RTP packets carry audio separately from SIP; RTCP reports timing and reception quality.",
    lesson: "Packet loss, jitter, latency, wrong NAT addresses, and blocked UDP create audible failures. RTP is not encrypted by default; SRTP adds confidentiality and integrity. MOS is an estimate, not a measured human opinion.",
    build: "Graph both media directions, negotiated endpoints, packet counts, loss, jitter, and RTT for a synthetic call.",
    signal: "SIP dialog can be healthy while audio is broken.", media: "RTP flows in both directions; RTCP reports quality.", state: "media_session is pinned to one node",
    sources: ["rfc3550", "rfc3711"]
  },
  {
    id: "freeswitch", number: 8, name: "Switchhouse", kicker: "Run the real-time call engine", layer: "media",
    x: 8.4, z: -0.7, kind: "switchhouse", metric: "Sessions / channels / CPU", failure: "Media node crashes and live calls drop",
    summary: "FreeSWITCH runs real-time call legs, media, playback, recording, and bridges; it is not the whole SaaS.",
    lesson: "Think in endpoints, channels, calls, sessions, and bridges. One customer interaction can create an A-leg and several B-legs. Keep tenant auth, billing, CRM data, analytics, and workflow in surrounding services.",
    build: "Use narrow SIP profiles, a controlled event socket, versioned call-flow input, and disposable media nodes.",
    signal: "FreeSWITCH creates and controls multiple call legs.", media: "Playback, bridge, conference, and recording happen here.", state: "interaction_id links leg UUIDs",
    sources: ["fs-core", "fs-cdr"]
  },
  {
    id: "tenant-router", number: 9, name: "Tenant Router", kicker: "Load the right customer policy", layer: "control",
    x: 5.6, z: -0.7, kind: "router", metric: "Routing decision latency", failure: "Cross-tenant lookup or stale policy",
    summary: "The SaaS resolves one authoritative tenant identity, then loads one versioned call flow.",
    lesson: "Derive tenancy from a trusted ingress mapping such as carrier account + DID. Do not trust an arbitrary SIP header. Carry the tenant ID through every policy, event, recording, and data path.",
    build: "Compile a customer's visual flow into a versioned routing policy and atomically activate it.",
    signal: "A routing request returns the next application action.", media: "Media remains on the real-time node.", state: "tenant_17 / flow_v42 / interaction_9c2",
    sources: ["fs-core"]
  },
  {
    id: "ivr", number: 10, name: "IVR Workshop", kicker: "Gather caller intent", layer: "control",
    x: 2.7, z: -0.7, kind: "workshop", metric: "Containment / invalid input rate", failure: "Dead end, timeout, or retry loop",
    summary: "An IVR plays prompts, gathers input, and always needs timeouts, retries, and escape routes.",
    lesson: "DTMF can travel as RFC 4733 telephone events, SIP INFO, or in-band audio—it is not always an audible tone. Speech recognition adds a separate service and failure surface.",
    build: "Create a short greeting, business-hours branch, two options, timeout behavior, operator escape, and fallback queue.",
    signal: "Application commands control prompt and digit collection.", media: "Prompts play; DTMF may use RTP events.", state: "intent = billing; attempts = 1",
    sources: ["rfc4733", "fs-core"]
  },
  {
    id: "queue", number: 11, name: "Queue Depot", kicker: "Match demand to available people", layer: "control",
    x: -0.2, z: -0.7, kind: "depot", metric: "Service level / abandon rate", failure: "Wait exceeds policy or no agents",
    summary: "A contact-center queue combines waiting callers, agent state, routing strategy, overflow, and abandonment policy.",
    lesson: "A simple FIFO is not full workforce routing. Production logic handles agent tiers, readiness, reservations, max wait, callbacks, voicemail, overflow, and priority without losing tenant isolation.",
    build: "Define queue goals, agent skills, overflow, max wait, callback policy, and the events needed to explain every decision.",
    signal: "The router requests an agent destination.", media: "Caller hears controlled hold media or announcements.", state: "position = 2; eligible_agents = 4",
    sources: ["fs-queues"]
  },
  {
    id: "agent", number: 12, name: "Agent Terminal", kicker: "Offer work to a human", layer: "media",
    x: -3.2, z: -0.7, kind: "terminal", metric: "Offer-to-answer / missed offers", failure: "Browser loses permission or connectivity",
    summary: "The agent lifecycle is presence → ready → reserved → offered → connected → wrap-up.",
    lesson: "A browser endpoint uses WebRTC: HTTPS application signaling, microphone permission, ICE path discovery, and DTLS-SRTP media. STUN discovers paths; TURN relays only when a direct path fails. TURN is not an SBC.",
    build: "Create a browser softphone with explicit device checks, reconnect states, and a TURN path tested behind restrictive NAT.",
    signal: "Your app signaling coordinates an offer; SIP reaches the media edge.", media: "WebRTC uses DTLS-SRTP after ICE connectivity checks.", state: "agent_8 = connected; wrap_up = false",
    sources: ["webrtc", "rfc8445", "rfc8489", "rfc8656"]
  },
  {
    id: "bridge", number: 13, name: "Bridge Junction", kicker: "Join caller and agent legs", layer: "media",
    x: -6.0, z: -0.7, kind: "junction", metric: "Answer / transfer success", failure: "Orphaned leg after transfer",
    summary: "The interaction joins separate call legs; transfers and conferences create still more legs and events.",
    lesson: "Blind transfer sends the caller onward immediately. Consultative transfer creates another leg so the agent can speak first. Hold, bridge, conference, and disposition are distinct state changes.",
    build: "Model the interaction above individual leg UUIDs so reporting survives transfers and retries.",
    signal: "New INVITEs and BYEs alter the leg graph.", media: "The media node bridges selected channels.", state: "interaction has caller + agent + consult legs",
    sources: ["fs-core", "fs-cdr"]
  },
  {
    id: "recording", number: 14, name: "Recording Vault", kicker: "Handle sensitive evidence", layer: "safety",
    x: -8.3, z: -3.2, kind: "vault", metric: "Pause / retention / access audit", failure: "Sensitive data enters a recording",
    summary: "Recording capability does not create legal permission; consent, retention, and access depend on context and jurisdiction.",
    lesson: "Choose start, stop, pause, channel layout, encryption, retention, deletion, and audited access deliberately. Keep payment data out of recordings, transcripts, and logs; HIPAA responsibility is not removed merely by encryption.",
    build: "Attach a jurisdiction-aware policy, visible agent state, payment pause flow, encryption keys, retention job, and access audit.",
    signal: "Application events control recording state.", media: "Authorized audio is written to protected storage.", state: "policy + consent + retention + audit trail",
    sources: ["pci", "hhs", "ftc"]
  },
  {
    id: "evidence", number: 15, name: "Evidence Office", kicker: "Turn events into product data", layer: "control",
    x: -5.6, z: -3.2, kind: "office", metric: "Event lag / duplicate rate", failure: "Leg CDR counted as a customer interaction",
    summary: "Normalize immutable real-time events into interactions, call legs, reports, and a usage ledger.",
    lesson: "FreeSWITCH can emit one CDR per call leg, so CDR count is not customer-call count. An idempotent event pipeline should reconstruct transfers and retries without making node-local state the product source of truth.",
    build: "Store raw events, normalize idempotently, link legs to one interaction, and calculate billable usage from explicit rules.",
    signal: "Lifecycle events arrive asynchronously.", media: "Recording metadata references protected media objects.", state: "events → legs → interaction → usage ledger",
    sources: ["fs-cdr"]
  },
  {
    id: "compliance", number: 16, name: "Launch Gate", kicker: "Prove the market-specific duties", layer: "safety",
    x: -2.8, z: -3.2, kind: "hall", metric: "Unmet launch controls", failure: "Normal route used for emergency calling",
    summary: "Emergency calling, caller identity, outbound consent, payments, and health data require separate launch gates.",
    lesson: "In the US, design dedicated 911 location, routing, callback, direct dialing, and notification behavior. STIR/SHAKEN attestation is provider-signed caller-ID information, not proof of the human caller. TCPA/TSR, PCI, HIPAA, and recording law scopes differ.",
    build: "Define supported markets and use cases; obtain specialist review and carrier capabilities before enabling each regulated path.",
    signal: "Emergency and identity metadata follow dedicated policies.", media: "Sensitive audio can change storage and routing requirements.", state: "launch gates are evidence-backed, not one checkbox",
    sources: ["fcc911", "fccstir", "ftc", "pci", "hhs"]
  },
  {
    id: "ops", number: 17, name: "Operations Tower", kicker: "Observe an actual call, end to end", layer: "safety",
    x: 0.2, z: -3.2, kind: "tower", metric: "Synthetic-call success", failure: "Green process health but broken audio",
    summary: "HTTP 200 and a running process do not prove that a caller and agent can hear each other.",
    lesson: "Measure setup success, response codes, PDD, answer rate, queue SLA, abandonment, both RTP directions, loss, jitter, RTT, and carrier/node/tenant breakdowns. Synthetic calls provide end-to-end evidence.",
    build: "Run scheduled calls through real carrier and agent paths, assert audio both ways, and retain SIP, media, and event correlation IDs.",
    signal: "Trace dialog timing and response ownership.", media: "Verify packets and recognizable audio in both directions.", state: "one correlation ID spans carrier → media → product data",
    sources: ["rfc3550", "rfc3261"]
  },
  {
    id: "scale", number: 18, name: "Scale Control", kicker: "Grow without pretending calls are stateless", layer: "safety",
    x: 3.2, z: -3.2, kind: "control", metric: "Capacity / regional failover", failure: "Overload or media-node loss",
    summary: "New calls can load-balance across nodes, but an active call remains pinned to its real-time node.",
    lesson: "Unlike stateless web traffic, live media has node-local timing and channel state. Admit calls within tested capacity, drain nodes before deploys, use regional and carrier redundancy, and expect a crashed media node to drop its live calls.",
    build: "Load-test call setup and media separately, cap admission, route new sessions away from degraded nodes, and practice region/carrier failure.",
    signal: "Route new dialogs based on health and capacity.", media: "Do not promise seamless mid-call failover without a proven architecture.", state: "active calls pinned; new calls reroutable",
    sources: ["fs-core", "rfc3550"]
  }
];

export const ROUTES = {
  inbound: {
    label: "Inbound support call",
    description: "A customer dials support, chooses Billing, waits briefly, and reaches a browser agent.",
    stations: STATIONS.map((station) => station.id),
  },
  media: {
    label: "No-audio investigation",
    description: "Follow setup into SDP and RTP, where a healthy SIP dialog can still hide one-way audio.",
    stations: ["carrier", "sip-gate", "sbc", "sdp", "media", "freeswitch", "agent", "ops"],
  },
  scale: {
    label: "Launch readiness",
    description: "Trace the product and operational controls needed before customer traffic is safe to scale.",
    stations: ["number-yard", "tenant-router", "queue", "recording", "evidence", "compliance", "ops", "scale"],
  }
};

export const MISCONCEPTIONS = [
  ["SIP carries the voice", "SIP controls the session; RTP/SRTP carries media."],
  ["A DID is a phone line", "A DID is a routing address; inventory and capacity are separate."],
  ["FreeSWITCH is the SaaS", "It is the real-time engine inside a larger tenant control plane."],
  ["One call means one CDR", "Transfers and retries create multiple legs and usually multiple CDRs."],
  ["TLS encrypts the call", "SIP TLS protects a signaling hop; media needs SRTP."],
  ["STUN relays media", "STUN discovers candidates; TURN is the relay when direct ICE paths fail."],
  ["A green server means calls work", "Only an end-to-end synthetic call can prove signaling and two-way audio."],
];
