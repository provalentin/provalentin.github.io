# API Design & REST Principles

**Read time:** 13 min | **Difficulty:** Medium

## What is an API?

API (Application Programming Interface) is a contract between client and server defining how they communicate.

## REST Principles

REST (Representational State Transfer) is an architectural style for designing networked applications.

### 6 Constraints

**1. Client-Server Architecture**
- Client and server separated
- Independent evolution
- Client initiates requests

**2. Statelessness**
- Server doesn't store client context
- Each request is independent
- Enables horizontal scaling

```
Request 1: GET /users/123
Request 2: GET /users/123
Same client, no stored state
Both requests complete independently
```

**3. Uniform Interface**
- Consistent API design
- Predictable endpoints
- Standard request/response format

**4. Cacheability**
- Responses labeled cacheable/non-cacheable
- Reduce load, improve performance

**5. Layered System**
- Clients don't know if connected directly to end server
- Allows intermediate proxies/caches
- Improves scalability

**6. Code on Demand (Optional)**
- Server can extend client functionality
- Example: JavaScript sent to browser
- Rarely used in modern APIs

## HTTP Methods

| Method | Purpose | Idempotent? | Safe? |
|--------|---------|-------------|-------|
| GET | Retrieve resource | Yes | Yes |
| POST | Create resource | No | No |
| PUT | Replace resource | Yes | No |
| PATCH | Partial update | No* | No |
| DELETE | Remove resource | Yes | No |

*PATCH is idempotent only if implemented that way

### Examples

```
GET /api/users/123
→ Retrieve user 123 data

POST /api/users
{"name": "Alice", "email": "alice@example.com"}
→ Create new user

PUT /api/users/123
{"name": "Alice", "age": 30}
→ Replace user 123 completely

PATCH /api/users/123
{"age": 30}
→ Update only age field

DELETE /api/users/123
→ Delete user 123
```

## RESTful URL Design

### Resources, not Actions

```
❌ Bad (RPC-style):
GET /getUser/123
POST /createUser
DELETE /removeUser/123

✓ Good (REST):
GET /users/123
POST /users
DELETE /users/123
```

### Hierarchical Resources

```
GET /users/123/posts
→ Get all posts by user 123

GET /users/123/posts/456
→ Get post 456 by user 123

POST /users/123/posts
→ Create new post for user 123

DELETE /users/123/posts/456
→ Delete post 456 from user 123
```

### Query Parameters for Filtering

```
GET /posts?author=alice&limit=10&offset=20
→ Get 10 posts by alice, starting at offset 20

GET /users?status=active&role=admin
→ Get active users with admin role
```

## Response Format

### Success Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "id": 123,
    "name": "Alice",
    "email": "alice@example.com"
  }
}
```

### List Response with Pagination

```json
{
  "status": "success",
  "data": [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"}
  ],
  "pagination": {
    "total": 100,
    "limit": 10,
    "offset": 0
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Email format is invalid"
  }
}
```

## HTTP Status Codes

### 2xx Success
- 200 OK: Success, return data
- 201 Created: Resource created
- 204 No Content: Success, no data

### 3xx Redirection
- 301 Moved Permanently: Resource moved
- 304 Not Modified: Use cached version

### 4xx Client Error
- 400 Bad Request: Invalid input
- 401 Unauthorized: Authentication needed
- 403 Forbidden: Authenticated but not allowed
- 404 Not Found: Resource doesn't exist
- 429 Too Many Requests: Rate limited

### 5xx Server Error
- 500 Internal Server Error: Server bug
- 503 Service Unavailable: Maintenance

## Versioning

### URL Versioning
```
GET /api/v1/users/123
GET /api/v2/users/123
```

Pros: Clear separation
Cons: Maintain multiple versions

### Header Versioning
```
GET /api/users/123
Accept: application/vnd.myapp.v2+json
```

Pros: Same URL, cleaner
Cons: Less obvious

### Deprecation
```
API v1 deprecated
│ → v2 released
│ → v1 sunset date announced (6 months)
│ → v1 shut down
```

## Authentication & Authorization

### API Keys
```
GET /api/users?api_key=abc123
Simple but not secure (exposed in URL)
```

### Bearer Tokens (JWT)
```
GET /api/users
Authorization: Bearer eyJhbGc...
More secure, token in header
```

### OAuth 2.0
```
1. Redirect to auth provider
2. User approves
3. Get token
4. Use token for API calls
```

## Rate Limiting

Prevent abuse, protect server:

```
Rate limit: 1000 requests/hour per user

Headers:
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
```

## Caching Headers

```
GET /api/users/123
Response Headers:
Cache-Control: max-age=3600  # cache 1 hour
ETag: "abc123"              # version identifier

Next request (within 1 hour):
If-None-Match: "abc123"     # has changed?
Response: 304 Not Modified  # no change, use cache
```

## CORS (Cross-Origin Resource Sharing)

Allow browsers to make cross-origin requests:

```
Browser requests from example.com
To: api.example.com

Server response headers:
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT
```

## API Documentation

Essential for adoption:

```
GET /api/users/{id}
├─ Description: Retrieve user by ID
├─ Parameters: id (int, required)
├─ Response: 
│  ├─ 200: User object
│  ├─ 404: User not found
│  └─ 500: Server error
└─ Example:
   GET /api/users/123
   →
   {
     "id": 123,
     "name": "Alice",
     "email": "alice@example.com"
   }
```

Tools: Swagger/OpenAPI, Postman

## Pagination

Handle large datasets:

```
Offset-based:
GET /api/posts?limit=10&offset=20
Simple but inefficient with deletes

Cursor-based:
GET /api/posts?limit=10&cursor=abc123
More efficient for large datasets
```

## Interview Tips

✓ Design RESTful URLs (resources, hierarchy)
✓ Choose appropriate HTTP methods
✓ Discuss versioning strategy
✓ Address authentication/authorization
✓ Include pagination for lists
✓ Document error responses clearly
✓ Mention rate limiting

❌ Don't use verbs in URLs
❌ Don't ignore status codes
❌ Don't forget pagination
❌ Don't skip documentation

---

**Next:** Monitoring, logging, and observability.
