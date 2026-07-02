# SagaDrop Auth Testing Playbook

## Credentials
See `/app/memory/test_credentials.md`.
- Admin: admin@sagadrop.com / SagaAdmin@2026

## Step 1: MongoDB Verification
```
mongosh
use test_database
db.users.find({role: "admin"}).pretty()
db.users.findOne({role: "admin"}, {password_hash: 1})
```
Verify: bcrypt hash starts with `$2b$`, unique index on users.email, index on login_attempts.identifier.

## Step 2: API Testing (cookies)
```
curl -c cookies.txt -X POST http://localhost:8001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@sagadrop.com","password":"SagaAdmin@2026"}'
cat cookies.txt
curl -b cookies.txt http://localhost:8001/api/auth/me
```
Login returns the user object and sets `access_token` + `refresh_token` httpOnly cookies. `/me` returns the same user.

## Endpoints
- POST /api/auth/register {name, email, password}
- POST /api/auth/login {email, password}
- POST /api/auth/logout
- GET  /api/auth/me
- POST /api/auth/refresh
- GET  /api/auth/state (persisted cart/wishlist)
- PUT  /api/auth/state {cart:[], wishlist:[]}

## Brute force
5 failed logins for the same ip:email → 429 lockout for 15 minutes.
