import assert from "node:assert/strict";
import test from "node:test";

import {
  sanitizePublicRegistrationRole,
  toSafeUserDTO,
  stripBodyUserOverride,
} from "../server/service/auth-security.ts";

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
