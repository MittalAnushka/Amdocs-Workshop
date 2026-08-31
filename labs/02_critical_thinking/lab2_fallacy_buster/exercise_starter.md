# Trainee Practical Assessment: Practical 2.2

**Trainee Name**: Anushk Mi  
**Employee ID**: ___________________________  
**Date**: 2026-08-31  

---

## Instructions
Examine the architectural proposal in [`ai_proposal.md`](file:///Users/aaryankumar/Documents/promptengg/labs/02_critical_thinking/lab2_fallacy_buster/ai_proposal.md). Complete the Fallacy Identification Matrix in Section 1, unmask unstated assumptions in Section 2, and author an incremental engineering counter-proposal in Section 3.

---

## Section 1: Fallacy Identification Matrix

| Target Excerpt | Formal Fallacy Name | Technical Breakdown & Reasoning Defect |
| :--- | :--- | :--- |
| **Excerpt A** (*"Either 35 microservices this quarter or company fails"*) | False dilemma (black-and-white / either-or / false dichotomy) | Frames a quarter-long 35-service rewrite as the only alternative to company failure, ignoring modular monolith, strangler-fig extraction, and delayed decomposition. |
| **Excerpt B** (*"NetStream grew 350%, so we will grow 300%"*) | False cause (post hoc / correlation treated as causation / questionable cause) | NetStream subscriber growth is not evidence that *our* order-service split will produce a 300% revenue surge; product-market fit and distribution are confounders. |
| **Excerpt C** (*"Monolith advocates want 1990s spaghetti code"*) | Straw man (caricature / distorting the opposing view) | Modular-monolith advocates typically want bounded contexts, tests, and CI—not untested spaghetti or bare-metal copy-paste deploys. |
| **Excerpt D** (*"Cloud Visionary with 150k followers settled debate"*) | Appeal to authority (ad verecundiam / influencer popularity / bandwagon) | Follower count is not an architecture proof; LinkedIn hype does not replace latency, consistency, and ops metrics. |

---

## Section 2: Unmasking Unstated Operational Assumptions

1. **Assumption 1 (DevOps & Operational Competency)**:
   - *Technical Risk*: Independent deploys assume Kubernetes, Kafka, service-mesh, and distributed-tracing skill/expertise that a 3-week-cadence team may not have; without training, 35 services increase toil and MTTR.
2. **Assumption 2 (Network Latency & Distributed Complexity)**:
   - *Technical Risk*: Each extra hop adds network latency and failure modes; cross-service order flows need sagas/transactions instead of a local ACID commit.
3. **Assumption 3 (Root Cause of Deployment Cadence)**:
   - *Technical Risk*: A 3-week cycle is often a CI/CD, testing, and QA automation bottleneck—not proof the monolith topology is the sole cause. Splitting without pipeline work can slow releases further.

---

## Section 3: Phased Engineering Counter-Proposal

```markdown
### Phase 0 — Measure (2–4 weeks)
Instrument the monolith: deploy frequency, lead time, change-fail rate, p95 latency, and rollback causes. Identify the actual CI/CD and test bottlenecks.

### Phase 1 — Modular monolith + delivery (1–2 quarters)
- Encapsulate bounded contexts (orders, catalog, identity) behind internal modules; forbid cross-module table writes.
- Invest in CI/CD: automated tests, staged rollouts, feature flags. Improve cadence *before* multiplying runtime units.
- Success metric: weekly (or faster) production deploys with unchanged or improved error budget.

### Phase 2 — Strangler extraction (incremental)
Extract only services with independent scale or team ownership (e.g. notifications), using an anti-corruption layer. Keep a modular monolith as the default until a service has a measured SLA or team-boundary reason to split.

### Phase 3 — Selective distribution
Adopt Kubernetes/Kafka/Istio only where traffic and ops data justify the hop cost. Do not ship 35 services this quarter; do not treat influencer posts as a migration mandate.
```
