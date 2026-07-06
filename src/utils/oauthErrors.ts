const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  role_not_allowed: "Google login is only available for user accounts.",
  provider_conflict: "This email is already registered with a password. Please log in normally.",
  account_disabled: "This account has been disabled.",
  missing_email: "Your Google account has no email address. Please use a different sign-in method.",
  oauth_failed: "Google login failed. Please try again.",
};

export function getOAuthErrorMessage(code: string | null): string {
  if (!code) return "";
  return OAUTH_ERROR_MESSAGES[code] ?? OAUTH_ERROR_MESSAGES.oauth_failed;
}