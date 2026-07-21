# Sliding Window Advanced

**Read time:** 12 min | **Difficulty:** Hard | **Video:** 16 min

## Monotonic Deque

Find next greater element efficiently.

```python
def nextGreaterElement(arr):
    result = [-1] * len(arr)
    deque = []
    
    for i in range(len(arr) - 1, -1, -1):
        # Remove smaller elements
        while deque and deque[-1] <= arr[i]:
            deque.pop()
        
        # Top is next greater
        if deque:
            result[i] = deque[-1]
        
        deque.append(arr[i])
    
    return result

# Time: O(n)
# Space: O(n)
```

## Sliding Window Maximum

```python
from collections import deque

def maxSlidingWindow(arr, k):
    if not arr or k == 0:
        return []
    
    dq = deque()
    result = []
    
    for i in range(len(arr)):
        # Remove elements outside window
        if dq and dq[0] < i - k + 1:
            dq.popleft()
        
        # Remove smaller elements
        while dq and arr[dq[-1]] <= arr[i]:
            dq.pop()
        
        dq.append(i)
        
        if i >= k - 1:
            result.append(arr[dq[0]])
    
    return result

# Time: O(n)
# Space: O(k)
```

## Multi-Pointer Window

Track two pointers for complex constraints.

```python
def subarraysWithKDistinct(arr, k):
    def atMostKDistinct(k):
        count = {}
        left = 0
        result = 0
        
        for right in range(len(arr)):
            count[arr[right]] = count.get(arr[right], 0) + 1
            
            while len(count) > k:
                count[arr[left]] -= 1
                if count[arr[left]] == 0:
                    del count[arr[left]]
                left += 1
            
            result += right - left + 1
        
        return result
    
    return atMostKDistinct(k) - atMostKDistinct(k - 1)

# Time: O(n)
# Space: O(k)
```

## Pattern Recognition

1. **Single constraint** → Standard window
2. **Min/max in window** → Monotonic deque
3. **Exactly k constraint** → at-most-k minus at-most-(k-1)
4. **Two pointers needed** → Expand/contract carefully

---

**Key:** Monotonic deque for window optimization. Two-pass for "exactly k" problems.
