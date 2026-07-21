# System Design Case Study: E-Commerce Platform

**Read time:** 15 min | **Difficulty:** Hard

## Problem Statement

Design an e-commerce platform like Amazon, Alibaba.

### Requirements

**Functional:**
- Browse products (search, filter, sort)
- Shopping cart
- Checkout and payment
- Order tracking
- Inventory management
- Reviews and ratings

**Non-Functional:**
- 1B users, 100M products
- 10M concurrent active users
- Handle flash sales (100x surge)
- < 100ms page load
- 99.99% availability

## Back-of-Envelope Calculation

```
10M concurrent users
Average session: 20 minutes
Page load per minute: 5 pages
→ 50M page requests/second
```

## Core Services

### Product Service
```
- Product catalog
- Details (specs, images, price)
- Search and filtering
- Caching for hot products
```

### Cart Service
```
- Add/remove items
- Persist across sessions
- Calculate totals (tax, shipping)
```

### Order Service
```
- Checkout process
- Create orders
- Order history
- Status tracking
```

### Payment Service
```
- Process payments
- Multiple payment methods
- PCI compliance
- Fraud detection
```

### Inventory Service
```
- Track stock levels
- Reserve inventory during checkout
- Update on order placement
- Prevent overselling
```

## Database Schema

```sql
-- Products
CREATE TABLE products (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

CREATE INDEX idx_category_price 
  ON products(category_id, price);

-- Inventory
CREATE TABLE inventory (
  product_id BIGINT PRIMARY KEY,
  quantity INT NOT NULL,
  reserved INT DEFAULT 0,
  warehouse_id INT,
  last_updated TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Cart (session-based, also in Redis)
CREATE TABLE cart_items (
  user_id INT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  added_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

-- Orders
CREATE TABLE orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

CREATE INDEX idx_user_created 
  ON orders(user_id, created_at DESC);

-- Order items (line items)
CREATE TABLE order_items (
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (order_id, product_id),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## Product Search

### Full-Text Search

```
Search: "black running shoes"
Query Elasticsearch:
├─ Match title/description
├─ Filter by category
├─ Facets: brand, size, price
└─ Return top 100 results
```

### Search Infrastructure

```
Database: PostgreSQL (primary)
Search engine: Elasticsearch
    ├─ Index all products
    ├─ Full-text search
    └─ Faceted search

Indexing:
├─ Real-time indexing via Kafka
├─ Batch indexing nightly
└─ TTL: rebuild index weekly
```

## Shopping Cart

### Cart Storage

```
Option 1: Database
├─ Persistent (survives crashes)
├─ Slower queries
└─ Suitable for checkouts

Option 2: Redis (Recommended)
├─ Fast (microseconds)
├─ In-memory
├─ Expire after 30 days
└─ Suitable for active carts

Hybrid approach:
├─ Redis: Active session (fast)
├─ DB: Abandoned cart recovery
```

### Cart Flow

```
1. Add item to cart
   ├─ Check inventory
   ├─ Add to Redis cache
   └─ Return updated cart

2. Update cart
   ├─ Modify quantities
   ├─ Remove items
   └─ Sync to Redis

3. View cart
   ├─ Load from Redis
   ├─ Verify prices haven't changed
   └─ Calculate total
```

## Checkout Process

### Step-by-Step

```
1. Review cart
   └─ User reviews items, quantities, prices

2. Shipping info
   ├─ Enter address
   ├─ Select shipping method (express, standard)
   └─ Calculate shipping cost

3. Payment
   ├─ Enter payment method
   ├─ Process payment
   └─ Handle 3D Secure if needed

4. Confirmation
   ├─ Generate order
   ├─ Reserve inventory
   ├─ Send confirmation email
   └─ Return order ID
```

### Inventory Reservation

```
Two-phase process:

Phase 1: Reserve
├─ Check if quantity available
├─ Reserve = mark as not available
└─ Lock for 10 minutes

Phase 2: Confirm
├─ Payment processed successfully
├─ Convert reservation to order
├─ Update inventory (reduce by order qty)

If payment fails:
└─ Release reservation (available again)
```

## Payment Processing

### Payment Flow

```
1. User submits payment
   ├─ Tokenize card (PCI compliance)
   └─ Send to payment processor

