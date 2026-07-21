# Advanced DP: State Machine

**Read time:** 14 min | **Difficulty:** Hard | **Video:** 20 min

## State Machine DP

Use multiple states to track different scenarios.

## Stock Trading with Transaction Limit

**Problem:** Max profit with at most k transactions.

```python
def maxProfit(k, prices):
    if not prices or k == 0:
        return 0
    
    if k >= len(prices) // 2:
        # Unlimited transactions
        return sum(prices[i+1] - prices[i] 
                  for i in range(len(prices)-1) 
                  if prices[i+1] > prices[i])
    
    # dp[i][j][0/1] = max profit on day i, j transactions, not holding/holding stock
    dp = [[[0, 0] for _ in range(k+1)] for _ in range(len(prices))]
    
    # Initialize: day 0, holding stock
    for j in range(1, k+1):
        dp[0][j][1] = -prices[0]
    
    # Fill table
    for i in range(1, len(prices)):
        for j in range(1, k+1):
            # Not holding: either skip or sell
            dp[i][j][0] = max(dp[i-1][j][0], dp[i-1][j][1] + prices[i])
            
            # Holding: either skip or buy (counts as transaction)
            dp[i][j][1] = max(dp[i-1][j][1], dp[i-1][j-1][0] - prices[i])
    
    return dp[-1][k][0]

# Time: O(n*k)
# Space: O(n*k)
```

## Stock with Cooldown

**Problem:** Max profit with 1-day cooldown after selling.

```python
def maxProfit(prices):
    if not prices:
        return 0
    
    # States: hold, sold (in cooldown), rest
    hold = -prices[0]
    sold = 0
    rest = 0
    
    for price in prices[1:]:
        # New states
        new_hold = max(hold, rest - price)  # Buy or skip
        new_sold = hold + price              # Sell
        new_rest = max(rest, sold)           # Cooldown or rest
        
        hold, sold, rest = new_hold, new_sold, new_rest
    
    return max(sold, rest)

# Time: O(n)
# Space: O(1)
```

## Key Pattern

1. **Define states** - What scenarios exist?
2. **State transitions** - How to move between states?
3. **Fill DP table** - Apply transitions systematically
4. **Return answer** - Usually final state or maximum

## Common State Machine Problems

1. Stock trading with cooldown
2. Stock trading with k transactions
3. House robber with cooldown
4. Paint houses with cost transitions
5. Best time to buy/sell with transaction fee

---

**Key:** Multiple states allow modeling complex constraints elegantly.
