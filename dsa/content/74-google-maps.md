# System Design Case Study: Google Maps

**Read time:** 12 min | **Difficulty:** Hard

## Problem Statement

Design a maps service like Google Maps, Apple Maps.

### Requirements

- Search for locations (geocoding)
- Get directions (routing)
- Real-time traffic
- Nearby places search
- Satellite/Street view
- Store billions of map data

### Scale

```
2 billion daily active users
5 billion searches per day
100 million routing requests per day
Petabytes of map data worldwide
Real-time traffic in 50+ countries
```

## Data Structures

### Map Tiles

```
Map divided into hierarchical grid:

Zoom level 0: 1 tile (entire world)
Zoom level 1: 4 tiles (2×2 grid)
Zoom level 2: 16 tiles (4×4 grid)
Zoom level 20: 1,048,576 tiles

Each tile:
├─ 256 × 256 pixels
├─ Vector data (roads, buildings)
└─ Rasterized and cached
```

### Quadtree Tiling

```
World divided recursively:
                Root
            /   /    \   \
           NW  NE   SW   SE
          / \  / \  / \  / \
         ...subdivided...

Benefits:
├─ Efficient zoom in/out
├─ Only load needed tiles
└─ Hierarchical caching
```

## Geospatial Indexing

### R-tree (Spatial Index)

```
Tree structure for spatial data:
        [Root]
        /    \
    [Box1]  [Box2]
    /  |  \
[Pt1][Pt2][Pt3]

Search "places near (37.7749, -122.4194)":
1. Traverse R-tree
2. Find bounding box containing point
3. Return all places in that region

Result: O(log n) lookup time
```

### Geohashing

```
Location: (37.7749, -122.4194) → Geohash "9q8yy"

Encode:
├─ Latitude: 37.7749 → 10011010...
├─ Longitude: -122.4194 → 11101110...
└─ Interleave bits → "9q8yy"

Benefits:
├─ Reduces dimensions to 1D
├─ Nearby locations have similar hashes
└─ Simple sorting and range queries
```

## Routing (Directions)

### Graph Model

```
Intersections: Vertices
Roads: Edges with weights (distance/time)

Shortest path:
A → B → C → D → Destination
Dijkstra or A* algorithm

Time: O((V + E) log V)
Distance: calculated
ETA: 24 minutes
```

### Real-time Traffic

```
Historical data:
├─ 7am on Tuesday: Road X typically 10 min
├─ 5pm on Friday: Road X typically 25 min
└─ 3am on Saturday: Road X typically 5 min

Current data:
├─ Real-time GPS from users
├─ Traffic sensors
└─ Accident reports

Combined prediction:
├─ Base on historical pattern
├─ Adjust for current conditions
└─ ETA: 32 minutes (vs normal 24 min)
```

## Geocoding

Converting addresses to coordinates:

```
Input: "1600 Pennsylvania Ave, Washington DC"
Process:
1. Parse address
2. Match to address database
3. Resolve ambiguities
4. Return coordinates: (38.8951, -77.0369)

Reverse geocoding:
Input: (37.7749, -122.4194)
Output: "Transamerica Building, San Francisco"
```

### Implementation

```
Address database:
├─ Indexed by street name, city, zip
├─ Multiple records per address (same house, different formats)
└─ Fuzzy matching for typos
```

## Nearby Search

Find places near a location:

```
Search: Restaurants near (37.7749, -122.4194)

Use geospatial index:
1. Get geohash of query point
2. Query indexes of nearby cells
3. Sort by distance
4. Return top 20

Time: < 100ms for 1000+ results in radius
```

## Map Rendering

### Tile Generation Pipeline

```
Raw map data (OpenStreetMap):
├─ Roads, buildings, amenities
└─ In multiple vector formats

Tile Generator (Nightly):
1. Read raw data
2. Simplify (less detail at lower zoom)
3. Render to image (PNG)
4. Compress
5. Store in CDN

User downloads tiles from CDN:
├─ Zoom 10: 1 tile (entire city)
├─ Zoom 15: ~256 tiles (buildings visible)
└─ Zoom 20: ~65K tiles (street level)
```

### Vector vs Raster Tiles

**Raster (PNG/JPEG)**
- Pre-rendered images
- Fast to serve
- Hard to customize
- Large file size

**Vector (GeoJSON)**
- Geometric shapes
- Can re-style on client
- Smaller files
- Client must render
```

## Database Schema

```sql
-- Places
CREATE TABLE places (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255),
  latitude FLOAT,
  longitude FLOAT,
  address VARCHAR(500),
  category VARCHAR(100),
  geohash VARCHAR(12),
  rating FLOAT,
  reviews_count INT
);

CREATE INDEX idx_geohash ON places(geohash);
CREATE INDEX idx_category ON places(category);

-- Routes
CREATE TABLE routes (
  id BIGINT PRIMARY KEY,
  start_lat FLOAT, start_lng FLOAT,
  end_lat FLOAT, end_lng FLOAT,
  distance_meters INT,
  duration_seconds INT,
  polyline VARCHAR(5000),  -- Encoded path
  created_at TIMESTAMP
);

-- Traffic
CREATE TABLE traffic_data (
  road_id BIGINT,
  hour_of_day INT (0-23),
  day_of_week INT (0-6),
  avg_speed_kmh INT,
  updated_at TIMESTAMP
);
```

## Real-time Updates

### Traffic Updates

```
User: Waze app, Anonymous GPS enabled
    ↓
Send location every 10 seconds: (lat, lng, speed, timestamp)
    ↓
Aggregation Service:
├─ Collect from millions of users
├─ Calculate road-level averages
└─ Detect incidents (sudden stop)
    ↓
Update Traffic Service
    ↓
Push updates to affected users:
"Accident on 101 North, slowdown expected"
```

## Scalability

### Tile Caching

```
CDN edge servers cache tiles:
├─ Popular tiles (city centers): 1000+ requests/sec
├─ Unpopular tiles: 1-10 requests/sec

Cache hit rate: > 95%
```

### Routing at Scale

```
100M routing requests/day:
├─ No-brainer: Cache common routes
├─ Route: SF to LA (10K times daily)
└─ Cache hit: Serve immediately

Cache new routes:
└─ Run Dijkstra (could be slow for far distances)

Pre-compute popular routes:
└─ Nightly batch job
```

### Geographic Distribution

```
Map data replicated globally:
├─ US: Complete USA + partial world
├─ EU: Complete EU + partial world
├─ APAC: Complete APAC + partial world

User in Berlin:
└─ Route to Austria: Local EU server
└─ Route to Tokyo: Federate to APAC server
```

## Challenges

### Road Network Updates

```
Road opens/closes frequently
Data must be fresh (weeks, not months)

Crowdsourced contributions:
├─ Users report issues via app
├─ Report verified
├─ Map updated within days
```

### Accuracy

```
GPS coordinates: ±5-10 meters typical
Building heights: Satellite imagery + user reports
Traffic patterns: Historical + real-time blended

Result: 99%+ accurate for most users
```

## Interview Tips

✓ Discuss tile-based rendering
✓ Explain geospatial indexing (R-tree, geohashing)
✓ Address routing algorithms
✓ Discuss real-time traffic updates
✓ Explain geocoding process
✓ Mention vector vs raster trade-offs
✓ Address caching strategy
✓ Discuss geographic distribution

❌ Don't ignore caching strategy
❌ Don't forget geospatial indexing
❌ Don't underestimate data size
❌ Don't ignore real-time updates

---

**Final article:** Real-time collaborative design (Figma).
