# System Design Case Study: Notification System

**Read time:** 12 min | **Difficulty:** Medium-Hard

## Problem Statement

Design a notification system for emails, SMS, push notifications.

### Requirements

**Functional:**
- Send notifications via email, SMS, push
- Batch notifications for efficiency
- User preferences (do not disturb)
- Retry on failure
- Track delivery status

**Non-Functional:**
- 1B users
- 100M notifications per day
- Delivery latency < 10 seconds
- 99.9% delivery rate
- Support multiple channels

## Notification Types

### Email
- Long-form content
- Rich formatting
- Can include attachments
- Slow delivery (seconds)

### SMS
- Short message (160 chars)
- Immediate delivery
- Expensive per message
- Limited content

### Push Notification
- Mobile app only
- Instant
- Short message
- Can include deep links

### In-App
- Show banner/pop-up
- Immediate
- Best for engagement
- No cost

## Architecture

```
         Event Sources
      ↙      ↓      ↘
   User   Order  Social
   Action Action Action
      ↓      ↓      ↓
   Notification Service
   ├─ Aggregate events
   ├─ Apply user preferences
   ├─ Choose channels
   └─ Format message
      ↓
   Message Queue (Kafka)
   ├─ Email queue
   ├─ SMS queue
   └─ Push queue
      ↓
   Channel Services
   ├─ Email service
   ├─ SMS service (Twilio)
   └─ Push service (Firebase)
      ↓
   User devices
```

## Database Schema

```sql
-- Notification templates
CREATE TABLE notification_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_type VARCHAR(50),  -- order.placed, follow_accepted, etc
  email_template TEXT,
  sms_template VARCHAR(160),
  push_template VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- User notification preferences
CREATE TABLE notification_preferences (
  user_id INT PRIMARY KEY,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  quiet_hours_start TIME,  -- 22:00
  quiet_hours_end TIME,    -- 08:00
  frequency ENUM('instant', 'hourly', 'daily'),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Notification logs
CREATE TABLE notification_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  event_type VARCHAR(50),
  channel VARCHAR(20),  -- email, sms, push
  status ENUM('pending', 'sent', 'failed', 'delivered'),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  error_message TEXT
);

CREATE INDEX idx_user_status 
  ON notification_logs(user_id, status, sent_at DESC);
```

## Notification Flow

### Step 1: Event Triggering

```
Order placed:
Event: {
  type: "order.placed",
  user_id: 123,
  order_id: 456,
  data: {
    amount: 99.99,
    delivery_date: "2023-01-20"
  }
}

Sent to: Message queue (Kafka)
```

### Step 2: Aggregation (Optional)

```
User has 5 notifications in last hour:
├─ Friend liked post
├─ Friend commented
├─ Friend followed you
├─ Order shipped
└─ Cart reminder

Aggregate into:
"3 friend activities + Order shipped"
Send 1 email instead of 5
```

### Step 3: User Preferences Check

```
Check user's preferences:
├─ Email enabled? Yes
├─ SMS enabled? No
├─ Push enabled? Yes
├─ In quiet hours? Yes
│  └─ If yes, delay or skip
└─ Frequency? Daily (batch)
   └─ Collect for next batch
```

### Step 4: Channel Selection & Formatting

```
Template for "order.placed":
Email:
  Subject: "Order #{order_id} Confirmed"
  Body: "Your order for ${amount} will arrive by ${delivery_date}"

Push:
  Title: "Order Confirmed"
  Body: "#{order_id} - Arriving ${delivery_date}"

SMS:
  "Order #{order_id} confirmed. Arriving ${delivery_date}. Track: bit.ly/xyz"
```

### Step 5: Send

```
Place in channel queue:
├─ Email queue → Email service
├─ SMS queue → SMS service (Twilio)
└─ Push queue → Push service (Firebase)

Each service:
├─ Retry on failure (exponential backoff)
├─ Log delivery status
└─ Track metrics
```

## Channel Services

### Email Service

