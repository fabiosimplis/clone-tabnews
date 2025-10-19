// it is a script to stop docker after the host stopped by Ctrl+c command

const { spawn } = require("child_process");
const process = require("process");

let isCleaningUp = false;

function cleanupAndExit() {
  if (isCleaningUp) return;
  isCleaningUp = true;

  console.log(
    "\n 🚨 Sinal de interrupção (Ctrl+C) recebido. Parando os serviços Docker...",
  );
  // Execute Docker stop command by npm
  const cleanupProcess = spawn("npm", ["run", "services:stop"], {
    stdio: "inherit",
    shell: true,
  });

  cleanupProcess.on("close", (code) => {
    console.log(
      `✅ Serviços Docker parados. Finalizando o processo de desenvolvimento. (Código de saída: ${code})`,
    );
    process.exit(0);
  });

  cleanupProcess.on("error", (err) => {
    console.error("❌ Erro ao tentar parar os serviços Docker:", err);
    process.exit(1);
  });
}

//1. Configure the signal capture
// process.on("SIGINT", cleanupAndExit);
// process.on("SIGTERM", cleanupAndExit); // Also useful for more formal closings.

//2. Defines commands to be executed in sequence before 'next dev'
const preDevCommands = [
  "npm run services:up",
  "npm run services:wait:database",
  "npm run migrations:up",
];

// Function to chain execution of commands
function runPrevDevCommands(commands, callback) {
  if (commands.length == 0) {
    callback();
    return;
  }

  const command = commands.shift();
  console.log(`\n➡️ Executando: ${command}`);

  //Use shell: true to ensure that npms commands are found on all of OS
  const child = spawn(command, { stdio: "inherit", shell: true });

  child.on("error", (err) => {
    console.log(`❌ Erro ao executar ${command}:`, err);
    process.exit(1);
  });

  child.on("close", (code) => {
    if (code !== 0) {
      console.error(
        `❌ O comando ${command} falhou com o código de saída ${code}.`,
      );
      process.exit(1); // Sai em caso de falha
      return;
    }
    runPrevDevCommands(commands, callback); // next command
  });
}

//3. Start process
runPrevDevCommands([...preDevCommands], () => {
  console.log("\n🚀 Iniciando Next.js em modo de desenvolvimento...");
  //Start next dev
  const nextDev = spawn("next", ["dev"], { stdio: "inherit", shell: true });

  nextDev.on("error", (err) => {
    if (err.code === "ENOENT") {
      console.error(
        "❌ ERRO GRAVE: Binário 'next' não encontrado. Certifique-se de que o Next.js está instalado e no seu PATH.",
      );
    } else {
      console.error("❌ Erro fatal ao iniciar next dev:", err);
    }
    cleanupAndExit();
  });
  //When the next dev is closed, we also close it (this is redundant if SIGINT is caught, but it is a safeguard)
  nextDev.on("exit", (code) => {
    if (code !== 0 && code !== 130) {
      // O código 130 é geralmente o SIGINT
      console.log(
        `❌ Next.js foi encerrado inesperadamente com código ${code}.`,
      );
      cleanupAndExit();
    }
  });
  process.on("SIGINT", () => {
      nextDev.kill("SIGINT");
      cleanupAndExit();
  });
});
