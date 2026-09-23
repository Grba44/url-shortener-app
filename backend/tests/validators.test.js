import { describe, it, expect } from "vitest";
import { isValidEmail, isValidPassword } from "../src/utils/validators.js";

describe("isValidEmail", () => {
  it("returns true for a valid email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("returns false for an email without an @ character", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
  });

  it("returns false for an email without a dot", () => {
    expect(isValidEmail("user@example")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });
});

describe("isValidPassword", () => {
  it("returns true for the password that checks all criteria", () => {
    expect(isValidPassword("Mv1!Mv1!")).toBe(true);
  });

  it("returns false for the password without an upper character", () => {
    expect(isValidPassword("mv1!mv1!")).toBe(false);
  });

  it("returns false for the password without a lower character", () => {
    expect(isValidPassword("MV1!MV1!")).toBe(false);
  });

  it("returns false for the password without a digit", () => {
    expect(isValidPassword("Mv!Mv!Mv!")).toBe(false);
  });

  it("returns false for the password without a special character", () => {
    expect(isValidPassword("Mv1Mv1Mv1")).toBe(false);
  });

  it("returns false for the password shorter than 8 characters", () => {
    expect(isValidPassword("Mv1!")).toBe(false);
  });

  // Bcrypt has a hard limit of 72 bytes; passwords exceeding this are truncated,
  // so we reject anything longer than 71 characters to ensure security.
  it("returns false when password is exactly 72 characters (equal to the upper bound)", () => {
    expect(
      isValidPassword(
        "Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!",
      ),
    ).toBe(false);
  });

  it("returns true for the password 71 characters long (max length allowed)", () => {
    expect(
      isValidPassword(
        "Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1!Mv1",
      ),
    ).toBe(true);
  });
});
