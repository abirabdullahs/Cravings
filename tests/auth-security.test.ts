import assert from "node:assert/strict";
import test from "node:test";

import {
  sanitizePublicRegistrationRole,
  toSafeUserDTO,
  stripBodyUserOverride,
} from "../server/service/auth-security.ts";
import { validateRegistrationInput, validatePhone } from "../server/service/auth.service.ts";
import {
  GET_RESTAURANTS_BY_LOCATION,
  SEARCH_RESTAURANTS_BY_PRODUCT_NAME,
} from "../server/query/customer.query.ts";
import { FIND_BRANCH_EARNINGS } from "../server/query/restaurant.query.ts";

test("public registration always falls back to customer", () => {
  assert.equal(sanitizePublicRegistrationRole("admin"), "customer");
  assert.equal(sanitizePublicRegistrationRole("owner"), "customer");
  assert.equal(sanitizePublicRegistrationRole("rider"), "customer");
  assert.equal(sanitizePublicRegistrationRole("customer"), "customer");
});

test("backend responses strip password hashes", () => {
  const safe = toSafeUserDTO({
    id: 7,
    email: "user@example.com",
    name: "Jane",
    password_hash: "secret",
    role: "customer",
  });

  assert.deepEqual(safe, {
    id: 7,
    email: "user@example.com",
    name: "Jane",
    role: "customer",
  });
});

test("request body user id is ignored for authenticated orders", () => {
  const payload = stripBodyUserOverride({
    userId: "999",
    cartId: 2,
    addressId: 3,
    paymentMethod: "cash",
    idempotencyKey: "123e4567-e89b-12d3-a456-426614174000",
    deliveryInstructions: "Leave at door",
  }, "42");

  assert.equal(payload.userId, "42");
  assert.equal(payload.cartId, 2);
  assert.equal(payload.addressId, 3);
});

test("registration validation rejects malformed payloads and admin role requests", () => {
  const invalid = validateRegistrationInput({
    name: "A",
    email: "bad-email",
    password: "short",
    phone: "abc",
    role: "admin",
  });

  assert.equal(invalid.valid, false);
  assert.match(invalid.errors.email, /valid email/i);
  assert.match(invalid.errors.password, /at least 8/i);
  assert.match(invalid.errors.phone, /valid phone/i);
  assert.match(invalid.errors.role, /Invalid account role/i);
  assert.equal(validatePhone("+1234567890"), true);
  assert.equal(validatePhone("bad"), false);
});

test("customer search queries use the current schema fields", () => {
  assert.match(GET_RESTAURANTS_BY_LOCATION, /area = \$1/i);
  assert.doesNotMatch(GET_RESTAURANTS_BY_LOCATION, /location_area/i);
  assert.match(SEARCH_RESTAURANTS_BY_PRODUCT_NAME, /menu_items/i);
  assert.match(SEARCH_RESTAURANTS_BY_PRODUCT_NAME, /item_name/i);
  assert.doesNotMatch(SEARCH_RESTAURANTS_BY_PRODUCT_NAME, /menuItems|p\.name/i);
  assert.doesNotMatch(FIND_BRANCH_EARNINGS, /sell_inquiry/i);
});
