# String Matching Algorithms

**Read time:** 12 min | **Difficulty:** Hard | **Video:** 18 min

## KMP (Knuth-Morris-Pratt)

```python
def build_lps(pattern):
    lps = [0] * len(pattern)
    j = 0
    for i in range(1, len(pattern)):
        while j > 0 and pattern[i] != pattern[j]:
            j = lps[j - 1]
        if pattern[i] == pattern[j]:
            j += 1
        lps[i] = j
    return lps

def kmp_search(text, pattern):
    lps = build_lps(pattern)
    matches = []
    j = 0
    for i in range(len(text)):
        while j > 0 and text[i] != pattern[j]:
            j = lps[j - 1]
        if text[i] == pattern[j]:
            j += 1
        if j == len(pattern):
            matches.append(i - len(pattern) + 1)
            j = lps[j - 1]
    return matches

# Time: O(n + m)
# Space: O(m)
```

## Rabin-Karp (Rolling Hash)

```python
def rabin_karp(text, pattern, prime=101):
    d = 256
    m = len(pattern)
    n = len(text)
    p_hash = 0  # Pattern hash
    t_hash = 0  # Text hash
    h = 1
    
    for i in range(m - 1):
        h = (h * d) % prime
    
    for i in range(m):
        p_hash = (d * p_hash + ord(pattern[i])) % prime
        t_hash = (d * t_hash + ord(text[i])) % prime
    
    for i in range(n - m + 1):
        if p_hash == t_hash:
            if pattern == text[i:i+m]:
                print(f"Match at {i}")
        
        if i < n - m:
            t_hash = (d * (t_hash - ord(text[i]) * h) + 
                     ord(text[i + m])) % prime
            if t_hash < 0:
                t_hash += prime

# Time: O(n + m) avg, O(n*m) worst
# Space: O(1)
```

## Boyer-Moore

Skips characters intelligently.

```python
def boyer_moore_preprocess(pattern):
    bad_char = {}
    for i in range(len(pattern)):
        bad_char[pattern[i]] = len(pattern) - 1 - i
    return bad_char

def boyer_moore(text, pattern):
    bad_char = boyer_moore_preprocess(pattern)
    matches = []
    s = 0
    while s <= len(text) - len(pattern):
        j = len(pattern) - 1
        while j >= 0 and pattern[j] == text[s + j]:
            j -= 1
        if j < 0:
            matches.append(s)
            s += 1
        else:
            shift = bad_char.get(text[s + j], len(pattern))
            s += max(1, j - shift)
    return matches

# Time: O(n/m) best, O(n*m) worst
# Space: O(1)
```

## When to Use

| Algorithm | Best Case | Worst Case | Space |
|-----------|-----------|-----------|-------|
| KMP | O(n+m) | O(n+m) | O(m) |
| Rabin-Karp | O(n+m) | O(n*m) | O(1) |
| Boyer-Moore | O(n/m) | O(n*m) | O(1) |

---

**Key:** KMP for guaranteed O(n+m), Boyer-Moore for large alphabets.
