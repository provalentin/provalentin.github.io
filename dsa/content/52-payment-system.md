# System Design Case Study: Payment System

**Read time:** 13 min | **Difficulty:** Hard

## Problem Statement

Design a payment processing system for online transactions.

### Requirements

**Functional:**
- Process payments (charge card)
- Handle refunds
- Support multiple payment methods
- Fraud detection
- Reconciliation
- Reporting

**Non-Functional:**
- 10M transactions per day
- < 100ms response time
- Exactly-once semantics (no duplicate charges)
- PCI DSS compliance
- 99.99% availability
- Atomic transactions

## Payment Types

### Card Payments

```
User enters credit card
Charge card immediately
    ↓
Success: Goods/service delivered
Failure: Show error to user, retry

Typical flow:
├─ Authorize (verify funds available)
├─ Capture (actually charge)
└─ Settlement (transfer money)
```

### Wallet/Digital Payments

```
PayPal, Apple Pay, Google Pay
    ↓
User already authenticated with wallet provider
    ↓
Charge wallet, not card directly
    ↓
Lower fraud risk (wallet provider handles)
```

### Bank Transfer

```
ACH (Automated Clearing House)
Slow (1-3 days)
Low cost
Used for: payouts, large amounts
```

## Payment Flow

### Step 1: Initiate Payment

```
User clicks "Pay"
    ↓
Client sends payment request:
{
  amount: 99.99,
  currency: "USD",
  payment_method: "card",
  order_id: "order_123",
  user_id: "user_456"
}
```

### Step 2: Create Transaction Record

```
Payment Service:
├─ Generate transaction ID (idempotency key)
├─ Check order exists and amount matches
├─ Create transaction record (status: pending)
└─ Log in database

Idempotency key:
└─ If same request arrives twice, use same txn_id
└─ Prevents duplicate charges
```

### Step 3: Fraud Check

```
Risk assessment:
├─ Amount reasonable?
├─ Location consistent?
├─ Velocity check (too many txns)
├─ Device fingerprint
└─ 3D Secure challenge if risky

Decision:
├─ Low risk: proceed
├─ Medium risk: require 2FA
├─ High risk: decline
```

### Step 4: Charge Card

```
Payment Gateway API call:
POST /charge
{
  token: "card_token",  // NOT raw card number!
  amount: 9999,         // in cents
  currency: "usd",
  idempotency_key: "unique_key"
}

Returns:
{
  transaction_id: "txn_abc123",
  status: "success" | "failed",
  error: "Insufficient funds" (if failed)
}
```

### Step 5: Update Transaction Status

```
Success:
├─ Update txn status: "charged"
├─ Reserve inventory (if physical goods)
├─ Create order
└─ Send confirmation email

Failure:
├─ Update txn status: "failed"
├─ Show error to user
├─ Suggest retry or alternate payment
```

### Step 6: Fulfillment

```
Payment confirmed
    ↓
Order Service
├─ Deduct from inventory
├─ Create shipment
└─ Send shipment notification
```

## Database Schema

```sql
-- Transactions
CREATE TABLE transactions (
  id VARCHAR(50) PRIMARY KEY,          -- Unique txn ID
  order_id VARCHAR(50) NOT NULL,
  user_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,       -- in cents
  currency CHAR(3) NOT NULL,           -- USD, EUR, etc
  status ENUM('pending', 'charged', 'failed', 'refunded'),
  payment_method VARCHAR(50),          -- card, paypal, etc
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

CREATE INDEX idx_order_status 
  ON transactions(order_id, status);
CREATE INDEX idx_user_time 
  ON transactions(user_id, created_at DESC);

-- Refunds
CREATE TABLE refunds (
  id VARCHAR(50) PRIMARY KEY,
  transaction_id VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  reason VARCHAR(255),
  status ENUM('pending', 'completed', 'failed'),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- Reconciliation
CREATE TABLE reconciliation (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  date DATE NOT NULL,
  expected_amount DECIMAL(14,2),    -- from our DB
  actual_amount DECIMAL(14,2),      -- from bank
  discrepancy DECIMAL(14,2),
  resolved BOOLEAN DEFAULT FALSE
);
```

## Idempotency & Exactly-Once Semantics

### Problem: Duplicate Charges

```
Network timeout:
├─ Client doesn't get response
├─ Client retries
├─ Charge processed twice!

Result: User charged $99.99 twice
Recovery: Manual refund, customer support

Prevention needed!
```

### Solution: Idempotency Keys

```
Client generates unique key per txn:
idempotency_key = "order_123_attempt_1"

Server logic:
1. Check: Has this key been processed?
   └─ Yes → Return previous result (same txn_id)
   └─ No → Continue

2. Check: Is this a duplicate request?
   └─ Track in Redis: key → result
   └─ TTL: 24 hours

Result:
├─ Retry N times with same key
├─ Always get same response
└─ No duplicate charges
```

