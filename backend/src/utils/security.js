// backend/src/utils/security.js
import crypto from "crypto";
function stableStringify(data) {
  return JSON.stringify(data, (_, value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return Object.keys(value).sort().reduce((sorted, key) => {
        sorted[key] = value[key];
        return sorted;
      }, {});
    }
    return value;
  });
}

// ── Generate SHA256 hash ──────────────────────────────────────────────────────
export const generateHash = (data) => {
  return crypto
    .createHash("sha256")
    .update(stableStringify(data))
    .digest("hex");
};

// ── Generate HMAC signature ───────────────────────────────────────────────────
export const generateSignature = (hash) => {
  return crypto
    .createHmac("sha256", process.env.SECRET_KEY)
    .update(hash)
    .digest("hex");
};

// ── Verify HMAC signature ─────────────────────────────────────────────────────
export const verifySignature = (hash, signature) => {
  const expected = generateSignature(hash);
  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(signature, "hex")
  );
};