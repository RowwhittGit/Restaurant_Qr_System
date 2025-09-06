import bcrypt from "bcrypt";

const users = [
  {
    email: "admin@restaurant.com",
    password: bcrypt.hashSync("admin@123#", 10),
    role: "admin",
  },
  {
    email: "kitchen@restaurant.com",
    password: bcrypt.hashSync("kitchen123456", 10),
    role: "kitchen",
  }
];

export default users;
