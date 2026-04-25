/**
 * Windows: jei `next dev` ar kitas procesas laiko query_engine DLL, `prisma generate` meta EPERM
 * ir sugadina visą `npm install`. Čia klaida tik įspėjama — klientą galima sugeneruoti vėliau: `npm run db:generate`.
 */
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const root = path.join(__dirname, "..");
const result = spawnSync("npx", ["prisma", "generate"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
  env: process.env,
});

if (result.status !== 0) {
  console.warn(
    "\n[postinstall] prisma generate nepavyko (dažnai EPERM: uždarykite `npm run dev`, tada paleiskite: npm run db:generate)\n",
  );
}
