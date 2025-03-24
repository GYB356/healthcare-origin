import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error("Token decoding failed:", error);
    return null;
  }
}; 