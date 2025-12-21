import { Telegraf } from 'telegraf';
import { botConfig } from './botConfig';
import { ReportHandler } from './reportHandler';

let bot: Telegraf | null = null;
let reportHandler: ReportHandler | null = null;

export const initBot = () => {
  if (!botConfig.BOT_TOKEN) {
    console.log('TELEGRAM_BOT_TOKEN not set. Telegram bot will not be started.');
    return;
  }

  bot = new Telegraf(botConfig.BOT_TOKEN);
  reportHandler = new ReportHandler(bot);

  bot.start((ctx) => {
    ctx.reply('Welcome to Participium!\n\n📋 **Available commands:**\n/link <code> - Link your Telegram account to Participium\n/newreport - Create a new report about an issue in your city');
  });

  bot.command('newreport', (ctx) => reportHandler!.startReport(ctx));
  bot.command('link', (ctx) => reportHandler!.linkAccount(ctx));
  bot.on('location', (ctx) => reportHandler!.handleLocation(ctx));
  bot.on('photo', (ctx) => reportHandler!.handlePhotos(ctx));
  bot.on('text', (ctx) => reportHandler!.handleText(ctx));
  bot.on('callback_query', (ctx) => {
    reportHandler!.handleCallbackQuery(ctx);
    ctx.answerCbQuery();
  });

  bot.launch().then(() => {
    console.log('Telegram bot started successfully.');
  }).catch((error) => {
    console.error('Error starting Telegram bot:', error);
  });
};

export { bot };