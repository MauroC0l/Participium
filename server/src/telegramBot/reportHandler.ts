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
      return ctx.reply(
        '⚠️ *Username Required*\n\n' +
        'To create reports, you need to set a Telegram username in your profile.\n\n' +
        '*How to set a username:*\n' +
        '1. Open Telegram Settings\n' +
        '2. Tap on your profile\n' +
        '3. Add a username\n\n' +
        'Try again after setting your username.',
        { parse_mode: 'Markdown' }
      );
    }

    const user = await userRepository.findUserByTelegramUsername(telegramUsername);
    if (!user) {
      return ctx.reply(
        '❌ *Access Denied*\n\n' +
        'You must be registered on the Participium platform to create reports via Telegram.\n\n' +
        '🌐 Visit our website to register and link your account using the /link command.\n\n' +
        'After registration, you\'ll be able to submit reports directly from Telegram.',
        { parse_mode: 'Markdown' }
      );
    }

    userSessions.set(chatId, { step: WizardStep.WAITING_LOCATION, data: {} });

    ctx.reply(
      '📍 *Report Location*\n\n' +
      'Please provide the location of the issue:\n\n' +
      '📎 *Option 1:* Send your location using the attachment button\n\n' +
      '📝 *Option 2:* Write an address\n' +
      'Example: "Via Roma 1, Turin"\n\n' +
      '🗺️ *Option 3:* Enter coordinates\n' +
      'Format: latitude, longitude\n' +
      'Example: 45.0703, 7.6869',
      {
        reply_markup: {
          keyboard: [],
          one_time_keyboard: true,
        },
        parse_mode: 'Markdown'
      }
    );
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
      return ctx.reply(
        '⚠️ *Username Required*\n\n' +
        'You need a Telegram username to link your account.\n\n' +
        'Please set a username in your Telegram settings and try again.',
        { parse_mode: 'Markdown' }
      );
    }

    const message = ctx.message as any;
    const text = message?.text;
    if (!text) return;

    const parts = text.split(' ');
    if (parts.length !== 2) {
      return ctx.reply(
        '🔗 *Link Your Account*\n\n' +
        '*Usage:* /link <code>\n\n' +
        '*Steps:*\n' +
        '1. Log in to the Participium website\n' +
        '2. Navigate to the related section\n' +
        '3. Generate a verification code\n' +
        '4. Send: /link YOUR_CODE',
        { parse_mode: 'Markdown' }
      );
    }

    const code = parts[1].trim();
    if (!code || !/^\d{6}$/.test(code)) {
      return ctx.reply(
        '❌ *Invalid Code*\n\n' +
        'The verification code must be exactly 6 digits.\n\n' +
        'Please check the code and try again.',
        { parse_mode: 'Markdown' }
      );
    }

    try {
      const result = await userRepository.verifyAndLinkTelegram(telegramUsername, code);
      ctx.reply(`✅ *${result.message}*\n\nYou can now create reports using /newreport`, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Failed to link Telegram account:', error);
      ctx.reply(
        '❌ *Linking Failed*\n\n' +
        'Unable to link your account. This may be due to:\n' +
        '• Invalid or expired code\n' +
        '• Code already used\n\n' +
        'Please generate a new code and try again.',
        { parse_mode: 'Markdown' }
      );
    }
  }
}