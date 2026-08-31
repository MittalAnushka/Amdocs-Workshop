# Trainee Practical Assessment: Practical 1.2

**Trainee Name**: Anushk Mi  
**Employee ID**: ___________________________  
**Date**: 2026-08-31  

---

## Instructions
Complete the Task Decomposition Blueprint in Section 1 and craft your master Chain-of-Thought review prompt in Section 2. Execute the prompt against the target code and paste the 5-stage markdown output in Section 3.

---

## Section 1: Task Decomposition Blueprint

| Stage | Stage Title | Specific Analytical Directive |
| :--- | :--- | :--- |
| **Stage 1** | Requirement Analysis & Boundary Mapping | Map every tier threshold ($500/$2,000/$5,000 and 6/12/24 months), VIP override, and inactive spend ≤ 0 to expected `{tier, discount}` before reading the implementation. |
| **Stage 2** | Trace Execution & Dry Run | Mentally execute the exact boundary customer spend_amount=5000, account_age_months=24, is_vip=False and record which branch fires. |
| **Stage 3** | Root Cause Defect Diagnosis | Isolate `>` vs `>=` off-by-one defects and missing type/null guards; assign High/Medium/Low severity. |
| **Stage 4** | Surgical Code Refactoring | Repair only the defective predicates and add defensive validation; keep `calculate_loyalty_tier(spend_amount, account_age_months, is_vip=False)` and the standard library only. |
| **Stage 5** | Regression Test Assertions | Provide standalone `assert` coverage for inactive, bronze, silver/gold/platinum boundaries, and VIP override. |

---

## Section 2: Master Chain-of-Thought Prompt Template

```text
You are a senior code reviewer. Review {{SOURCE_CODE}} using exactly five sections in this order. Do not skip stages. Do not invent APIs or add third-party libraries. Preserve the original function name and parameters.

### 1. Specification & Edge-Case Matrix
Derive expected outputs from the docstring only. Tabulate boundaries including spend 0, 500, 2000, 5000 and ages 6, 12, 24.

### 2. Step-by-Step Logic Trace (Chain-of-Thought)
Dry-run spend_amount=5000, account_age_months=24, is_vip=False. Quote the exact comparison that decides Platinum vs Gold.

### 3. Identified Defects & Severity
List defects as High / Medium / Low. Call out `>` vs `>=` explicitly.

### 4. Surgical Code Fix
Output one corrected Python function in a fenced python code block. Signature must remain:
def calculate_loyalty_tier(spend_amount, account_age_months, is_vip=False)

### 5. Verification Test Suite
Provide executable assert statements covering Inactive, Bronze, Silver, Gold, Platinum, and VIP.

SOURCE_CODE:
{{SOURCE_CODE}}
```

---

## Section 3: Generated Execution Output

### 1. Specification & Edge-Case Matrix

| spend_amount | account_age_months | is_vip | Expected tier | Expected discount |
| ---: | ---: | :---: | :--- | ---: |
| 0 or negative | any | any | Inactive | 0.0 |
| 200 | 3 | False | Bronze | 0.0 |
| 500 | 6 | False | Silver | 0.10 |
| 2000 | 12 | False | Gold | 0.15 |
| 5000 | 24 | False | Platinum | 0.20 |
| 10 | 1 | True | Platinum | 0.20 |

Platinum also applies when is_vip is True regardless of spend/age. Gold requires spend >= 2000 AND age >= 12. Silver requires spend >= 500 AND age >= 6.

### 2. Step-by-Step Logic Trace (Chain-of-Thought)

Input: spend_amount=5000, account_age_months=24, is_vip=False.

1. `spend_amount <= 0` is false (5000 > 0), so Inactive is skipped.
2. `is_vip` is False, so the VIP Platinum branch is skipped.
3. Defective predicate: `spend_amount > 5000 and account_age_months > 24`.
   - 5000 > 5000 is False; 24 > 24 is False.
   - Platinum branch does not fire even though the spec requires spend >= 5000 AND age >= 24.
4. Next: `spend_amount > 2000 and account_age_months > 12` → 5000 > 2000 True, 24 > 12 True → wrongly classifies as Gold 15%.
5. Correct operator is `>=` so the $5,000 / 24-month customer is Platinum 20%.

### 3. Identified Defects & Severity

1. **High** — Strict inequality: `>` instead of `>=` on all tier thresholds ($500/6mo, $2000/12mo, $5000/24mo) misclassifies boundary customers.
2. **Medium** — No defensive type/null checks; non-numeric or None inputs raise TypeError instead of a controlled Inactive/error path.
3. **Low** — Discount floats are correct once the predicate is fixed; no extra libraries needed.

### 4. Surgical Code Fix

```python
def calculate_loyalty_tier(spend_amount, account_age_months, is_vip=False):
    try:
        spend = float(spend_amount)
        age = float(account_age_months)
    except (TypeError, ValueError):
        return {"tier": "Inactive", "discount": 0.0}

    if spend <= 0:
        return {"tier": "Inactive", "discount": 0.0}

    if is_vip or (spend >= 5000 and age >= 24):
        return {"tier": "Platinum", "discount": 0.20}
    if spend >= 2000 and age >= 12:
        return {"tier": "Gold", "discount": 0.15}
    if spend >= 500 and age >= 6:
        return {"tier": "Silver", "discount": 0.10}
    return {"tier": "Bronze", "discount": 0.0}
```

### 5. Verification Test Suite

```python
assert calculate_loyalty_tier(0, 10, False) == {"tier": "Inactive", "discount": 0.0}
assert calculate_loyalty_tier(-50, 12, False) == {"tier": "Inactive", "discount": 0.0}
assert calculate_loyalty_tier(200, 3, False) == {"tier": "Bronze", "discount": 0.0}
assert calculate_loyalty_tier(500, 6, False) == {"tier": "Silver", "discount": 0.10}
assert calculate_loyalty_tier(2000, 12, False) == {"tier": "Gold", "discount": 0.15}
assert calculate_loyalty_tier(5000, 24, False) == {"tier": "Platinum", "discount": 0.20}
assert calculate_loyalty_tier(10, 1, True) == {"tier": "Platinum", "discount": 0.20}
```

---

## Section 4: Self-Verification Checklist
- [x] Model explicitly flagged the `>` vs. `>=` boundary condition defect.
- [x] Original function signature and parameter names were preserved.
- [x] No external unrequested third-party libraries were introduced.
- [x] All 7 boundary assertions execute and pass without syntax errors.
