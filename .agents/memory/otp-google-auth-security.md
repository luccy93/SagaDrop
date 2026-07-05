---
name: OTP + Google OAuth security rules
description: Hardened security constraints for the OTP verification and Google OAuth flows in SagaDrop backend.
---

## Rules

### dev_otp disclosure
Only return `dev_otp` in the `/auth/send-otp` response when `RESEND_API_KEY` env var is **absent**.
If the key is present but sending fails, raise HTTP 503 — never leak the OTP over the wire.

**Why:** An earlier version returned `dev_otp` whenever `sent=False`, which meant a misconfigured or transiently-failing Resend in production would hand attackers the plaintext OTP.

**How to apply:** Check `dev_mode = not os.environ.get("RESEND_API_KEY", "")` before deciding whether to expose the OTP.

---

### OTP verification atomicity
`/auth/verify-otp` uses `find_one_and_update` with `$inc attempts` and filters `attempts < MAX` + `expires_at > now` to atomically claim an attempt slot (returns BEFORE state). The final delete uses `otp_hash` in the filter as a single-use guard — if deleted_count is 0 a concurrent request already consumed the OTP.

**Why:** Separate read-check-delete allowed concurrent requests to both pass before deletion, enabling duplicate signup inserts and OTP reuse.

**How to apply:** Never split find / check / delete into separate non-conditional operations for single-use tokens.

---

### Google OAuth audience validation
Call `https://oauth2.googleapis.com/tokeninfo?access_token=TOKEN` first; check `azp` (or `aud`) matches `GOOGLE_CLIENT_ID` before trusting the userinfo response.

**Why:** `/userinfo` alone only proves the token is valid for *some* Google app — not ours. Without audience check a token minted for a different app could be used.

**How to apply:** Always validate audience before calling userinfo; raise HTTP 401 on mismatch.

---

### Auth cookie security flag
`set_auth_cookies` and the refresh route use `secure=_is_secure_context()` which returns `True` when `REPLIT_DEPLOYMENT` or `FORCE_SECURE_COOKIES` env vars are set.

**Why:** `secure=False` hardcoded would allow cookies to transit plaintext HTTP in deployed environments.

**How to apply:** Any new cookie-setting code should call `_is_secure_context()` from `auth_utils.py`.
