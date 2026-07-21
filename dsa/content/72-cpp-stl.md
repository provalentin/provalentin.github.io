# Language Guide: C++ STL Cheat Sheet

**Read time:** 10 min | **Reference:** Yes

## Essential Headers

```cpp
#include <vector>      // Dynamic array
#include <unordered_map>  // Hash map
#include <map>         // Sorted map
#include <set>         // Sorted set
#include <unordered_set>  // Hash set
#include <queue>       // Queue
#include <deque>       // Deque
#include <stack>       // Stack
#include <algorithm>   // Algorithms
#include <string>      // String operations
```

## Vector (ArrayList)

```cpp
vector<int> v;
v.push_back(5);              // O(1) amortized
v.emplace_back(5);           // O(1) - construct in place
v.pop_back();                // O(1)
v[0];                        // O(1) - indexing
v.at(0);                     // O(1) - with bounds checking
v.insert(v.begin(), 5);      // O(n) - shifts required
v.erase(v.begin());          // O(n)
v.size();                    // O(1)
v.empty();                   // O(1)
```

## Unordered_map (HashMap)

```cpp
unordered_map<string, int> map;
map["key"] = 123;            // O(1) average
map.at("key");               // O(1) - throws if missing
map.find("key");             // O(1) - returns iterator or .end()
map.count("key");            // O(1) - 1 if exists, 0 if not
map.erase("key");            // O(1)

// Iterate
for (auto& [key, val] : map) {
    cout << key << ": " << val;
}
```

## Map (TreeMap - Sorted)

```cpp
map<int, string> m;
m[5] = "five";               // O(log n) - maintains order
m[3] = "three";
m[7] = "seven";

m.find(5);                   // O(log n)
m.count(5);                  // O(log n)
m.lower_bound(5);            // O(log n) - >= 5
m.upper_bound(5);            // O(log n) - > 5

// Keys are sorted
for (auto& [key, val] : m) {
    // Visits in sorted key order: 3, 5, 7
}
```

## Set & Unordered_set

```cpp
set<int> s;                  // Sorted, O(log n)
s.insert(5);                 // O(log n)
s.find(5);                   // O(log n)
s.count(5);                  // O(log n)
s.erase(5);                  // O(log n)

unordered_set<int> us;       // Hash-based, O(1)
us.insert(5);                // O(1)
us.find(5);                  // O(1)
us.count(5);                 // O(1)
```

## Queue

```cpp
queue<int> q;
q.push(5);                   // O(1)
q.front();                   // O(1) - access front
q.pop();                     // O(1)
q.empty();                   // O(1)
q.size();                    // O(1)
```

## Priority Queue (Heap)

```cpp
// Min heap (default)
priority_queue<int, vector<int>, greater<int>> pq;
pq.push(5);                  // O(log n)
pq.push(3);
pq.push(7);
pq.top();                    // 3 (minimum)
pq.pop();                    // O(log n)

// Max heap
priority_queue<int> max_pq;  // Default is max
max_pq.push(5);
max_pq.top();                // 5 (maximum)
```

## Stack

```cpp
stack<int> st;
st.push(5);                  // O(1)
st.top();                    // O(1) - access top
st.pop();                    // O(1)
st.empty();                  // O(1)
st.size();                   // O(1)
```

## Deque

```cpp
deque<int> dq;
dq.push_back(5);             // O(1)
dq.push_front(3);            // O(1)
dq.pop_back();               // O(1)
dq.pop_front();              // O(1)
dq[0];                       // O(1) - indexing
dq.size();                   // O(1)
```

## String

```cpp
string s = "hello";
s.length();                  // O(1)
s.size();                    // O(1)
s.empty();                   // O(1)
s.substr(0, 3);              // "hel", O(n)
s.find("ll");                // 2, O(n)
s.replace(0, 1, "H");        // O(n)
s + " world";                // Concatenate, O(n)

// Character operations
for (char c : s) { }         // Iterate
s[0];                        // 'h'
```

## Algorithms

```cpp
#include <algorithm>

vector<int> v = {3, 1, 4, 1, 5};

// Sorting
sort(v.begin(), v.end());    // [1, 1, 3, 4, 5], O(n log n)
sort(v.rbegin(), v.rend());  // [5, 4, 3, 1, 1] - descending

// Custom comparator
sort(v.begin(), v.end(), greater<int>());  // Descending

// Binary search (requires sorted)
binary_search(v.begin(), v.end(), 3);  // true/false
lower_bound(v.begin(), v.end(), 3);    // Iterator to first >= 3
upper_bound(v.begin(), v.end(), 3);    // Iterator to first > 3

// Other
find(v.begin(), v.end(), 3);           // Iterator to 3 or .end()
reverse(v.begin(), v.end());           // In-place reverse
unique(v.begin(), v.end());            // Remove consecutive duplicates
```

## Useful Patterns

### Counting Frequencies

```cpp
map<char, int> freq;
for (char c : s) {
    freq[c]++;
}

// Or with unordered_map for O(1)
unordered_map<char, int> freq;
```

### Max/Min Element

```cpp
int max_val = *max_element(v.begin(), v.end());
int min_val = *min_element(v.begin(), v.end());
```

### Pair Operations

```cpp
pair<int, string> p = {5, "five"};
p.first;                     // 5
p.second;                    // "five"

vector<pair<int, int>> pairs;
pairs.push_back({3, 1});

// Sort by first element, then second
sort(pairs.begin(), pairs.end());
```

### Range-based for Loop

```cpp
for (auto& x : v) { }        // Reference to each element
for (const auto& x : v) { }  // Const reference
for (auto [key, val] : map) {} // Structured binding (C++17)
```

## Memory

```cpp
vector<int> v;
v.reserve(1000);             // Allocate space without adding elements
v.capacity();                // O(1) - allocated size
v.shrink_to_fit();           // Release excess capacity

// Smart pointers
unique_ptr<int> ptr(new int(5));  // Exclusive ownership
shared_ptr<int> ptr2 = ptr;       // Shared ownership
```

## Interview Tips

✓ Use vector for sequences
✓ Use unordered_map for fast lookups
✓ Use map if you need sorted order
✓ Use priority_queue for heap problems
✓ Use set for uniqueness
✓ Know O(log n) vs O(1) complexity
✓ Remember .end() is past-the-end iterator
✓ Use references in range-based loops

❌ Don't use [ ] on missing keys in map (creates them)
❌ Don't forget to #include headers
❌ Don't confuse .end() with an element
❌ Don't assume O(1) for vector insertion

## Quick Reference

```cpp
Vector:      O(1) push_back, O(n) insert at start
Map:         O(log n) all operations, sorted
Unordered_map: O(1) average, unsorted
Set:         O(log n), unique elements
Priority Q:  O(log n) push/pop, O(1) top
```

---

**Next:** System design metrics & calculations.
