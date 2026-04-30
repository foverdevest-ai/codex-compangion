export const allowedUserEmails = (process.env.ALLOWED_USER_EMAILS ?? "f.overdevest@personeel.com")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const preferredLoginEmail = process.env.PREFERRED_LOGIN_EMAIL?.trim().toLowerCase() ?? allowedUserEmails[0] ?? "";

export function isAllowedUser(email?: string | null) {
  if (!email) return false;
  return allowedUserEmails.includes(email.toLowerCase());
}
