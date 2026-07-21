# Advanced DSA: Math & Number Theory for Interviews

**Read time:** 10 min | **Reference:** Yes

## Prime Numbers

### Sieve of Eratosthenes

```python
def sieve(n):
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    
    for i in range(2, int(n**0.5) + 1):
        if is_prime[i]:
            for j in range(i*i, n + 1, i):
                is_prime[j] = False
    
    return [i for i in range(n + 1) if is_prime[i]]

Time: O(n log log n)
Space: O(n)
```

### Primality Testing

```python
# Simple: O(√n)
def is_prime(n):
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    for i in range(3, int(n**0.5) + 1, 2):
        if n % i == 0:
            return False
    return True

# Miller-Rabin: O(k log n) - probabilistic
# Use for large numbers
```

## GCD & LCM

### Greatest Common Divisor (Euclidean)

```python
def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

# Or recursively
def gcd(a, b):
    return a if b == 0 else gcd(b, a % b)

Time: O(log(min(a, b)))
```

### Least Common Multiple

```python
def lcm(a, b):
    return (a * b) // gcd(a, b)

Property: a * b = gcd(a, b) * lcm(a, b)
```

## Modular Arithmetic

### Modular Exponentiation

```python
def mod_exp(base, exp, mod):
    result = 1
    base = base % mod
    while exp > 0:
        if exp % 2 == 1:
            result = (result * base) % mod
        exp = exp >> 1
        base = (base * base) % mod
    return result

Time: O(log exp)
Use: Large numbers, avoid overflow
```

### Modular Inverse

```python
# Using Fermat's Little Theorem (p is prime)
def mod_inverse(a, p):
    return mod_exp(a, p - 2, p)

# Using Extended Euclidean Algorithm
def extended_gcd(a, b):
    if a == 0:
        return b, 0, 1
    gcd, x1, y1 = extended_gcd(b % a, a)
    x = y1 - (b // a) * x1
    y = x1
    return gcd, x, y

def mod_inverse(a, m):
    gcd, x, _ = extended_gcd(a, m)
    return (x % m + m) % m if gcd == 1 else None
```

## Combinatorics

### Factorial & Combinations

```python
# n! mod p (with modular arithmetic)
def factorial_mod(n, p):
    result = 1
    for i in range(2, n + 1):
        result = (result * i) % p
    return result

# C(n, k) = n! / (k! * (n-k)!)
def combination(n, k):
    if k > n - k:
        k = n - k
    result = 1
    for i in range(k):
        result = result * (n - i) // (i + 1)
    return result

# Optimized with precomputed factorials
fact = [1] * (n + 1)
for i in range(1, n + 1):
    fact[i] = fact[i - 1] * i

def C(n, k):
    return fact[n] // (fact[k] * fact[n - k])
```

## Number Theory

### Fibonacci

```python
# Matrix exponentiation: O(log n)
def fibonacci(n):
    def matrix_mult(a, b):
        return [
            [a[0][0]*b[0][0] + a[0][1]*b[1][0], a[0][0]*b[0][1] + a[0][1]*b[1][1]],
            [a[1][0]*b[0][0] + a[1][1]*b[1][0], a[1][0]*b[0][1] + a[1][1]*b[1][1]]
        ]
    
    def matrix_pow(m, n):
        if n == 1:
            return m
        if n % 2 == 0:
            half = matrix_pow(m, n // 2)
            return matrix_mult(half, half)
        else:
            return matrix_mult(m, matrix_pow(m, n - 1))
    
    if n == 1:
        return 1
    return matrix_pow([[1, 1], [1, 0]], n)[0][1]

Time: O(log n)
```

### Digit Manipulation

```python
# Sum of digits
def digit_sum(n):
    return sum(int(d) for d in str(n))

# Reverse number
def reverse(n):
    result = 0
    while n > 0:
        result = result * 10 + n % 10
        n //= 10
    return result

# Count digits
def digit_count(n):
    return len(str(n))

# Check palindrome
def is_palindrome(n):
    return str(n) == str(n)[::-1]
```

## Bit Manipulation Math

```python
# Count set bits
def count_bits(n):
    count = 0
    while n:
        count += n & 1
        n >>= 1
    return count
# Or: bin(n).count('1')

# Check power of 2
def is_power_of_2(n):
    return n > 0 and (n & (n - 1)) == 0

# Find highest set bit
def highest_bit(n):
    return n.bit_length() - 1

# XOR properties
# a ^ a = 0
# a ^ 0 = a
# a ^ b ^ b = a
# XOR finds unique element when others appear twice
```

## Quick Reference

| Problem | Time | Method |
|---------|------|--------|
| Prime check | O(√n) | Trial division |
| GCD | O(log n) | Euclidean algorithm |
| Sieve of primes | O(n log log n) | Sieve |
| Fibonacci | O(log n) | Matrix exponentiation |
| Combinations | O(n) | Precomputed factorial |
| Mod exp | O(log n) | Binary exponentiation |

---

**Next:** Binary search comprehensive guide.
