# System Design Case Study: Ride Sharing Service

**Read time:** 15 min | **Difficulty:** Hard

## Problem Statement

Design a ride sharing service like Uber, Lyft.

### Requirements

**Functional:**
- Drivers go online/offline
- Riders request rides (origin → destination)
- Match riders to nearby drivers
- Real-time driver location tracking
- Ride confirmation
- Rating system

**Non-Functional:**
- 50M users, 1M drivers
- 1M active rides at peak time
- Match request completed in < 10 seconds
- Location update every 5-10 seconds
- 99.99% availability

## Back-of-Envelope Calculation

```
1M concurrent active rides
Each ride: 20 minutes average
→ 5M ride completions per day

Location updates:
5M drivers × 1 update per 5 sec = 1M location/sec
= 86.4B location updates per day
```

## Core Components

### User Types

**Drivers**
- Go online (available), offline
- Share location continuously
- Accept/reject ride requests
- Track earnings

**Riders**
- Request rides
- See available drivers
- Rate driver after ride
- Cancel rides

## Matching Algorithm

### Matching Request Flow

```
Rider requests ride:
1. Get rider's location
2. Find nearby drivers (radius 2-5km)
3. Send request to drivers
4. First driver to accept → matched!
5. Driver navigates to pickup
```

### Finding Nearby Drivers

**Challenge:** Efficiently find drivers within radius

**Solution 1: Geohash (Simple)**
```
Geohash divides world into grids
User location → Geohash
Query: "All drivers in same/adjacent geohashes"
Fast, but less accurate at boundaries
```

**Solution 2: Quadtree (Better)**
```
Recursively divide map into quadrants
Each node stores drivers in that area
Query: Traverse tree, find matching quadrants
Handles dynamic driver locations well
```

**Solution 3: Specialized Service**
```
Use existing geospatial service
Redis Geo commands: GEORADIUS
Elasticsearch with geo queries
Simple API, production-ready
```

### Matching Criteria

```
score = distance + estimated_wait_time + driver_rating

Best match:
├─ Closest drivers
├─ Low current wait time
├─ High rating
└─ Minimal detours
```

## Architecture

```
                Clients
         ↙        ↓        ↘
      Mobile    Browser    Web
        ↓         ↓         ↓
    Load Balancer
    ↙     ↓     ↘
  Web1   Web2   Web3
  ↙       ↓       ↘
  ├─ Matching Service
  ├─ Location Service
  ├─ Payment Service
  └─ Notification Service
         ↓
  [Cache: Redis]
  [DB: PostgreSQL]
  [Queue: Kafka]
```

## Database Schema

```sql
-- Users (Drivers & Riders)
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  type ENUM('driver', 'rider'),
  rating FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Driver Details
CREATE TABLE drivers (
  user_id INT PRIMARY KEY,
  car_model VARCHAR(100),
  license_plate VARCHAR(20),
  is_online BOOLEAN DEFAULT FALSE,
  total_rides INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Rides
CREATE TABLE rides (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  rider_id INT NOT NULL,
  driver_id INT,
  origin_lat FLOAT, origin_lng FLOAT,
  destination_lat FLOAT, destination_lng FLOAT,
  status ENUM('requested', 'accepted', 'started', 'completed', 'cancelled'),
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  cost DECIMAL(10,2),
  FOREIGN KEY (rider_id) REFERENCES users(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(user_id)
);

-- Location History (Time-series)
CREATE TABLE driver_locations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  driver_id INT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_driver_time 
  ON driver_locations(driver_id, timestamp DESC);
```

## Location Tracking

### Real-time Updates

```
Driver's phone sends location every 5 seconds:
1. POST /api/location
   {
     "driver_id": 123,
     "lat": 37.7749,
     "lng": -122.4194,
     "timestamp": 1234567890
   }

2. Location Service
   ├─ Store in time-series DB
   ├─ Update Redis cache
   ├─ Publish to message queue
   └─ Notify matching service

3. Riders see driver
   ├─ Continuously poll: GET /api/ride/123/driver-location
   └─ See driver movement in real-time
```

### Location Service Architecture

