# Concurrency Problems (Advanced)

**Read time:** 11 min | **Difficulty:** Hard | **Video:** 16 min

## Print in Order

Threads print sequence, but may arrive out of order.

```python
class Foo:
    def __init__(self):
        self.first_done = threading.Event()
        self.second_done = threading.Event()
    
    def first(self, printFirst):
        printFirst()
        self.first_done.set()
    
    def second(self, printSecond):
        self.first_done.wait()
        printSecond()
        self.second_done.set()
    
    def third(self, printThird):
        self.second_done.wait()
        printThird()
```

## Key Patterns

1. **Semaphore** - Control access count
2. **Mutex/Lock** - Exclusive access
3. **Condition variable** - Wait for condition
4. **Barrier** - Wait for all threads
5. **Atomic operations** - Lock-free updates

---

**Key:** Use appropriate synchronization primitive for the problem.
