# Accuracy review

## Review verdict

The trainer's 18-station sequence is technically sound for a conceptual, inbound contact-center SaaS if it preserves the following boundaries in both text and animation:

- carrier/numbering/PSTN
- SIP signaling and SDP negotiation
- RTP/SRTP/WebRTC media
- tenant/control-plane state

Switchyard does this with distinct station layers, differently colored flow tokens, per-station signaling/media/state readouts, and explicit lesson language.

## Claims checked and corrected

| Common shortcut | Reviewed model |
| --- | --- |
| SIP carries voice | SIP controls a session; RTP or SRTP carries media. |
| A DID is a line or channel | It is a routing address; inventory and capacity are separate. |
| FreeSWITCH is the SaaS | It is a real-time engine surrounded by tenant, policy, data, and product services. |
| One call produces one CDR | Each leg can produce a CDR; one interaction can contain many legs. |
| SIP TLS encrypts audio | It protects a signaling hop; media requires SRTP. |
| STUN relays media | STUN discovers candidates; TURN provides relay service. |
| Codec negotiation equals transcoding | Negotiation chooses a common format; transcoding converts formats. |
| DTMF is always an audible tone | It may use RTP telephone events or SIP INFO instead of in-band audio. |
| Caller ID proves identity | STIR/SHAKEN conveys provider attestation and verification, with limits. |
| Recording is legal if a notice plays | Consent, notice, retention, and access rules depend on jurisdiction and context. |
| Encryption removes PCI or HIPAA scope | Data handling and the service's role determine scope; encryption is only one safeguard. |
| 911 is an ordinary outbound route | Emergency routing, location, callback, direct dialing, and notification require dedicated design. |
| Healthy processes mean healthy calls | End-to-end signaling and two-way media require synthetic evidence. |
| Media nodes scale like web servers | New calls can be balanced; active calls are stateful and remain pinned. |

## Source policy

The curriculum is grounded in primary or official sources: IETF RFCs for protocols, the W3C WebRTC recommendation, SignalWire's maintained FreeSWITCH documentation, NANPA numbering material, US regulations and FCC guidance, FTC business guidance, PCI SSC guidance, and HHS HIPAA guidance. Links are registered once in `src/curriculum.js` and exposed inside the app.

## Scope and limitations

- The simulated call is deterministic and does not pretend to connect to a carrier or media switch.
- The regulatory presentation is US-oriented and educational, not legal advice.
- Carrier behavior, regional regulation, customer contracts, and product use cases change launch requirements.
- The model focuses on voice. SMS/MMS, email, social messaging, workforce management, CRM implementation, and AI automation are outside the current route.
- MOS is described as an estimate rather than a directly observed human score.

## Primary review set

- [SIP RFC 3261](https://datatracker.ietf.org/doc/html/rfc3261)
- [SDP offer/answer RFC 3264](https://datatracker.ietf.org/doc/html/rfc3264)
- [RTP/RTCP RFC 3550](https://datatracker.ietf.org/doc/html/rfc3550)
- [SRTP RFC 3711](https://datatracker.ietf.org/doc/html/rfc3711)
- [RTP telephone events RFC 4733](https://datatracker.ietf.org/doc/html/rfc4733)
- [ICE RFC 8445](https://datatracker.ietf.org/doc/html/rfc8445)
- [STUN RFC 8489](https://datatracker.ietf.org/doc/html/rfc8489)
- [TURN RFC 8656](https://datatracker.ietf.org/doc/html/rfc8656)
- [WebRTC recommendation](https://www.w3.org/TR/webrtc/)
- [FreeSWITCH foundations](https://developer.signalwire.com/freeswitch/foundations/introduction/)
- [FreeSWITCH call queues](https://developer.signalwire.com/freeswitch/applications/call-queues/)
- [FreeSWITCH CDRs](https://developer.signalwire.com/freeswitch/integration/cdr/)
- [NANPA overview](https://www.nanpa.com/about)
- [47 CFR Part 9 emergency calling rules](https://www.ecfr.gov/current/title-47/chapter-I/subchapter-A/part-9)
- [FCC STIR/SHAKEN framework](https://docs.fcc.gov/public/attachments/FCC-20-42A1.pdf)
- [FTC Telemarketing Sales Rule guide](https://www.ftc.gov/business-guidance/resources/complying-telemarketing-sales-rule)
- [PCI SSC telephone payment data guidance](https://www.pcisecuritystandards.org/documents/Protecting_Telephone_Based_Payment_Card_Data_v3-0_nov_2018.pdf)
- [HHS HIPAA cloud guidance](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)
