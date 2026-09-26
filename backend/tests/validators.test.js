import { describe, it, expect } from "vitest";
import {
  isValidEmail,
  isValidPassword,
  isValidUrl,
  isValidUsername,
} from "../src/utils/validators.js";

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

  it("returns false for an email containing uppercase letters", () => {
    expect(isValidEmail("User@Example.com")).toBe(false);
  });

  it("returns false when a non-string value is provided", () => {
    expect(isValidEmail(123)).toBe(false);
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

describe("isValidUsername", () => {
  it("returns true when username is not an empty string or only space characters", () => {
    expect(isValidUsername("_valid-Username0123_")).toBe(true);
  });

  it("returns false when username is an empty string", () => {
    expect(isValidUsername("")).toBe(false);
  });

  it("returns false when username is only space characters", () => {
    expect(isValidUsername("   ")).toBe(false);
  });

  it("returns false when a number is provided for the username", () => {
    expect(isValidUsername(123)).toBe(false);
  });

  it("returns false when username containst disallowed characters", () => {
    expect(isValidUsername("test!")).toBe(false);
  });

  it("returns false when username is longer then maximum allowed length", () => {
    expect(isValidUsername("testtesttesttesttesttesttesttest")).toBe(false);
  });

  it("returns false when username is shorter then minimum length allowed", () => {
    expect(isValidUsername("te")).toBe(false);
  });
});

describe("isValidUrl", () => {
  it("returns true when provided url meets all criteria", () => {
    expect(isValidUrl("https://www.example.com")).toBe(true);
  });

  it("returns true when provided url has untrimmed white spaces", () => {
    expect(isValidUrl(" https://www.example.com  ")).toBe(true);
  });

  it("returns false when provided value is not typeof string", () => {
    expect(isValidUrl(123)).toBe(false);
    expect(isValidUrl(null)).toBe(false);
    expect(isValidUrl(undefined)).toBe(false);
  });

  it("returns false when provided url is longer than or equal to upper bound (2048)", () => {
    const url =
      "https://example.com/?q=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    expect(isValidUrl(url)).toBe(false);
  });

  it("returns false when provided url is not http or https protocol", () => {
    expect(isValidUrl("file:///C:/folder/file.txt")).toBe(false);
  });

  it("returns false when url is malformed or missing protocol", () => {
    expect(isValidUrl("www.example.com")).toBe(false);
    expect(isValidUrl("not-a-url")).toBe(false);
  });
});
