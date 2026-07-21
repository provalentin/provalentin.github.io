# Advanced DSA: Geometry & Coordinate Problems

**Read time:** 12 min | **Difficulty:** Hard

## Problem Categories

### Distance & Proximity

```
Find closest points:
Points: [(0,0), (1,1), (100,100)]
Query: (5,5)

Distance formula:
dist = √((x1-x2)² + (y1-y2)²)

Sorted by distance: (1,1), (0,0), (100,100)
```

### Circle & Rectangle Intersection

```
Circle: center (5,5), radius 3
Rectangle: (0,0) to (10,10)

Overlap? → YES
No overlap? → Circles too far or outside

Algorithm:
1. Find closest point on rectangle to circle center
2. If distance < radius: overlap
3. Otherwise: no overlap
```

### Convex Hull

```
Points: [(0,0), (1,0), (1,1), (0,1), (0.5, 0.5)]

Convex hull (outer boundary):
└─ [(0,0), (1,0), (1,1), (0,1)]

Inner point (0.5, 0.5) excluded

Graham's scan algorithm:
1. Sort by polar angle
2. Use stack to track boundary
3. Pop points that make left turn
```

### Line Intersection

```
Line 1: (0,0) to (2,2)
Line 2: (0,2) to (2,0)

Intersection point? → (1,1)

Algorithm:
1. Use parametric form
2. Solve system of equations
3. Check if solution in valid range
```

### Point in Polygon

```
Point: (5, 5)
Polygon: [(0,0), (10,0), (10,10), (0,10)]

Inside? → YES

Ray casting algorithm:
1. Cast ray from point to infinity
2. Count polygon edge crossings
3. Odd crossings = inside, even = outside
```

## Sweep Line Algorithm

### Vertical Line Sweep

```
Events (sweep from left to right):
Start point: (x, y1) - Add to active set
End point: (x, y2) - Remove from active set
Query point: Find active segments at x

Example: Rectangle union area
1. Collect all vertical edges
2. Sort by x-coordinate
3. Sweep left to right
4. Track active segments
5. Calculate area between events
```

### Implementation

```python
def rectangles_area(rectangles):
    # rectangles = [[x1,y1,x2,y2], ...]
    
    events = []
    for x1, y1, x2, y2 in rectangles:
        events.append((x1, 'start', y1, y2))
        events.append((x2, 'end', y1, y2))
    
    events.sort()
    
    active = set()
    total_area = 0
    prev_x = 0
    
    for x, event_type, y1, y2 in events:
        # Calculate area at prev_x
        height = sum_of_overlaps(active)
        total_area += (x - prev_x) * height
        
        if event_type == 'start':
            active.add((y1, y2))
        else:
            active.remove((y1, y2))
        
        prev_x = x
    
    return total_area
```

## Coordinate Compression

When coordinates are huge:

```
x-coordinates: [1, 1000000000, 1000000001]
y-coordinates: [1, 2, 3]

Compress:
x: [1, 1000000000, 1000000001] → [0, 1, 2]
y: [1, 2, 3] → [0, 1, 2]

Benefits:
├─ Use smaller data types
├─ Faster array operations
└─ Preserve relative positions
```

## Common Patterns

### Slope Calculation

```
Avoid division (floating point errors):
slope = (y2 - y1) / (x2 - x1)

Instead: Compare cross products
(y2 - y1) * (x3 - x1) vs (y3 - y1) * (x2 - x1)

Determines if point is left/right of line
```

### Angle Between Points

```
Vector 1: (x1, y1)
Vector 2: (x2, y2)

Dot product: x1*x2 + y1*y2
Cross product: x1*y2 - y1*x2

Angle = atan2(cross, dot)
```

### Rotation

```
Rotate point (x, y) by angle θ:
x' = x*cos(θ) - y*sin(θ)
y' = x*sin(θ) + y*cos(θ)

Or use rotation matrix:
[cos(θ)  -sin(θ)]   [x]
[sin(θ)   cos(θ)] × [y]
```

## Interview Tips

✓ Clarify coordinate system (2D or 3D)
✓ Use distance formula carefully
✓ Avoid floating point comparisons
✓ Explain sweep line approach
✓ Discuss coordinate compression
✓ Draw diagrams
✓ Handle edge cases (collinear points, etc)

❌ Don't use floating point without care
❌ Don't forget edge cases
❌ Don't overcomplicate simple problems
❌ Don't skip diagram explanation

---

**Next:** Topological sort and DFS applications.
