# Cravings Flow Documentation

## Auth and Role Lifecycle

1. A customer registers normally. The user is persisted with `users.role = 'customer'`.
2. A rider or restaurant owner registration also starts as a customer. The requested role is stored in `role_requests` with `status = 'PENDING'` and verification data in `verification_data`.
3. Protected rider and owner routes consult the latest role request. A pending request redirects to `/pending-approval`; an absent, rejected, or mismatched request redirects to `/unauthorized`.
4. An administrator approves the request through `/api/admin/requests`. Approval updates `users.role` to the requested role and provisions an idempotent rider or restaurant-owner profile.
5. Rider provisioning creates or updates `riders` with `status = 'offline'` and `is_approved = true`. Owner provisioning creates the initial `restaurant_owners` row; restaurants can then reference that user as their owner.
6. NextAuth uses JWT sessions, but its JWT callback refreshes the user from the database on subsequent auth reads. An approved role therefore replaces the old customer role without re-registration.

## Middleware Route Rules

| Route | Rule |
| --- | --- |
| Public pages and `/` | Available to anonymous users; `/` redirects signed-in staff to their dashboard. |
| `/complete-profile` | Only available while the signed-in profile is incomplete. |
| `/admin` | Requires `admin`. |
| `/rider` | Requires `rider` plus an approved rider request. |
| `/restaurant` and `/owner` | Requires `owner` plus an approved owner request. |
| Protected partner route with a matching `PENDING` request | Redirects to `/pending-approval`. |
| Protected route with no valid role/request | Redirects to `/unauthorized`. |

## Notification Architecture

Frontend notification reads and mutations use `hooks/useNotifications.ts`, backed by `/api/notifications`. `useNotifications` polls every 15 seconds and refetches on window focus. Read mutations invalidate the same query key.

Backend notification creation goes through `server/service/notification.service.ts` and its repository. Admin broadcasts select their audience and call `createNotification` for each recipient. Notification payloads are returned in camelCase; database columns remain snake_case.

## Database Entities

```text
users (1) ----< role_requests
users (1) ----< riders
users (1) ----< restaurant_owners
users (1) ----< notifications >---- (0..1) orders
```

`role_requests.user_id` records the applicant and `requested_role` is limited to `owner` or `rider`. Approval is the transition point that changes `users.role` and creates the matching profile. The migration `schema/20260918_role_profile_notification_alignment.sql` adds the profile columns/table and indexes required by this flow.