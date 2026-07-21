# System Design Case Study: Booking System

**Read time:** 13 min | **Difficulty:** Medium-Hard

## Problem Statement

Design a booking system like Airbnb, hotel reservation.

### Requirements

**Functional:**
- Search availability (location, dates)
- Reserve rooms/properties
- Confirm booking
- Pricing (surge, dynamic)
- Cancellation
- Reviews

**Non-Functional:**
- 1M properties, 50M users
- 100K concurrent searches
- Instant availability check (< 100ms)
- No double booking
- 99.99% availability

## Core Challenge: Concurrency

### Problem: Double Booking

```
Room has 1 bed available: 2023-01-15

User A checks availability:
└─ Available: Yes

User B checks availability:
└─ Available: Yes

Both users book simultaneously:
├─ User A: Book 2023-01-15
├─ User B: Book 2023-01-15
└─ Both get confirmation?

Result: Oversold! (conflict)
```

## Architecture

```
         Users
    ↙      ↓      ↘
 Search  Book   Cancel
    ↓      ↓      ↓
 API Gateway
    ↓
 Service Layer
 ├─ Search Service
 ├─ Booking Service
 ├─ Inventory Service
 └─ Pricing Service
    ↓
 Database
 ├─ Properties
 ├─ Reservations
 ├─ Pricing
 └─ Availability
```

## Database Schema

```sql
-- Properties
CREATE TABLE properties (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  owner_id INT NOT NULL,
  name VARCHAR(255),
  location_lat FLOAT,
  location_lng FLOAT,
  price_per_night DECIMAL(10,2),
  capacity INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_location 
  ON properties(location_lat, location_lng);

-- Availability (for fast query)
CREATE TABLE availability (
  property_id BIGINT NOT NULL,
  date DATE NOT NULL,
  total_units INT,
  available_units INT,
  price DECIMAL(10,2),
  PRIMARY KEY (property_id, date),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE INDEX idx_date 
  ON availability(date, available_units DESC);

-- Reservations
CREATE TABLE reservations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  property_id BIGINT NOT NULL,
  user_id INT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'),
  total_price DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE INDEX idx_property_date 
  ON reservations(property_id, check_in, check_out);
CREATE INDEX idx_user_status 
  ON reservations(user_id, status, check_in DESC);
```

## Search Flow

### Step 1: Query

```
User searches:
{
  "location": "New York",
  "check_in": "2023-01-15",
  "check_out": "2023-01-20",
  "guests": 2,
  "price_min": 100,
  "price_max": 300
}
```

### Step 2: Filter Properties

```
Search Service queries:
├─ Find properties in New York
├─ Filter by capacity >= 2 guests
├─ Filter by price 100-300
├─ For each property: check availability

For each property on check_in...check_out:
├─ Query availability table
├─ Check: available_units > 0 for ALL nights
└─ If yes, include in results
```

### Step 3: Return Results

```
Results:
[
  {
    property_id: 123,
    name: "Cozy Apartment",
    price_per_night: 150,
    availability: "Available"
  },
  {
    property_id: 456,
    name: "Luxury Suite",
    price_per_night: 200,
    availability: "Available"
  },
  ...
]
```

## Booking Flow

### Step 1: User Initiates Booking

```
User clicks "Book Now"
    ↓
Check reservation details:
{
  property_id: 123,
  check_in: "2023-01-15",
  check_out: "2023-01-20",
  guest_count: 2,
  guest_name: "John"
}
```

### Step 2: Lock Dates (Pessimistic)

```
Booking Service:
1. Acquire lock on property for dates
   SQL: SELECT * FROM availability 
        WHERE property_id=123 AND date='2023-01-15'
        FOR UPDATE (locks row)

2. Recheck availability:
   available_units > 0? YES

3. Decrease available_units:
   UPDATE availability SET available_units = available_units - 1
   WHERE property_id=123 AND date BETWEEN '2023-01-15' AND '2023-01-19'

Result: Lock prevents other users from booking same dates

4. Release lock (implicit on transaction commit)
```

### Step 3: Create Reservation

```
INSERT INTO reservations:
├─ property_id: 123
├─ user_id: 456
├─ check_in: 2023-01-15
├─ check_out: 2023-01-20
├─ status: pending
├─ total_price: 750 (5 nights × $150)
└─ created_at: now

Generate booking ID: BOOK_789
```

### Step 4: Process Payment

```
Call Payment Service:
├─ Charge user $750
├─ Idempotency key: BOOK_789 (prevent double charge)
└─ Wait for confirmation

If payment fails:
├─ Rollback: Restore available_units
├─ Delete reservation
└─ Return error to user

If payment succeeds:
├─ Update reservation status: confirmed
└─ Send confirmation email
```

### Step 5: Return Confirmation

```
{
  booking_id: "BOOK_789",
  status: "confirmed",
  property_id: 123,
  check_in: "2023-01-15",
  check_out: "2023-01-20",
  total_price: 750,
  confirmation_email: "Sent to user@example.com"
}
```

