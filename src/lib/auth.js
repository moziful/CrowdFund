import crypto from "crypto";

export function verifyToken(token, secret) {
  try {
    let cleanToken = token.trim();
    
    // Strip outer double-quotes if JSON-stringified on client-side
    if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
      cleanToken = cleanToken.slice(1, -1);
    }
    
    // Parse JSON object wrappers if token was saved inside a structure
    if (cleanToken.startsWith("{")) {
      try {
        const parsed = JSON.parse(cleanToken);
        cleanToken = parsed.token || parsed.crowd_token || cleanToken;
      } catch (jsonErr) {}
    }

    console.log("verifyToken - Input token:", cleanToken);

    // Development support: bypass signature checks for simulated test profiles
    if (cleanToken === "google-mock-jwt-token") {
      return { id: "google_12345", name: "Google Backer", email: "google.backer@gmail.com", role: "Supporter" };
    }
    if (cleanToken === "mock-jwt-token-12345") {
      return { id: "mock_admin", name: "Alex Admin", email: "admin@crowd.com", role: "Admin" };
    }
    if (cleanToken.startsWith("mock-jwt-token-")) {
      const role = cleanToken.replace("mock-jwt-token-", "");
      if (role === "Supporter") {
        return { id: "mock_supporter", name: "Sam Supporter", email: "supporter@crowd.com", role: "Supporter" };
      }
      if (role === "Creator") {
        return { id: "mock_creator", name: "Chris Creator", email: "creator@crowd.com", role: "Creator" };
      }
      if (role === "Admin") {
        return { id: "mock_admin", name: "Alex Admin", email: "admin@crowd.com", role: "Admin" };
      }
    }

    const parts = cleanToken.split(".");
    if (parts.length !== 3) {
      console.log("verifyToken - Invalid JWT format parts length:", parts.length);
      return null;
    }

    const [headerB64, payloadB64, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest("base64url");

    if (signature !== expectedSignature) {
      console.log("verifyToken - Signature mismatch.");
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    console.log("verifyToken - Verified payload:", payload);
    return payload;
  } catch (e) {
    console.error("verifyToken - Exception:", e);
    return null;
  }
}

export function getAuthUser(req) {
  const cookieToken = req.cookies.get("crowd_token")?.value;
  const headerToken = req.headers.get("Authorization")?.split(" ")[1] || req.headers.get("authorization")?.split(" ")[1];
  const token = cookieToken || headerToken;
  console.log("getAuthUser - cookieToken:", cookieToken, "headerToken:", headerToken);

  if (!token) {
    console.log("getAuthUser - No token found in request.");
    return null;
  }

  const secret = process.env.JWT_SECRET || "default_jwt_secret_key_123";
  const verified = verifyToken(token, secret);
  console.log("getAuthUser - verification result:", verified);
  return verified;
}
