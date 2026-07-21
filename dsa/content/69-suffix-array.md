# Advanced DSA: Suffix Arrays & Advanced String Algorithms

**Read time:** 11 min | **Difficulty:** Hard

## Suffix Array

Efficient data structure for string queries:

```
String: "banana"
Suffixes:
├─ banana (0)
├─ anana (1)
├─ nana (2)
├─ ana (3)
├─ na (4)
└─ a (5)

Sorted order:
├─ a (5)
├─ ana (3)
├─ anana (1)
├─ banana (0)
├─ na (4)
└─ nana (2)

Suffix array: [5, 3, 1, 0, 4, 2]
```

### Applications

```
Find all occurrences of pattern:
Pattern: "ana" in "banana"

Binary search on sorted suffixes:
├─ Find first suffix starting with "ana"
└─ Find last suffix starting with "ana"
└─ All suffixes in range contain "ana"

Time: O(log n)
```

### Construction (Simplified)

```python
def build_suffix_array(s):
    suffixes = []
    for i in range(len(s)):
        suffixes.append((s[i:], i))
    
    suffixes.sort()
    
    return [idx for _, idx in suffixes]
```

Efficient version (DC3 algorithm): O(n)

## Longest Common Prefix (LCP)

```
Sorted suffixes:
├─ a (5)
├─ ana (3)
├─ anana (1)
├─ banana (0)
├─ na (4)
└─ nana (2)

LCP array:
├─ a vs ana: LCP = 1 (both start with "a")
├─ ana vs anana: LCP = 3 (all of "ana")
├─ anana vs banana: LCP = 0 (no common prefix)
├─ banana vs na: LCP = 0
└─ na vs nana: LCP = 2 (both "na")

LCP = [0, 1, 3, 0, 0, 2]
```

### Uses LCP

```
Longest substring appearing k times:
└─ Find window of size k with highest LCP
└─ Returns substring

Distinct substrings:
└─ Sum of all LCP values
└─ n(n+1)/2 - sum_LCP
```

## String Hashing

Efficient substring comparison:

```python
def build_hash(s):
    n = len(s)
    mod = 10**9 + 7
    base = 31
    hash_val = [0] * (n + 1)
    pow_base = [1] * (n + 1)
    
    for i in range(n):
        hash_val[i+1] = (hash_val[i] * base + ord(s[i])) % mod
        pow_base[i+1] = (pow_base[i] * base) % mod
    
    return hash_val, pow_base

def get_hash(hash_val, pow_base, l, r, mod):
    # Hash of s[l:r+1]
    return (hash_val[r+1] - hash_val[l] * pow_base[r-l+1]) % mod
```

Benefits:
```
Compare substrings in O(1)
vs O(n) for character-by-character
```

## Z-Algorithm

Find all occurrences efficiently:

```
String: "aabaab"
Z array:
├─ Z[0] = undefined
├─ Z[1] = 1 ("a" matches)
├─ Z[2] = 0 ("b" doesn't match)
├─ Z[3] = 3 ("aab" matches)
├─ Z[4] = 1 ("a" matches)
└─ Z[5] = 0 ("b" doesn't match)

Pattern occurrences: All indices with Z[i] >= pattern_length
```

### Implementation

```python
def z_algorithm(s):
    n = len(s)
    z = [0] * n
    l, r = 0, 0
    
    for i in range(1, n):
        if i <= r:
            z[i] = min(r - i + 1, z[i - l])
        
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1
        
        if i + z[i] - 1 > r:
            l, r = i, i + z[i] - 1
    
    return z
```

Time: O(n)

## Manacher's Algorithm

Find longest palindrome in O(n):

```
String: "babad"
Expand around center:
├─ "b" (palindrome)
├─ "aba" (palindrome)
├─ "bab" (palindrome)
└─ Longest: 3

Brute force: O(n²)
Manacher's: O(n)
```

### Insight

```
If we know palindromes at previous positions,
we can skip redundant comparisons

Use mirrored position:
If s[i..j] is palindrome,
s[mirror(i)..mirror(j)] is same palindrome
```

## Trie Extensions

### Suffix Tree

```
Compact version of suffix array
All suffixes in tree structure

Build suffix tree of "banana":
      root
      / | \ \
     a  b  n  $
    /|   \ |
   n a    a n
  /| |\   |
 a $ n$ a $
     |
     $

Fast pattern matching: O(m) where m = pattern length
But complex to implement
```

### AC Automaton (Aho-Corasick)

Multi-pattern matching:

```
Patterns: ["he", "she", "his", "hers"]
Text: "ushers"

Build trie of patterns
Add failure links
Scan text once

Find all pattern occurrences: O(text_length + matches)
```

## Interview Tips

✓ Explain suffix array concept
✓ Discuss LCP array construction
✓ Know KMP/Z-algorithm for pattern matching
✓ Explain string hashing trade-offs
✓ Analyze time complexity
✓ Identify right algorithm for problem

❌ Don't implement complex algorithms from scratch (unless asked)
❌ Don't forget edge cases (empty string, single char)
❌ Don't confuse suffix tree and suffix array
❌ Don't miss hash collision possibility

---

**Next:** Language-specific guides (Java, Python, C++).