## Cancellation

### Cancellation Policy

```
Cancel before 7 days: Full refund
Cancel 3-7 days before: 50% refund
Cancel < 3 days before: No refund

Calculation:
Today: 2023-01-08
Check-in: 2023-01-15
Days until: 7 days
Policy: Full refund ✓
```

### Cancellation Process

```
1. User requests cancellation
   ↓
2. Check cancellation policy
   ├─ Calculate refund amount
   └─ Validate (not checked-in, etc)
   ↓
3. Process refund (via Payment Service)
   ├─ Refund $750 to original card
   └─ Wait for confirmation
   ↓
4. Update reservation status: cancelled
   ↓
5. Restore availability
   ├─ Increase available_units for dates
   └─ Property available for rebooking
   ↓
6. Send cancellation confirmation
```

## Pricing & Surge

### Base Pricing

```
Property: $100/night (base)
Dates: 2023-01-15 to 2023-01-20

Pricing calculation:
├─ Nights: 5
├─ Base: $100 × 5 = $500
├─ Service fee: 10% = $50
└─ Total: $550
```

### Dynamic Pricing (Surge)

```
Demand-based pricing:
├─ High demand (holidays): 1.5x
├─ Medium demand (weekends): 1.2x
├─ Low demand (weekdays): 1.0x

Example:
Dates: Christmas (high demand)
Base: $100
Surge multiplier: 1.5x
Final price: $150/night
```

### Implementation

```sql
CREATE TABLE pricing_rules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  property_id BIGINT NOT NULL,
  date_from DATE,
  date_to DATE,
  multiplier FLOAT,  -- 1.0, 1.2, 1.5, etc
  reason VARCHAR(100)  -- holiday, high_occupancy, etc
);

Query price on date:
SELECT multiplier FROM pricing_rules
WHERE property_id=123 AND date='2023-01-15'
LIMIT 1;

Apply: base_price × multiplier
```

## Reviews & Ratings

```sql
CREATE TABLE reviews (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  reservation_id BIGINT NOT NULL,
  reviewer_id INT NOT NULL,
  rating INT (1-5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);

Property rating:
SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
FROM reviews r
JOIN reservations res ON r.reservation_id = res.id
WHERE res.property_id = 123;
```

## Concurrency Control Solutions

### Pessimistic Locking

```
Pros:
├─ Guarantees no conflicts
├─ Simple to understand
└─ Works for low-concurrency

Cons:
├─ Slower (locking overhead)
├─ Deadlock possible (property A, B order issue)
└─ High contention (many reservations)
```

### Optimistic Locking

```
Use version numbers:
├─ Version 1: available_units = 5
├─ User reads availability (version 1)
├─ Update: SET available_units = 4 WHERE version = 1
└─ If no rows updated: Conflict! (someone else changed it)

Retry: Reload and try again

Pros: Better concurrency
Cons: More complex, retry logic
```

### Distributed Transactions (2PC)

```
Saga pattern (recommended):
1. Reserve inventory (lock dates)
2. Process payment
3. Create reservation record
4. Confirm booking

If step 2 fails:
└─ Compensate: Release inventory lock

No distributed transaction needed!
```

## Scalability

### Sharding by Property

```
Property ID determines shard:
hash(property_id) % 1000 = shard

Property 123 → Shard 1
Property 456 → Shard 2

Each shard handles:
├─ Properties 1-N
├─ Reservations for those properties
└─ Availability for those properties
```

### Caching

```
Cache availability:
├─ Popular properties (hot)
├─ Next 30 days (pre-compute)
├─ Update nightly
└─ TTL: 1 hour

Cache Layer (Redis):
key: property:123:availability:2023-01-15
value: {available_units: 5, price: 150}
```

## Edge Cases

### Partial Availability

```
Property has 3 units

User A books: 2 units (2023-01-15 to 2023-01-20)
User B books: 2 units (2023-01-18 to 2023-01-22)

Conflict on 2023-01-18 to 2023-01-20
├─ Only 1 unit left (3 - 2 from A)
├─ User B only needs 2
└─ User B's booking fails? NO, if partial okay

Ambiguous: Handle per business requirements
```

### Overbooking

```
Prevent by locking dates during booking
But recovery process if it happens:
├─ Prioritize by booking time (first come first serve)
├─ Offer alternatives (nearby dates, other properties)
├─ Automatic refund + compensation
```

## Interview Tips

✓ Discuss concurrency control (pessimistic vs optimistic)
✓ Explain double-booking prevention
✓ Address dynamic pricing strategy
✓ Discuss cancellation policies
✓ Address inventory management
✓ Mention payment integration
✓ Discuss search optimization
✓ Address scalability via sharding

❌ Don't ignore concurrency issues
❌ Don't forget payment processing
❌ Don't skip availability checking
❌ Don't ignore refund handling

---

**Next:** Design a distributed file system.
