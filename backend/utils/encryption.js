import crypto from "crypto";

const algorithm = "aes-256-gcm";
const secretKey = Buffer.from(process.env.MESSAGE_SECRET_KEY, "hex"); // 32 bytes (64 hex chars)
const ivLength = 16;

export function encrypt(text) {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag().toString("hex");

  return { iv: iv.toString("hex"), content: encrypted, tag };
}

export function decrypt({ iv, content, tag }) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(tag, "hex"));

  let decrypted = decipher.update(content, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
