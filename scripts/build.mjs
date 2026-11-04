import { execSync } from "node:child_process";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

run("npx prisma generate");

// Migrations so rodam no deploy de producao da Vercel. Previews e builds locais nao tocam no banco.
if (process.env.VERCEL_ENV === "production") {
  if (!process.env.DATABASE_URL_DIRECT) {
    console.error("DATABASE_URL_DIRECT nao definida: necessaria para aplicar as migrations em producao.");
    process.exit(1);
  }
  run("npx prisma migrate deploy");
} else {
  console.log("Pulando prisma migrate deploy (VERCEL_ENV != production).");
}

run("npx next build");
