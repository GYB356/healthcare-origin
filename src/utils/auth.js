import bcrypt from 'bcryptjs';

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export async function verifyPassword(password, hashedPassword) {
  const isValid = await bcrypt.compare(password, hashedPassword);
  return isValid;
}

export function generateToken(user) {
  const token = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  return token;
} 