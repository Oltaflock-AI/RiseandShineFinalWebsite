/**
 * TBO portal verification (Jul 2026) requires the sign-in flow to be disabled:
 * booking must work without an account while their team validates the site.
 * Flip to false to restore the login gate, the header auth UI and the
 * /login + /signup screens — no other code changes needed.
 */
export const AUTH_DISABLED = true;