2. Payment processor (Stripe, PayPal)
   ├─ Validate card
   ├─ Charge amount
   └─ Return transaction ID

3. Confirmation
   ├─ Log successful payment
   ├─ Create order
   ├─ Reserve inventory
   └─ Send confirmation

If declined:
├─ Retry (up to 3 times)
├─ Notify user
└─ Release inventory reservation
```

### PCI Compliance

```
Never store full credit card numbers
Instead:
├─ Use payment gateway (Stripe, PayPal)
├─ They handle PCI compliance
├─ You get token to store
└─ Use token for future charges
```

## Order Tracking

### Order States

```
Pending: Payment processing
    ↓
Confirmed: Order placed, inventory reserved
    ↓
Shipped: Picked from warehouse, in transit
    ↓
Delivered: Received by customer
    ↓
(or Cancelled)
```

### User Notifications

```
State change event:
1. Order confirmed → "Order received" email
2. Shipped → "Tracking info" email + SMS
3. Delivered → "Delivery confirmed" notification

Architecture:
Order Service → Event → Message Queue
                            ↓
                    Notification Service
```

## Handling Flash Sales

### Problem

```
Flash sale: iPhone 50% off
10M users see notification
9M try to buy simultaneously
→ Server overwhelmed, crashes
```

### Solutions

**1. Rate Limiting**
```
Max 1000 checkouts/second (not 9M)
Queue remaining, tell them wait
Process FIFO order
```

**2. Inventory Limit**
```
Only 1000 units available
First 1000 to checkout get it
Rest: "Out of stock"
```

**3. Pre-registration**
```
Users register for sale
Get time slot (9am-9:15am for you)
Only your slot can checkout
No thundering herd
```

**4. Separate Infrastructure**
```
Flash sale on separate servers
Regular site on normal servers
Flash sale crashes → regular site fine
```

## Scalability Strategies

### Database Sharding

```
Shard by user_id:
├─ Users 1-1M → Shard 1
├─ Users 1M-2M → Shard 2
├─ Users 2M-3M → Shard 3

Benefits:
├─ Each shard smaller, faster
├─ Parallel queries
└─ Independent scaling
```

### Caching Strategy

```
Cache Layer 1: Popular products
├─ Fetched 1000x/day
├─ Rarely change
└─ TTL: 1 day

Cache Layer 2: User data
├─ User profile
├─ Addresses
└─ TTL: 30 minutes

Cache Layer 3: Search results
├─ Top 100 queries
├─ Pre-computed results
└─ TTL: 1 hour
```

### CDN for Static Content

```
Product images, CSS, JS
Serve from nearest edge server
Reduce latency, origin load
```

## Inventory Management

### Real-time Inventory

```
Product A: 5 units remaining

User 1 adds to cart (5 units)
User 2 adds to cart (1 unit)
    ↓
Conflict! Only 5 units
    ↓
Solution:
├─ Option 1: First come (User 1 checkout first)
├─ Option 2: User 2 can't checkout (backorder)
└─ Option 3: Partial fulfillment (User 2 gets 0)
```

### Overselling Prevention

```
Synchronize across channels:
├─ Website
├─ Mobile app
├─ Store
├─ Marketplace

Update inventory:
├─ Immediately on order creation
├─ Reconcile hourly
├─ Real-time is ideal but hard
```

## Reviews & Ratings

```sql
CREATE TABLE reviews (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  user_id INT NOT NULL,
  rating INT (1-5),
  title VARCHAR(255),
  content TEXT,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_product_rating 
  ON reviews(product_id, rating);
```

Aggregated stats:
```
Average rating: 4.5 stars
Review count: 10,234
Breakdown: 60% 5-star, 20% 4-star, etc
```

## Interview Tips

✓ Discuss microservices architecture
✓ Address inventory management challenges
✓ Explain payment processing flow
✓ Discuss flash sale handling
✓ Address database sharding strategy
✓ Mention caching at multiple layers
✓ Discuss order tracking workflow
✓ Address search infrastructure

❌ Don't forget inventory reservation
❌ Don't ignore payment security
❌ Don't underestimate flash sales
❌ Don't forget order state machine

---

**Next:** Design a search engine.
