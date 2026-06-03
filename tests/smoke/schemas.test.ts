import assert from "node:assert/strict";
import test from "node:test";
import { contactPayloadSchema } from "@/lib/contact-schema";
import { scanRequestSchema } from "@/lib/scan-schema";

test("contact schema accepts valid payload", () => {
  const result = contactPayloadSchema.safeParse({
    name: "Jonas Jonaitis",
    email: "jonas@example.com",
    message: "Noriu sužinoti apie SEO auditą.",
  });
  assert.equal(result.success, true);
});

test("contact schema rejects invalid email", () => {
  const result = contactPayloadSchema.safeParse({
    name: "Jonas",
    email: "jonas-at-example.com",
    message: "Labas",
  });
  assert.equal(result.success, false);
});

test("scan schema accepts public https url", () => {
  const result = scanRequestSchema.safeParse({
    url: "https://example.com",
    strategy: "desktop",
  });
  assert.equal(result.success, true);
});

test("scan schema rejects private localhost url", () => {
  const result = scanRequestSchema.safeParse({
    url: "http://localhost:3000",
    strategy: "mobile",
  });
  assert.equal(result.success, false);
});
