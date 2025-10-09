const { execSync } = require("child_process");

const env = Object.assign({}, process.env, {
  DATABASE_URL:
    "postgresql://test:test@127.0.0.1:5433/to_livre_test?schema=public",
});

console.log("Running prisma migrate deploy against", env.DATABASE_URL);
execSync("npx prisma migrate deploy", { stdio: "inherit", env });
