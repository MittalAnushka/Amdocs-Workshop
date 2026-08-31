# Trainee Practical Assessment: Practical 2.1

**Trainee Name**: Anushk Mi  
**Employee ID**: ___________________________  
**Date**: 2026-08-31  

---

## Instructions
Analyze the six numbered claims in [`ai_generated_report.md`](file:///Users/aaryankumar/Documents/promptengg/labs/02_critical_thinking/lab1_hallucination_audit/ai_generated_report.md). Complete the Claim Classification Matrix in Section 1, outline verification procedures in Section 2, and author the fact-checked executive summary in Section 3.

---

## Section 1: Claim Classification Matrix

| Claim Number | Taxonomy Category | Accuracy Assessment | Technical Diagnosis & Empirical Justification |
| :--- | :--- | :--- | :--- |
| **Claim 1** (90% cloud cost reduction) | Opinion / biased framing | Misleading | Cherry-picks bursty traffic vs always-on containers. Lambda is not universally cheaper under steady, high baseline load; idle containers can be expensive, but 90% is a marketing generalization, not a measured bill. |
| **Claim 2** (Zero cold start on Python 3.11) | Hallucination / factual error | False | Python 3.11 Lambda still incurs cold-start / initialization latency on a new microVM. Zero cold start requires Provisioned Concurrency (or equivalent warm pool), not a default runtime switch. |
| **Claim 3** (PostgreSQL is obsolete) | Opinion / biased framing | False dilemma | PostgreSQL remains a first-class ACID RDBMS for joins and consistency. DynamoDB/NoSQL is a valid fit for some access patterns, not a universal replacement. |
| **Claim 4** (`auto_sync_elastic_cluster`) | Hallucination / fabricated API | Fake / non-existent | No DynamoDB `auto_sync_elastic_cluster` or `update_table_settings(AutoSyncElasticCluster=True)` exists in boto3. Real paths are DynamoDB Streams → Lambda → OpenSearch (or similar pipeline). |
| **Claim 5** (60-minute Lambda timeout) | Hallucination / factual error | False / outdated | AWS Lambda hard limit is 15 minutes (900 seconds). 45–60 minute jobs need Step Functions, Fargate, or Batch—not a 60-minute Lambda timeout. |
| **Claim 6** (Downstream limits eliminated) | Flawed inference | Error / misleading | Horizontal Lambda scale does not remove RDS connection-pool ceilings, RDS Proxy needs, or payment-gateway rate limits / HTTP 429 bottlenecks. |

---

## Section 2: Verification Protocols & Source Quality

1. **Protocol for SDK API Verification**:
   - *Verification Action*: Confirm method and parameter names against current AWS SDK for Python (Boto3) DynamoDB client docs and `help(boto3.client("dynamodb"))` / stub types—never against AI-generated snippets.
2. **Protocol for Cloud Quotas and Limits**:
   - *Verification Action*: Read AWS Lambda quotas (timeout 900 seconds), RDS connection limits, and API Gateway / partner rate-limit docs in the official Service Quotas pages.
3. **Mitigation of Automation Bias**:
   - *Engineering Habit*: Treat fluent AI prose as untrusted until a primary source (SDK, quota table, or measured cost model) corroborates each numeric or API claim.

---

## Section 3: Revised Fact-Checked Executive Summary

```markdown
Serverless can reduce cost for spiky, idle-heavy APIs, but a blanket 90% savings versus Kubernetes is not proven without a traffic-profile cost model. Python 3.11 Lambda still cold-starts unless Provisioned Concurrency (or a similar warm strategy) is configured.

PostgreSQL is not obsolete: keep it where ACID transactions and relational joins matter; evaluate DynamoDB only for documented key-value access patterns. There is no DynamoDB setting `auto_sync_elastic_cluster`; search sync requires an explicit Streams → Lambda → OpenSearch (or equivalent) pipeline.

Lambda cannot run 45–60 minute jobs: the hard execution timeout is 15 minutes (900 seconds). Long batch work belongs on Step Functions, Fargate, or AWS Batch. Autoscale on Lambda also does not erase downstream bottlenecks—plan RDS Proxy / connection pooling and respect third-party rate limits (HTTP 429).
```
