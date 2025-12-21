import { Telegraf, Context } from 'telegraf';
import { UserSession, WizardStep } from './types';
import { ReportWizard } from './reportWizard';
import { userRepository } from '@repositories/userRepository';

const userSessions = new Map<number, UserSession>();

export class ReportHandler {
  readonly wizard: ReportWizard;

  constructor(readonly bot: Telegraf) {
    this.wizard = new ReportWizard(bot, (chatId: number) => userSessions.delete(chatId));
  }

  async startReport(ctx: Context) {
    const chatId = ctx.chat!.id;
    const telegramUsername = ctx.from?.username;

    if (!telegramUsername) {
      console.log('Attempt to create report without telegram username, chatId:', chatId);
      return ctx.reply('You must have a Telegram username set in your profile to create reports. Please set a username in Telegram settings and try again.');
    }

    // Verify if user is registered
    console.log('Verifying user registration:', telegramUsername);
    const user = await userRepository.findUserByTelegramUsername(telegramUsername);
    if (!user) {
      console.log('User not found:', telegramUsername);
      return ctx.reply('❌ Access denied!\n\nYou must be registered on the Participium platform to create reports via Telegram.\n\nVisit the website and register before using this bot.');
    }

    console.log('✅ Registered user found:', user.id, '- initializing report');

    // Start the session
    userSessions.set(chatId, { step: WizardStep.WAITING_LOCATION, data: {} });

    ctx.reply('Send your location on the Turin map using the paperclip.\n\nAlternatively, you can write an address (e.g. "Via Roma 1, Turin") or manually enter coordinates in the format: "latitude, longitude" (e.g. 45.0703, 7.6869).', {
      reply_markup: {
        keyboard: [],
        one_time_keyboard: true,
      },
    });
  }

  async handleLocation(ctx: Context) {
    const chatId = ctx.chat!.id;
    const session = userSessions.get(chatId);
    if (!session || session.step !== WizardStep.WAITING_LOCATION) return;

    await this.wizard.handleLocation(ctx, session);
  }

  async handleText(ctx: Context) {
    const chatId = ctx.chat!.id;
    const session = userSessions.get(chatId);
    if (!session) return;

    await this.wizard.handleText(ctx, session);
  }

  handleCallbackQuery(ctx: Context) {
    const chatId = ctx.chat!.id;
    const session = userSessions.get(chatId);
    if (!session) return;

    this.wizard.handleCallbackQuery(ctx, session);
  }

  async handlePhotos(ctx: Context) {
    const chatId = ctx.chat!.id;
    const session = userSessions.get(chatId);
    if (!session || session.step !== WizardStep.WAITING_PHOTOS) return;

    await this.wizard.handlePhotos(ctx, session);
  }

  async linkAccount(ctx: Context) {
    const telegramUsername = ctx.from?.username;
    if (!telegramUsername) {
      return ctx.reply('You must have a Telegram username set in your profile to link the account.');
    }

    const message = ctx.message as any;
    const text = message?.text;
    if (!text) return;

    // Expected format: /link CODE
    const parts = text.split(' ');
    if (parts.length !== 2) {
      return ctx.reply('Correct format: /link <code>\n\nGenerate a verification code from the Participium app and enter it here.');
    }

    const code = parts[1].trim();
    if (!code || !/^\d{6}$/.test(code)) {
      return ctx.reply('The code must be 6 numeric digits.');
    }

    try {
      const result = await userRepository.verifyAndLinkTelegram(telegramUsername, code);
      ctx.reply(result.message);
    } catch (error) {
      console.error('Error linking account:', error);
      ctx.reply('❌ Error linking the account. Try again later.');
    }
  }
}