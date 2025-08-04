const { Client } = require('discord.js-selfbot-v13');
const readline = require('readline');
const chalk = require('chalk');

console.clear();

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadingScreen(text, dots = 3, interval = 500) {
  process.stdout.write(chalk.greenBright(`\n🔄 ${text}`));
  for (let i = 0; i < dots; i++) {
    await delay(interval);
    process.stdout.write(chalk.greenBright('.'));
  }
  console.log('');
}

console.log(chalk.green.bold(`
 ██████╗ ██╗     
██╔════╝ ██║     
██║      ██║     
██║      ██║     
╚██████╗ ███████╗
 ╚═════╝ ╚══════╝ 
`));

console.log(chalk.cyanBright('💻 Iniciando terminal seguro do SelfBot...\n'));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question(chalk.yellow('\n🔐 Insira seu token secreto: '), async (token) => {
  await loadingScreen('Verificando token');

  const client = new Client();

  client.on('ready', async () => {
    console.clear();
    console.log(chalk.greenBright.bold(`\n✅ Acesso concedido: ${client.user.username} online e operacional.\n`));

    async function solicitarIdEApagar() {
      rl.question(chalk.blue('\n🎯 Alvo - Digite o ID do usuário para interceptar e apagar mensagens: '), async (userId) => {
        try {
          const user = await client.users.fetch(userId);
          const dm = await user.createDM();

          console.log(chalk.magenta(`\n📡 Rastreando mensagens entre ${client.user.username} e ${user.username}...\n`));

          let allMessages = [];
          let lastMessageId;
          let fetched;

          do {
            const options = { limit: 100 };
            if (lastMessageId) options.before = lastMessageId;

            fetched = await dm.messages.fetch(options);
            const userMessages = fetched.filter(msg => msg.author.id === client.user.id);
            allMessages.push(...userMessages.values());

            if (fetched.size > 0) lastMessageId = fetched.last().id;
          } while (fetched.size === 100);

          function formatDuration(ms) {
            const totalSeconds = Math.floor(ms / 1000);
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            return `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
          }

          // Dentro do seu código:
          let count = 0;
          const startTime = Date.now(); // início

          for (const msg of allMessages) {
            console.log(chalk.white(`💬 ${chalk.bold(msg.content || '[Mensagem secreta]')}`));
            await msg.delete().catch(() => { });
            count++;
            console.log(chalk.gray(`🗑️ Removida com sucesso... (${count})`));
            await delay(1500);
          }

          const endTime = Date.now(); // fim
          const duration = formatDuration(endTime - startTime); // usando a função

          console.log(chalk.greenBright(`\n✔️ ${count} mensagens eliminadas do alvo: ${user.username}`));
          console.log(chalk.blueBright(`⏱️ Tempo total: ${duration}\n`));

        } catch (err) {
          console.log(chalk.redBright('\n🚫 Falha na operação.'));
          console.error(err);
        }

        solicitarIdEApagar(); // Loop
      });
    }

    solicitarIdEApagar();
  });

  client.login(token).catch(async err => {
    console.log(chalk.redBright.bold('\n❌ Token inválido ou acesso negado.'));
    await delay(2000);
    rl.close();
  });
});