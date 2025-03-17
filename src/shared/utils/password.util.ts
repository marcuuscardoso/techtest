import bcrypt from 'bcrypt';
import crypto from 'crypto';

export class PasswordUtil {
  private static readonly SALT_ROUNDS = 10;
  private static readonly PEPPER = process.env.PASSWORD_PEPPER || 'default-secure-pepper-change-in-production';

  /**
   * Aplica o pepper à senha antes de hashear
   * @param password A senha em texto puro
   * @returns A senha com pepper aplicado
   */
  private static applyPepper(password: string): string {
    return crypto
      .createHmac('sha256', this.PEPPER)
      .update(password)
      .digest('hex');
  }

  /**
   * Hashes a password using bcrypt with an additional pepper
   * @param password The plain text password to hash
   * @returns The hashed password
   */
  static async hash(password: string): Promise<string> {
    const pepperedPassword = this.applyPepper(password);
    return bcrypt.hash(pepperedPassword, this.SALT_ROUNDS);
  }

  /**
   * Compares a plain text password with a hashed password
   * @param password The plain text password to compare
   * @param hashedPassword The hashed password to compare against
   * @returns True if the passwords match, false otherwise
   */
  static async compare(password: string, hashedPassword: string): Promise<boolean> {
    const pepperedPassword = this.applyPepper(password);
    return bcrypt.compare(pepperedPassword, hashedPassword);
  }
} 