```
Responsibilities:
├─ Connect to email provider (SendGrid, AWS SES)
├─ Format HTML email
├─ Track open rates
├─ Handle bounces
└─ Retry failed sends

Rate: ~10K emails/second per provider
Cost: $0.001 per email
```

### SMS Service

```
Responsibilities:
├─ Connect to SMS provider (Twilio, Nexmo)
├─ Validate phone numbers
├─ Handle delivery failures
└─ Track delivery status

Rate: ~1K SMS/second
Cost: $0.01-0.05 per SMS
```

### Push Service

```
Responsibilities:
├─ Connect to push providers (Firebase, APNs, GCM)
├─ Target iOS, Android, Web
├─ Handle token updates
└─ Track delivery status

Rate: ~100K push/second
Cost: Free (if self-hosted)
```

## Batching & Throttling

### Problem: Too Many Notifications

User gets 50 notifications per day → uninstalls app

### Solution: Batching

```
Collect notifications over time window (1 hour)
Send 1 batch email instead of 50

User receives:
"You have 12 new notifications"
Click to see details
```

### Implementation

```
Queue notifications in Redis:
key: user_notifications:123
value: [event1, event2, event3, ...]

Background job every hour:
├─ Get all pending notifications
├─ Format digest
├─ Send single email
└─ Clear queue
```

## User Preferences

### Do Not Disturb

```
Quiet hours: 10 PM - 8 AM
During quiet hours:
├─ Skip instant notifications
├─ Queue for morning digest
└─ Or skip entirely if opt-out
```

### Channel Preferences

```
User settings:
├─ "Email all notifications" → on
├─ "SMS only urgent" → on
├─ "Push notifications" → off
├─ "In-app notifications" → on

System respects and routes accordingly
```

## Retry Logic

### Exponential Backoff

```
First attempt: send immediately
Failed
  ↓
Retry 1: Wait 1 second, retry
Failed
  ↓
Retry 2: Wait 4 seconds, retry
Failed
  ↓
Retry 3: Wait 16 seconds, retry
Failed
  ↓
Retry 4: Wait 60 seconds, retry
Failed
  ↓
Mark as failed, log error
```

### Max Retry Attempts

```
Email: 5 attempts over 1 hour
SMS: 3 attempts over 10 minutes
Push: 1 attempt (device may be offline)
```

## Monitoring & Alerting

### Metrics

```
Sent rate: notifications/second
Delivery rate: delivered / sent (%)
Failure rate: failed / sent (%)
Latency: time from event to delivery
```

### Alerts

```
Alert if:
├─ Delivery rate < 99%
├─ Latency > 30 seconds
├─ Error rate > 5%
└─ Queue backlog > 1M
```

## Scalability

### Horizontal Scaling

```
Message queue (Kafka):
├─ Partition by user_id
├─ Each partition → separate service
└─ Scale to 1000 services

Notification services:
├─ Email service: 50 instances
├─ SMS service: 20 instances
└─ Push service: 100 instances
```

### Rate Limiting

```
Per user:
├─ Max 10 emails per day
├─ Max 20 notifications per hour
├─ Max 100 total per day

Prevent spam and user churn
```

## Third-Party Integration

### Services Used

| Service | Purpose | Cost |
|---------|---------|------|
| SendGrid | Email delivery | $0.001/email |
| Twilio | SMS delivery | $0.01/SMS |
| Firebase | Push notifications | Free |
| AWS SQS | Message queue | $0.40/million |

### Fallback

```
Email provider down?
└─ Retry with backup provider (AWS SES)

SMS provider down?
└─ Resend via SMS backup (Nexmo)

Push provider down?
└─ Store and retry later
```

## Interview Tips

✓ Discuss event-driven architecture
✓ Address user preference handling
✓ Explain retry and backoff strategy
✓ Mention aggregation for batching
✓ Address channel selection logic
✓ Discuss scalability per channel
✓ Mention monitoring and alerting
✓ Address third-party integration

❌ Don't send notifications blindly
❌ Don't ignore user preferences
❌ Don't forget retry logic
❌ Don't ignore delivery guarantees

---

**Next:** Design an e-commerce platform.
