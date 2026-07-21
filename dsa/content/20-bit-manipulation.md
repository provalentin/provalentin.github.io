# Bit Manipulation

**Read time:** 13 min | **Difficulty:** Hard | **Video:** 17 min

## Bitwise Operations

```python
# AND (&): Both bits 1
a & b

# OR (|): Either bit 1
a | b

# XOR (^): Bits different
a ^ b

# NOT (~): Flip all bits
~a

# Left shift (<<): Multiply by 2
a << 1  # a * 2

# Right shift (>>): Divide by 2
a >> 1  # a // 2
```

## Common Tricks

**Check if power of 2:**
```python
def is_power_of_2(n):
    return n > 0 and (n & (n - 1)) == 0
# 8 & 7 = 0b1000 & 0b0111 = 0 ✓
```

**Get nth bit:**
```python
def get_nth_bit(n, i):
    return (n >> i) & 1
```

**Set nth bit:**
```python
def set_nth_bit(n, i):
    return n | (1 << i)
```

**Clear nth bit:**
```python
def clear_nth_bit(n, i):
    return n & ~(1 << i)
```

**Swap two numbers:**
```python
a ^= b
b ^= a
a ^= b
```

**Count set bits:**
```python
def count_bits(n):
    count = 0
    while n:
        count += n & 1
        n >>= 1
    return count
```

## Key Problems

1. **Single Number** - XOR all, duplicates cancel
2. **Hamming Distance** - Count differing bits with XOR
3. **Number of 1 Bits** - Count set bits
4. **Reverse Bits** - Flip bit order
5. **Power of Four** - Check using bits

---

**Key:** XOR for toggling, AND for masking, bit shifts for multiplication/division.
