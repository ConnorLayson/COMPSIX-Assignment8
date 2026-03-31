const { sequelize, User, Project, Task } = require("./setup");
const bcrypt = require("bcryptjs");

(async () => {
  await sequelize.sync({ force: true });

  const password = await bcrypt.hash("password123", 10);

  const user = await User.create({
    username: "testuser",
    email: "test@test.com",
    password
  });

  const project = await Project.create({
    name: "Sample Project",
    userId: user.id
  });

  await Task.create({
    title: "Sample Task",
    projectId: project.id
  });

  console.log("Database seeded");
})();
