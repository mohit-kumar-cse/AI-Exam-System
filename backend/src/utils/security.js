// C:\AI-Exam-System\backend\src\utils\security.js
import crypto from "crypto";

function stableStringify(data) {
  return JSON.stringify(
    data,
    (_, value) => {
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        return Object.keys(value)
          .sort()
          .reduce((sorted, key) => {
            sorted[key] = value[key];
            return sorted;
          }, {});
      }

      return value;
    }
  );
}

export const generateHash = (data) => {
  return crypto
    .createHash("sha256")
    .update(stableStringify(data))
    .digest("hex");
};

export const generateSignature = (hash) => {
  if (!process.env.SECRET_KEY) {
    throw new Error(
      "SECRET_KEY is not configured"
    );
  }

  return crypto
    .createHmac(
      "sha256",
      process.env.SECRET_KEY
    )
    .update(hash)
    .digest("hex");
};

export const verifySignature = (
  hash,
  signature
) => {
  if (
    !hash ||
    !signature ||
    !process.env.SECRET_KEY
  ) {
    return false;
  }

  const expected =
    generateSignature(hash);

  const expectedBuffer =
    Buffer.from(expected, "hex");

  const receivedBuffer =
    Buffer.from(signature, "hex");

  if (
    expectedBuffer.length !==
    receivedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedBuffer,
    receivedBuffer
  );
};