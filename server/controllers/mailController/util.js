import crypto from "crypto";

const SECRET = process.env.MAIL_TOKEN_SECRET;

export const generateDecisionToken = ({ projId, action }) => {
  const payload = JSON.stringify({
    projId,
    action,
    exp: Date.now() + 1000 * 60 * 60,
  });

  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex");

  return Buffer.from(payload).toString("base64") + "." + signature;
}

export const verifyDecisionToken = (token) => {
  const [encodedPayload, signature] = token.split(".");
  const payload = Buffer.from(encodedPayload, "base64").toString();

  const expectedSig = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex");

  if (expectedSig !== signature) throw new Error("Invalid token");

  const data = JSON.parse(payload);

  if (Date.now() > data.exp) throw new Error("Token expired");

  return data;
}