## Refunds

### Refund Flow

```
User requests refund (order shipped late)
    ↓
Refund Service:
├─ Validate: order can be refunded
├─ Check: refund already issued? (prevent double refund)
├─ Create refund record (status: pending)
└─ Call payment gateway: refund $99.99

Payment Gateway:
├─ Check: original charge exists
├─ Refund to original card
└─ Return refund ID

Update records:
├─ Refund status: completed
├─ Transaction status: refunded
├─ Send refund confirmation to user
```

### Partial Refunds

```
Order: $100
Ship partial goods: $60
Refund remaining: $40
    ↓
Create refund record: $40
Call gateway: refund $40 of $100
    ↓
Can refund same card up to $100 total
```

## Fraud Detection

### Real-time Rules

```
Rule 1: Amount too high
├─ Threshold: > $10,000
└─ Action: Decline or 3D Secure

Rule 2: Velocity check
├─ Card used 5 times in 10 minutes
└─ Action: Decline

Rule 3: Location suspicious
├─ Charge in US, previous charge in Asia 2 hours ago
└─ Action: 3D Secure challenge

Rule 4: Device fingerprint
├─ New device, unusual pattern
└─ Action: Decline or SMS verification
```

### Machine Learning

```
Train model on historical data:
├─ Fraudulent txns: $X million
├─ Legitimate txns: $Y million

Features:
├─ Amount, frequency, location
├─ Device, time of day
├─ Merchant category
├─ User profile

Model predicts: fraud probability
└─ > 80%: decline
└─ 50-80%: 3D Secure
└─ < 50%: approve
```

## PCI DSS Compliance

Critical requirement for card processing:

### What NOT to Do

```
❌ Never log full card number
❌ Never store CVC (security code)
❌ Never transmit unencrypted
❌ Never access raw card data
```

### What to Do

```
✓ Use PCI-compliant payment gateway
✓ Use tokenization (card → token)
✓ Encrypt all card data
✓ Never handle raw cards
✓ Regular security audits
✓ Use SSL/TLS for transmission
```

### Tokenization

```
User enters card: "4111-1111-1111-1111"
    ↓
Payment Gateway:
├─ Validate card
├─ Generate token: "tok_abc123xyz"
└─ Return token to client

Client stores: token (safe)
NOT card number

For future charges:
├─ Use token: "tok_abc123xyz"
├─ Gateway looks up card
└─ Charge card (PCI-compliant)
```

## Reconciliation

### Daily Reconciliation

```
Every morning (2am):
1. Query DB: All charges yesterday
   └─ Total: $1,234,567.89

2. Download from bank: All charges
   └─ Total: $1,234,567.89

3. Compare:
   └─ Match! ✓

If mismatch:
├─ Investigate discrepancies
├─ Find missing txns
├─ Contact bank if needed
```

### Handling Discrepancies

```
DB shows: $1M
Bank shows: $990K

Missing: $10K

Investigate:
├─ Refunds not yet settled (lag)
├─ Failed charges (should be marked failed)
├─ Disputed charges
└─ Contact payment provider
```

## Webhook Notifications

Async notifications for events:

```
When transaction settles:
Payment Gateway → Webhook → Our server
    ↓
Our server receives:
{
  event: "payment.settled",
  transaction_id: "txn_123",
  amount: 9999,
  timestamp: "2023-01-15T10:30:45Z"
}
    ↓
Update transaction status: confirmed
    ↓
Trigger fulfillment
```

### Retry Logic

```
Webhook delivery failed
    ↓
Retry exponentially:
├─ Immediate retry
├─ Wait 1s, retry
├─ Wait 5s, retry
├─ Wait 30s, retry
└─ After 5 retries: alert ops team
```

## Reporting & Analytics

```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as num_transactions,
  SUM(amount)/100.0 as total_volume,
  COUNT(CASE WHEN status='failed' THEN 1 END) as failed_count,
  COUNT(CASE WHEN status='charged' THEN 1 END) as successful_count
FROM transactions
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Interview Tips

✓ Discuss idempotency and exactly-once semantics
✓ Explain fraud detection strategies
✓ Address PCI compliance without raw cards
✓ Explain reconciliation process
✓ Discuss refund handling
✓ Mention 3D Secure and 2FA
✓ Address webhook reliability
✓ Discuss error handling and retries

❌ Don't handle raw card numbers
❌ Don't ignore idempotency
❌ Don't skip fraud detection
❌ Don't forget reconciliation

---

**Next:** Design a file sharing system.
