# Common Mistakes in Interviews

**Read time:** 9 min | **Video:** 10 min

## Coding Mistakes

❌ **Off-by-one errors**
```python
# WRONG
for i in range(len(arr)):
    print(arr[i+1])  # IndexError when i=len-1

# RIGHT
for i in range(len(arr) - 1):
    print(arr[i+1])
```

❌ **Forgetting base case**
```python
# WRONG
def factorial(n):
    return n * factorial(n-1)  # Stack overflow!

# RIGHT
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n-1)
```

❌ **Modifying while iterating**
```python
# WRONG
for num in nums:
    if num < 0:
        nums.remove(num)  # Skips elements!

# RIGHT
nums[:] = [n for n in nums if n >= 0]
```

❌ **Not handling null/empty**
```python
# WRONG
def process(arr):
    return arr[0] + arr[1]  # IndexError if arr is empty

# RIGHT
def process(arr):
    if not arr or len(arr) < 2:
        return 0
    return arr[0] + arr[1]
```

## Algorithm Mistakes

❌ **Wrong complexity estimate**
```python
# WRONG: Thinks O(n)
def has_duplicate(arr):
    for i in range(len(arr)):
        for j in range(i+1, len(arr)):
            if arr[i] == arr[j]:
                return True
    # Actually O(n²)!

# RIGHT: O(n)
def has_duplicate(arr):
    return len(arr) != len(set(arr))
```

❌ **Greedy when DP needed**
- Greedy doesn't always work!
- Example: Coin change (greedy: US coins work, arbitrary not always)

## Communication Mistakes

❌ **Starting to code immediately**
- Always clarify first!
- Ask about constraints, edge cases

❌ **Not explaining approach**
- Interviewer wants to see your thinking
- Explain before coding

❌ **Ignoring hints**
- Interviewer hints are gifts
- Listen carefully and adapt

## Solution Mistakes

❌ **Ignoring edge cases**
- Empty input
- Single element
- Duplicates
- Negative numbers
- Very large numbers

---

**Key:** Communicate first, code second. Handle edge cases. Test with examples.
