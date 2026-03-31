require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const { sequelize, User, Project, Task } = require("./database/setup");

const app = express();
app.use(express.json());

app.use(session({
  secret: "secret_key",
  resave: false,
  saveUninitialized: false
}));

const authMiddleware = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.user = { id: req.session.userId };
  next();
};

// REGISTER
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) return res.status(400).json({ error: "Email exists" });

  const hashed = await bcrypt.hash(password, 10);

  await User.create({ username, email, password: hashed });

  res.json({ message: "Registered" });
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid email" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid password" });

  req.session.userId = user.id;

  res.json({ message: "Logged in" });
});

// LOGOUT
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

// PROTECTED PROJECT ROUTE
app.get("/api/projects", authMiddleware, async (req, res) => {
  const projects = await Project.findAll({
    where: { userId: req.user.id }
  });
  res.json(projects);
});

app.listen(process.env.PORT, async () => {
  await sequelize.sync();
  console.log("Server running on port " + process.env.PORT);
});
