# Security Specification for WordLand Adventure

## Data Invariants
1. A user's XP and Level must never be negative.
2. A user's `uid` must be immutable and match their Auth UID.
3. Users can only modify their own profile data.
4. Admins can manage all user profiles.
5. Leaderboard data (xp, level, displayName, photoURL) is publicly readable to allow guest users to see rankings.
6. Sensitive fields (like role) are immutable by the user and can only be set via administrative processes (or initial registration with restricted values).

## The Dirty Dozen (Attacker Payloads)

1. **Identity Spoofing**: Logged in as User A, try to update User B's profile.
2. **XP Injection**: Try to update XP with a non-numeric value (e.g. 1MB string).
3. **Price Manipulation**: Try to update `starCoins` to a negative value.
4. **UID Hijacking**: Try to update a profile and change the `uid` field to a different UID.
5. **Role Escalation**: Try to update `role` to 'admin'.
6. **Orphaned Writes**: Try to create a user profile without a UID.
7. **Resource Exhaustion**: Try to set `displayName` to a 1MB string.
8. **Impersonation**: Try to read another user's private data (if we had any) without being authenticated.
9. **State Shortcutting**: Skip level requirements (not strictly enforceable via rules here but we can restrict write access).
10. **Shadow Updates**: Update a whitelisted key and include an extra "isVerified: true" field.
11. **Negative Hearts**: Try to set hearts to -1.
12. **Unauthorized Deletion**: Try to delete another user's account without being an admin.

## The Test Runner
Tests will verify that all "Dirty Dozen" payloads return PERMISSION_DENIED.
