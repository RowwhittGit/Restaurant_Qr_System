import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import users from "../config/users.js";

export const login = (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: "Invalid credentials please check your email" });

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials please check your password" });

  const token = jwt.sign(
    { email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "3h" }
  );

  res.json({ token, role: user.role });
};
