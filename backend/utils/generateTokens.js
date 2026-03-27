import jwt from "jsonwebtoken";

export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET || "access_secret", {
    expiresIn: "5m", // 5 minutes
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || "refresh_secret", {
    expiresIn: "30d", // 30 days
  });
};
