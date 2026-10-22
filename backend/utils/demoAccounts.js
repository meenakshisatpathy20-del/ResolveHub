// Seeded demo accounts use ".example" email domains (see seed.js).
// They are shared by everyone trying the live demo, so their password
// and status can't be changed — otherwise one visitor could lock others out.

export const isDemoAccount = (email = "") =>
  /@[^@\s]+\.example$/i.test(email.trim());

export const DEMO_LOCKED_MESSAGE =
  "This is a shared demo account, so this setting can't be changed. Create your own account to try it.";