```
Driver sends location
        ↓
API Gateway (rate limit)
        ↓
Location Service
├─ Validate location (prevent spoofing)
├─ Async store to DB
├─ Update Redis (current location)
└─ Publish to Kafka

Benefits:
- Fast response to driver
- Durable storage (DB)
- Real-time updates (Kafka)
```

## Matching Service

### Matching Algorithm

```
Rider request arrives
        ↓
Get rider location
        ↓
Find nearby available drivers (Redis Geo)
        ↓
Score drivers (distance, rating, wait)
        ↓
Send requests to top 3 drivers
        ↓
First acceptance → Matched!
Other 2: Cancel requests
        ↓
Driver navigates to pickup
```

### Timeout Handling

```
If no driver accepts within 30 seconds:
├─ Expand search radius
├─ Send to more drivers
└─ Try again

If still no match after 2 min:
└─ Tell rider: "No drivers available"
```

## Real-time Communication

### Driver Side

```
Driver goes online
└─ Establishes WebSocket connection

Server sends ride request
└─ Driver receives push notification

Driver accepts
└─ WebSocket message: acceptance confirmed
```

### Rider Side

```
Rider requests ride
└─ App shows "Searching for drivers..."

Driver accepted
└─ App shows driver photo, car, ETA

Driver arrives
└─ App shows "Driver has arrived"
```

## Payment

### Flow

```
1. Ride completed
   ├─ Calculate cost: base + distance + time
   ├─ Driver earnings, platform fee
   └─ Surges: high demand → higher price

2. Payment processing
   ├─ Charge rider's payment method
   ├─ Process transaction (async)
   └─ Send receipt

3. Settlement
   ├─ Weekly payout to drivers
   └─ Handle disputes, refunds
```

### Surge Pricing

```
When demand >> supply:
├─ Increase price by multiplier (1.5x, 2x)
├─ Incentivize more drivers to go online
└─ Reduce demand naturally

Algorithm:
requests_in_area / available_drivers = surge_multiplier
```

## Rating System

```
After ride completion:
Rider rates driver (1-5 stars)
Driver rates rider (1-5 stars)

Impact:
├─ Rider with low rating (< 4.0): fewer drivers accept
├─ Driver with low rating: hidden from app, eventually banned
└─ Quality control mechanism
```

## Challenges & Solutions

### Driver Acceptance Rate

Problem: Driver rejects request (looking for longer ride)

Solution:
```
├─ Acceptance rate % (reject too many → penalty)
├─ Visibility penalty: shown to fewer future requests
└─ Eventually: account deactivation
```

### Duplicate Riders

Problem: Same rider-driver pair matches twice

Solution:
```
Check: Is this rider already in an active ride?
├─ Yes → Deny new request
└─ No → Allow
```

### False Location Spoofing

Problem: Driver reports fake location (speedier pickup)

Solution:
```
├─ GPS signal validation
├─ Speed check (unrealistic speeds → flag)
├─ Compare with actual pickup time
└─ Penalize cheaters
```

## Scaling to 1M Concurrent Rides

### Sharding

```
Shard by geography (region):
├─ US-West region: servers 1-100
├─ US-East region: servers 101-200
├─ EU region: servers 201-300
└─ Each region handles its own rides
```

### Cache Layer

```
Redis cluster for:
├─ Driver locations (real-time)
├─ Active rides (current status)
├─ Online drivers (availability)
└─ User info (quick access)

Hot data in memory, reduces DB load
```

### Message Queue

```
Kafka for async operations:
├─ Location updates (fire-and-forget)
├─ Payment processing (guaranteed delivery)
├─ Notifications (batched)
└─ Ride history logging (audit trail)
```

## Interview Tips

✓ Discuss matching algorithm (geohash/quadtree)
✓ Address real-time location tracking
✓ Explain surge pricing algorithm
✓ Discuss payment and settlement
✓ Address database sharding strategy
✓ Mention rating/quality control
✓ Discuss handling edge cases
✓ Address scalability for millions

❌ Don't ignore location accuracy
❌ Don't forget payment security
❌ Don't ignore fraud prevention
❌ Don't forget rating system impact

---

**Next:** Design a recommendation system.
