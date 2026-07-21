# Monitoring, Logging & Observability

**Read time:** 11 min | **Difficulty:** Medium

## Why Monitoring Matters

System with no monitoring is flying blind:

```
2am: Production down
→ No idea what went wrong
→ Customers affected for 1 hour
→ Millions in lost revenue
```

With monitoring:
```
2am: CPU spike detected
→ Auto alert on-call engineer
→ Logs show database connection exhaustion
→ Engineer fixes in 5 minutes
→ Customers barely notice blip
```

## Three Pillars of Observability

### 1. Logs
- Detailed text records of events
- "User login at 2023-01-15 10:30:45"
- High volume, cheap storage

### 2. Metrics
- Quantitative measurements
- CPU: 75%, Memory: 82%, Disk: 60%
- Lower volume, good for trends

### 3. Traces
- Request journey through system
- Request A → Service 1 → DB → Service 2 → Response
- Shows dependencies and bottlenecks

## Logging

### Log Levels

```
DEBUG:  Detailed diagnostic info (development)
INFO:   General informational messages
WARN:   Warning, problem may occur
ERROR:  Error, something failed
FATAL:  Critical, system stopping
```

### Structured Logging

```
❌ Bad (unstructured):
"User alice logged in successfully"

✓ Good (structured):
{
  "timestamp": "2023-01-15T10:30:45Z",
  "level": "INFO",
  "user_id": 123,
  "action": "login",
  "ip_address": "192.168.1.1",
  "duration_ms": 45
}
```

Structured format:
- Easier to parse
- Better for searching
- Enables analytics

### Log Aggregation

```
Server 1 logs → Aggregator
Server 2 logs →    ↓
Server 3 logs → Elasticsearch
                     ↓
                  Kibana (search/visualize)
```

Tools: ELK Stack (Elasticsearch, Logstash, Kibana), Splunk, Datadog

### What to Log

✓ Application errors (exceptions, failures)
✓ User actions (login, purchase, delete)
✓ Performance metrics (slow queries)
✓ Security events (failed auth, suspicious activity)
✓ System events (server restart, deployment)

❌ Don't log passwords or sensitive data
❌ Don't log everything (too much noise)
❌ Don't log in hot loops (performance impact)

## Metrics

Quantitative data about system health:

### Types

**System Metrics**
- CPU usage, memory, disk
- Network throughput
- Process count

**Application Metrics**
- Requests per second (RPS)
- Response time (latency)
- Error rate
- Cache hit rate

**Business Metrics**
- Users active
- Revenue
- Conversion rate

### Time Series Database

```
Metric: cpu_usage
Value: [
  (2023-01-15 10:00, 45%),
  (2023-01-15 10:01, 52%),
  (2023-01-15 10:02, 48%),
  ...
]
```

Tools: Prometheus, InfluxDB, Datadog

### Alerting

```
Metric: error_rate
Threshold: 5%
Alert if: error_rate > 5% for 5 minutes

Trigger: Email, Slack, PagerDuty
→ Wake on-call engineer at 3am
```

## Distributed Tracing

Track request across multiple services:

```
Client Request
   ↓
API Gateway (span 1: 50ms)
   ↓
User Service (span 2: 30ms)
   ├─ Call to Auth Service (span 3: 10ms)
   └─ Call to DB (span 4: 15ms)
   ↓
Product Service (span 5: 40ms)
   └─ Call to Cache (span 6: 2ms)
   ↓
Response (total: 130ms)
```

### Trace Information

```
{
  "trace_id": "abc123xyz",
  "spans": [
    {
      "span_id": "span1",
      "service": "api-gateway",
      "start": "10:30:00.000",
      "duration": 50,
      "tags": {"http.status": 200}
    },
    {
      "span_id": "span2",
      "service": "user-service",
      "start": "10:30:00.050",
      "duration": 30,
      "parent_span": "span1"
    }
  ]
}
```

### Benefits

✓ Find bottlenecks
✓ Understand service dependencies
✓ Detect latency issues
✓ Debug failures across services

Tools: Jaeger, Zipkin, Datadog APM

## Key Metrics to Monitor

### Availability
```
Uptime % = (total_time - downtime) / total_time × 100
Target: 99.9% (4.3 min downtime/month)
Alert if: < 99%
```

### Latency
```
p50: 100ms (median)
p95: 300ms (95% faster than this)
p99: 800ms (99% faster than this)

Alert if: p95 > 500ms
```

### Error Rate
```
errors / total_requests × 100
Target: < 0.1%
Alert if: > 1%
```

### Throughput
```
Requests per second
Alert if: < expected_rps × 0.8
```

### Resource Usage
```
CPU: Alert if > 80%
Memory: Alert if > 85%
Disk: Alert if > 90%
```

## Dashboard Example

```
Dashboard: Production Health
├─ Status Page
│  └─ All green ✓
├─ Traffic
│  └─ RPS: 5000 (normal)
├─ Latency
│  ├─ p50: 100ms
│  ├─ p95: 250ms
│  └─ p99: 600ms
├─ Errors
│  ├─ Error rate: 0.05%
│  └─ Top errors: [list]
├─ Resources
│  ├─ CPU: 45%
│  ├─ Memory: 60%
│  └─ Disk: 75%
└─ Services
   ├─ API: healthy ✓
   ├─ Database: healthy ✓
   └─ Cache: healthy ✓
```

## Alerting Best Practices

### Alert Rules

```
Good alert:
- Email when error_rate > 5% for 5 min
- Actionable (error_rate rising)
- Low false positive rate

Bad alert:
- CPU > 50% (too sensitive)
- Fires 100 times/day (alert fatigue)
- Can't fix immediately
```

### Alert Routing

```
Severity: CRITICAL
├─ Immediate PagerDuty (wake engineer)
├─ SMS alert
└─ Incident channel

Severity: WARNING
├─ Email
├─ Slack notification
└─ Incident log

Severity: INFO
└─ Incident log only
```

### On-Call Rotation

- Distribute responsibility fairly
- Clear escalation path
- Post-mortem after incidents
- Blameless culture

## Tools Landscape

| Tool | Purpose | Use Case |
|------|---------|----------|
| Prometheus | Metrics | Kubernetes, cloud-native |
| Grafana | Dashboards | Visualize any metrics |
| ELK | Log aggregation | Search large log volumes |
| Jaeger | Distributed tracing | Debug microservices |
| Datadog | All-in-one | Managed solution |
| New Relic | APM | Application performance |

## Interview Tips

✓ Discuss logging strategy (structured, levels)
✓ Explain metrics collection and alerting
✓ Mention distributed tracing for latency issues
✓ Design dashboard with key metrics
✓ Address alert fatigue prevention
✓ Discuss on-call rotation

❌ Don't over-alert (alert fatigue)
❌ Don't log sensitive data
❌ Don't forget about cost (log retention)
❌ Don't ignore trace latency

---

**Next:** System design case studies and real-world applications.
