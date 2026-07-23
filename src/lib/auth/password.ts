import "server-only";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Burns roughly the same time as a real bcrypt comparison.
 *
 * Called on the "no such user" branch of login so an attacker cannot tell a
 * registered email from an unregistered one by timing the response.
 */
export async function fakePasswordCheck(): Promise<void> {
  await bcrypt.compare(
    "timing-equaliser",
    "$2a$12$Xy9zQ9dQZ0K1sT2uV3wX4uYzA5bC6dE7fG8hI9jK0lM1nO2pQ3rS4",
  );
}
