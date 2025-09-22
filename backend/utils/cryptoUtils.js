// utils/cryptoUtils.js
import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.CHAT_SECRET_KEY, "hex"); // 32-byte key
const ivLength = 16;

export function encrypt(text) {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted; // "iv:ciphertext"
}

export function decrypt(cipherText) {
  if (!cipherText) return "";

  const [ivHex, encryptedData] = cipherText.split(":");
  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
