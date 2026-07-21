# Interview Preparation: Whiteboarding Tips & Tricks

**Read time:** 8 min | **Practical:** Yes

## Before You Code

### Clarify the Problem

```
Interviewer: "Design an elevator system"

DON'T code immediately!

Ask questions:
├─ How many floors? (changes complexity)
├─ How many elevators? (single vs. multiple)
├─ Peak capacity? (affects scheduling)
├─ Performance requirements? (latency, throughput)
└─ Edge cases? (power failure, emergency stops?)

Shows: Problem-solving approach, not jumping to solutions
```

### Discuss Approach

```
"I'm thinking of using a state machine to track
elevator state and a priority queue for requests.
This gives us O(log n) insertion and handles
fairness across multiple elevators.
Does that approach sound reasonable?"

Benefits:
├─ Interviewer gives feedback early
├─ Shows you think about trade-offs
└─ Prevents wrong direction entirely
```

## Whiteboarding Technique

### Organize Your Space

```
Left side: Problem statement
Center: Pseudocode / main solution
Right side: Data structures / helper functions
Top: Time/space complexity

Keep it clean and readable
One thing per line
Large enough to read from distance
```

### Code Style

```
✓ Meaningful variable names
✓ Proper indentation
✓ Clear logic flow
✓ Comments for complex parts

❌ Single-letter variables (except loop indices)
❌ Cramped, unreadable writing
❌ No structure or organization
```

### Walk Through Examples

```
Before claiming done:
"Let me trace through an example:
Input: [1, 3, 5, 2, 4]
idx=0: value=1...
idx=1: value=3...
..."

Shows:
├─ You verified your code
├─ You understand the logic
└─ You catch bugs before interviewer does
```

## Common Mistakes

### ❌ Silent Coding

```
Bad: Sit silently for 10 minutes writing code

Good: "I'm going to write the main function first,
      then handle the edge cases"

Talk through your thinking
Helps interviewer follow
Gives feedback opportunities
```

### ❌ Not Testing

```
Bad: "Done! I think it works"

Good: "Let me test this with an example:
      For input [3,1,2]:
      - idx=0, swap with idx=1 → [1,3,2]
      - idx=1, swap with idx=2 → [1,2,3]
      - Result: [1,2,3] ✓"
```

### ❌ Ignoring Edge Cases

```
After main code: "What about edge cases?"

Handle:
├─ Empty input: []
├─ Single element: [1]
├─ Already sorted: [1,2,3]
├─ Reverse sorted: [3,2,1]
├─ Duplicates: [1,1,1]
└─ Negative numbers: [-3, -1, 0]

Show you're thorough
```

### ❌ Not Explaining Complexity

```
Bad: Finish code, stay silent

Good: "This is O(n log n) time because we sort,
      and O(1) space since we sort in-place.
      If we needed to preserve the original array,
      it would be O(n) space."

Shows understanding of resource usage
```

## Optimization Path

```
Phase 1: Get it working
- Correct algorithm
- Handles all cases
- Clear code

Phase 2: Optimize
- Better time complexity?
- Better space complexity?
- More elegant solution?

Never skip Phase 1 for Phase 2!
Working > perfect but broken
```

## Handling Mistakes

### When You Get Stuck

```
Don't panic or erase everything

Say: "I realize this approach has an issue with [X].
     Let me think through this differently..."

Rethink openly:
- Brainstorm with interviewer
- Ask for hints
- Change approach
```

### When Interviewer Hints

```
Listen carefully to hints
They're trying to help you
Integrate hint into your approach

Bad: Ignore hint and keep going
Good: "Ah, I see! So I should use a heap here
      to efficiently get the min element"
```

### When Code Doesn't Work

```
Don't give up!

Debug:
- Trace through example again
- Check boundary conditions
- Look for off-by-one errors
- Verify data structure operations

Say: "Let me debug this...
     Ah! I see the issue - this should be i+1 not i"
```

## Time Management

```
60-minute interview:

0-5 min: Clarify problem, discuss approach
5-25 min: Write main algorithm
25-35 min: Handle edge cases
35-45 min: Test with examples
45-55 min: Optimize (if time)
55-60 min: Ask questions, clarify

Leave buffer for questions at end
Don't code frantically until last second
```

## Communication

### Explain your thinking

```
"For this problem, I need to track state,
so I'll use a dictionary to map [X] to [Y]"

"The bottleneck here is lookup, which is O(n),
so I'll use a hash set for O(1) lookup"

"Edge case: empty input. I should return [empty]"
```

### Ask for feedback

```
"Does this approach make sense?"
"Should I optimize this further?"
"Are there edge cases I'm missing?"

Shows:
- Confidence but not arrogance
- Collaborative approach
- Interest in interviewer's thoughts
```

## Template (Safe Approach)

```
1. Clarify (3 min)
   "Let me make sure I understand:
   Input: [details]
   Output: [details]
   Constraints: [details]"

2. Approach (2 min)
   "My approach: [explain algorithm]
   Time: O(...), Space: O(...)"

3. Code (15 min)
   Write clearly, talk through it

4. Test (5 min)
   "Let me verify with an example..."

5. Optimize (5 min)
   "Can we do better? We could [X]..."

6. Clarify (5 min)
   Answer any questions
```

---

**Final article:** Comprehensive mock interview walkthrough.
