import crypto from "crypto";

export function verifyToken(token, secret) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    return payload;
  } catch (e) {
    return null;
  }
}

export function getAuthUser(req) {
  const token = req.cookies.get("crowd_token")?.value || req.headers.get("Authorization")?.split(" ")[1] || req.headers.get("authorization")?.split(" ")[1];
  if (!token) return null;

  const secret = process.env.JWT_SECRET || "default_jwt_secret_key_123";
  return verifyToken(token, secret);
}
