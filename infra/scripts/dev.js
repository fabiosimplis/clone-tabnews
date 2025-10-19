const { spawn } = require("node:child_process");

function run(cmd, args) {
  const handle = new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit" });
    p.on("exit", (code) => (code === 0 ? resolve() : reject(code)));
  });

  return handle;
}

let servicesStarted = false;

async function main() {
  try {
    await run("npm", ["run", "services:up"]);
    servicesStarted = true;
    await run("npm", ["run", "services:wait:database"]);
    await run("npm", ["run", "migrations:up"]);

    const nextDev = spawn("npx", ["next", "dev"], { stdio: "inherit" });

    nextDev.on("exit", (code) => {
      cleanup().then(() => process.exit(code));
    });

    process.on("SIGINT", () => {
      nextDev.kill("SIGINT");
    });
  } catch (err) {
    await cleanup();
    process.exit(typeof err === "number" ? err : 1);
  }
}

async function cleanup() {
  if (servicesStarted) {
    await run("npm", ["run", "services:down"]);
  }
}

main();
