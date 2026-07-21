# Heaps & Priority Queues

**Read time:** 14 min | **Difficulty:** Medium | **Video:** 19 min

## Heap Basics

**Complete binary tree** where parent ≤ children (min-heap) or parent ≥ children (max-heap).

```
Min-Heap:        Max-Heap:
      1                10
     / \              /  \
    2   3            8    9
   / \ /            / \
  4  5 6           7   6
```

## Array Representation

```python
# For index i:
# Left child: 2*i + 1
# Right child: 2*i + 2
# Parent: (i-1) // 2

heap = [1, 2, 3, 4, 5, 6]
#        0  1  2  3  4  5

#         1(0)
#        /    \
#      2(1)   3(2)
#      / \    /
#    4(3) 5(4) 6(5)
```

## Heapify (Maintain Heap Property)

```python
def heapify_down(heap, i):
    smallest = i
    left = 2 * i + 1
    right = 2 * i + 2
    
    if left < len(heap) and heap[left] < heap[smallest]:
        smallest = left
    if right < len(heap) and heap[right] < heap[smallest]:
        smallest = right
    
    if smallest != i:
        heap[i], heap[smallest] = heap[smallest], heap[i]
        heapify_down(heap, smallest)
```

## Insert

```python
def push(heap, val):
    heap.append(val)
    i = len(heap) - 1
    
    # Bubble up
    while i > 0 and heap[(i-1)//2] > heap[i]:
        heap[i], heap[(i-1)//2] = heap[(i-1)//2], heap[i]
        i = (i - 1) // 2
```

**Time:** O(log n)

## Extract Min

```python
def pop(heap):
    if not heap:
        return None
    
    min_val = heap[0]
    heap[0] = heap[-1]
    heap.pop()
    
    if heap:
        heapify_down(heap, 0)
    
    return min_val
```

**Time:** O(log n)

## Python Implementation

```python
import heapq

# Min-heap by default
heap = []
heapq.heappush(heap, 5)  # O(log n)
heapq.heappush(heap, 2)
heapq.heappush(heap, 8)

min_val = heapq.heappop(heap)  # O(log n) - returns 2

# Max-heap (negate values)
max_heap = []
heapq.heappush(max_heap, -5)
heapq.heappush(max_heap, -8)
max_val = -heapq.heappop(max_heap)  # 8

# Heapify from list
numbers = [5, 2, 8, 1, 9]
heapq.heapify(numbers)  # O(n)
```

## Time Complexity

| Operation | Complexity |
|-----------|-----------|
| Push | O(log n) |
| Pop | O(log n) |
| Peek | O(1) |
| Heapify | O(n) |

## Use Cases

1. **Kth Largest Element** - Use min-heap of size k
2. **Priority Queue** - Process by priority
3. **Dijkstra's Algorithm** - Shortest path
4. **Huffman Coding** - Compression
5. **Merge K Lists** - Efficiently merge sorted lists

## Kth Largest Example

```python
def find_kth_largest(arr, k):
    min_heap = []
    
    for num in arr:
        if len(min_heap) < k:
            heapq.heappush(min_heap, num)
        elif num > min_heap[0]:
            heapq.heapreplace(min_heap, num)
    
    return min_heap[0]

# Time: O(n log k)
```

## Common Problems

1. Kth Largest Element
2. Top K Frequent Elements
3. Merge K Sorted Lists
4. Find Median from Stream
5. Sliding Window Maximum

---

**Key:** Heap = O(log n) insert/extract. Great for top-k problems.
