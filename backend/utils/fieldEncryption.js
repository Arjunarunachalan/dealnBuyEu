import crypto from "crypto";

/**
 * GDPR At-Rest Field Encryption
 * Uses AES-256-CBC with a deterministic IV derived from the plaintext
 * so that findOne({ email: encryptField(email) }) works for lookups.
 */

const ALGORITHM = "aes-256-cbc";

const getKey = () => {
  const key = process.env.FIELD_ENCRYPTION_KEY || "default_field_key_change_in_production!!";
  // Ensure key is exactly 32 bytes for AES-256
  return crypto.createHash("sha256").update(String(key)).digest();
};

/**
 * Generates a deterministic IV from the plaintext.
 * This allows encrypted values to be searchable (same input → same output).
 */
const getDeterministicIV = (plainText) => {
  return crypto.createHash("md5").update(String(plainText)).digest();
};

/**
 * Encrypts a plaintext field value for storage in the database.
 * @param {string} plainText - the value to encrypt
 * @returns {string} - hex-encoded encrypted string
 */
export const encryptField = (plainText) => {
  if (!plainText) return plainText;
  try {
    const iv = getDeterministicIV(plainText);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    let encrypted = cipher.update(String(plainText), "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("Field encryption error:", error.message);
    throw error;
  }
};

/**
 * Decrypts a previously encrypted field value.
 * @param {string} encryptedText - the hex-encoded encrypted string
 * @returns {string} - the original plaintext
 */
export const decryptField = (encryptedText) => {
  if (!encryptedText || !encryptedText.includes(":")) return encryptedText;
  try {
    const [ivHex, encrypted] = encryptedText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Field decryption error:", error.message);
    return encryptedText; // Return as-is if decryption fails (backward compat)
  }
};
