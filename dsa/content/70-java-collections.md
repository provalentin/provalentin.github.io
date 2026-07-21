# Language Guide: Java Collections & Data Structures

**Read time:** 10 min | **Reference:** Yes

## Most-Used Collections

### ArrayList

```java
List<Integer> list = new ArrayList<>();
list.add(5);                  // O(1) amortized
list.add(0, 3);              // O(n) - shift required
list.get(0);                 // O(1)
list.remove(0);              // O(n)
list.size();                 // O(1)
```

### HashMap

```java
Map<String, Integer> map = new HashMap<>();
map.put("key", 123);         // O(1)
map.get("key");              // O(1)
map.containsKey("key");      // O(1)
map.remove("key");           // O(1)
map.keySet();                // O(1) to create view
```

### HashSet

```java
Set<Integer> set = new HashSet<>();
set.add(5);                  // O(1)
set.contains(5);             // O(1)
set.remove(5);               // O(1)

// No duplicates
set.add(5);  // No effect
set.size();  // Still 1
```

### TreeMap (Sorted)

```java
Map<Integer, String> map = new TreeMap<>();
map.put(5, "five");          // O(log n) - maintains order
map.put(3, "three");
map.put(7, "seven");

map.firstKey();              // 3
map.lastKey();               // 7
map.get(5);                  // "five" in O(log n)
```

### TreeSet (Sorted)

```java
Set<Integer> set = new TreeSet<>();
set.add(5);
set.add(3);
set.add(7);

set.first();                 // 3
set.last();                  // 7
set.lower(5);                // 3
set.higher(5);               // 7
```

### Queue

```java
Queue<Integer> queue = new LinkedList<>();
queue.add(1);                // O(1) - back
queue.poll();                // O(1) - front
queue.peek();                // O(1) - front without remove
queue.size();                // O(1)
```

### Priority Queue (Heap)

```java
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.add(5);                   // O(log n)
pq.add(3);
pq.add(7);

pq.poll();                   // 3 (min-heap default) in O(log n)
pq.peek();                   // 3 without removing

// Max heap
PriorityQueue<Integer> maxPq = 
    new PriorityQueue<>((a, b) -> b - a);
maxPq.poll();                // 7
```

### Stack

```java
Stack<Integer> stack = new Stack<>();
stack.push(5);               // O(1)
stack.pop();                 // O(1)
stack.peek();                // O(1) without removing
stack.size();                // O(1)
```

### LinkedList

```java
List<Integer> list = new LinkedList<>();
list.add(5);                 // O(1)
list.addFirst(3);            // O(1)
list.addLast(7);             // O(1)
list.get(0);                 // O(n) - linear search
list.removeFirst();          // O(1)
list.removeLast();           // O(1)
```

## Useful Methods

### Sorting

```java
List<Integer> list = new ArrayList<>();
Collections.sort(list);      // O(n log n)

// Reverse order
Collections.sort(list, Collections.reverseOrder());

// Custom comparator
Collections.sort(list, (a, b) -> b - a);  // Descending
```

### Array Utilities

```java
int[] arr = {3, 1, 4, 1, 5};
Arrays.sort(arr);            // O(n log n)
Arrays.fill(arr, 0);         // Fill with 0
Arrays.binarySearch(arr, 4); // O(log n) - sorted array only
```

### String Builder

```java
StringBuilder sb = new StringBuilder();
sb.append("Hello");          // O(1) amortized
sb.append(" ");
sb.append("World");
String result = sb.toString(); // O(1)

// Better than += for loops
```

## Common Patterns

### Counting Frequencies

```java
Map<Character, Integer> freq = new HashMap<>();
for (char c : s.toCharArray()) {
    freq.put(c, freq.getOrDefault(c, 0) + 1);
}

// Or with Lambda (Java 8+)
Map<Character, Integer> freq = new HashMap<>();
for (char c : s.toCharArray()) {
    freq.merge(c, 1, Integer::sum);
}
```

### Group by Key

```java
List<Person> people = ...;
Map<String, List<Person>> grouped = 
    people.stream()
          .collect(Collectors.groupingBy(Person::getCity));
```

### Sort Objects

```java
class Person implements Comparable<Person> {
    public int compareTo(Person other) {
        return this.age - other.age;  // Natural order
    }
}

Collections.sort(people);  // Uses compareTo

// Or with custom comparator
Collections.sort(people, 
    (p1, p2) -> p2.getAge() - p1.getAge());  // Descending
```

## Interview Tips

✓ Use ArrayList for most cases
✓ Use HashMap for key-value lookups
✓ Use HashSet for uniqueness
✓ Use PriorityQueue for heap problems
✓ Use TreeMap for sorted requirements
✓ Use StringBuilder for string concatenation
✓ Know time complexity of each operation

❌ Don't use ArrayList for frequent removals
❌ Don't use HashMap if order matters (use LinkedHashMap)
❌ Don't concatenate strings in loops (use StringBuilder)
❌ Don't forget null checks in Maps

## Quick Reference

```
List: ArrayList (fast random access)
Set: HashSet (uniqueness), TreeSet (sorted)
Map: HashMap (fast lookup), TreeMap (sorted)
Queue: LinkedList, PriorityQueue (heap)
Stack: Stack or LinkedList
```

---

**Next:** Python built-ins for interviews.
