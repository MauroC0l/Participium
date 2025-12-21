import { Context } from 'telegraf';
import { UserSession, ReportData, WizardStep } from './types';
import { reportService } from '@services/reportService';
import { userRepository } from '@repositories/userRepository';
import { bufferToDataUri, downloadPhoto } from './utils';
import { CreateReportRequest } from '@dto/input/CreateReportRequest';
import { ReportCategory } from '@dto/ReportCategory';
import { BadRequestError } from '@errors/BadRequestError';
import { UnauthorizedError } from '@errors/UnauthorizedError';
import { InsufficientRightsError } from '@errors/InsufficientRightsError';
import { NotFoundError } from '@errors/NotFoundError';
import { geocodeAddress, reverseGeocode, parseCoordinates } from '@utils/geoValidationUtils';

export class ReportWizard {
  constructor(readonly bot: any, readonly removeSession: (chatId: number) => void) {}

  async handleLocation(ctx: Context, session: UserSession) {
    const message = ctx.message as any;
    const location = message?.location;
    if (!location) return ctx.reply('❌ Invalid location.');

    try {
      reportService.validateLocation({ latitude: location.latitude, longitude: location.longitude });
      session.data.location = { latitude: location.latitude, longitude: location.longitude };
      session.data.address = await reverseGeocode(session.data.location);
      session.step = WizardStep.WAITING_TITLE;
      ctx.reply('Great! Now write a title for your report.');
    } catch (error) {
      if (error instanceof BadRequestError) {
        return ctx.reply('❌ Error: The location must be within the boundaries of Turin.');
      }
      return ctx.reply('❌ Error validating the location.');
    }
  }

  async handleText(ctx: Context, session: UserSession) {
    const message = ctx.message as any;
    const text = message?.text;
    if (!text) return;

    if (session.step === WizardStep.WAITING_LOCATION) {
      await this.handleLocationInput(ctx, session, text);
      return;
    }

    if (session.step === WizardStep.WAITING_TITLE) {
      this.handleTitleInput(ctx, session, text);
    } else if (session.step === WizardStep.WAITING_DESCRIPTION) {
      this.handleDescriptionInput(ctx, session, text);
    } else if (session.step === WizardStep.WAITING_PHOTOS && text === 'Fatto') {
      this.handlePhotosComplete(ctx, session);
    }
  }

  private async handleLocationInput(ctx: Context, session: UserSession, text: string) {
    const coords = parseCoordinates(text);
    if (coords) {
      await this.processCoordinates(ctx, session, coords);
    } else {
      await this.processAddress(ctx, session, text);
    }
  }

  private async processCoordinates(ctx: Context, session: UserSession, coords: { latitude: number; longitude: number }) {
    try {
      reportService.validateLocation(coords);
      session.data.location = coords;
      session.data.address = await reverseGeocode(coords);
      session.step = WizardStep.WAITING_TITLE;
      ctx.reply('Great! Now write a title for your report.');
    } catch (error) {
      if (error instanceof BadRequestError) {
        ctx.reply('❌ Error: The location must be within the boundaries of Turin.');
      } else {
        ctx.reply('❌ Error validating the location.');
      }
    }
  }

  private async processAddress(ctx: Context, session: UserSession, text: string) {
    try {
      const geocoded = await geocodeAddress(text.trim());
      session.data.location = geocoded.location;
      session.data.address = geocoded.address;
      session.step = WizardStep.WAITING_TITLE;
      ctx.reply('Great! Now write a title for your report.');
    } catch (error) {
      console.error('Error geocoding address:', error);
      ctx.reply('❌ Address not found or invalid.\nTry again with coordinates (e.g. 45.0703, 7.6869) or a different address.');
    }
  }

  private handleTitleInput(ctx: Context, session: UserSession, text: string) {
    if (!text || text.trim().length === 0) {
      return ctx.reply('The title cannot be empty. Please enter a valid title.');
    }
    session.data.title = text;
    session.step = WizardStep.WAITING_DESCRIPTION;
    ctx.reply('Now describe the issue.');
  }

  private handleDescriptionInput(ctx: Context, session: UserSession, text: string) {
    if (!text || text.trim().length === 0) {
      return ctx.reply('The description cannot be empty. Please enter a valid description.');
    }
    session.data.description = text;
    session.step = WizardStep.WAITING_CATEGORY;
    const categories = Object.values(ReportCategory);
    const keyboard = categories.map((cat, index) => [{ text: cat, callback_data: `cat_${index}` }]);
    ctx.reply('Choose a category:', {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }

  private handlePhotosComplete(ctx: Context, session: UserSession) {
    console.log('✅ "Fatto" button pressed in handleText');
    console.log('✅ Current number of photos:', session.data.photos?.length || 0);

    if (!session.data.photos || session.data.photos.length === 0) {
      console.log('❌ No photo attached');
      return ctx.reply('You must attach at least one photo before pressing "Done".', {
        reply_markup: {
          inline_keyboard: [[{ text: 'Done', callback_data: 'done' }]],
        },
      });
    }

    console.log('✅ Moving to WAITING_ANONYMOUS');
    session.step = WizardStep.WAITING_ANONYMOUS;
    ctx.reply('Do you want the report to be anonymous?', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Yes', callback_data: 'anon_yes' }],
          [{ text: 'No', callback_data: 'anon_no' }],
        ],
      },
    });
  }

  handleCallbackQuery(ctx: Context, session: UserSession) {
    const callbackQuery = ctx.callbackQuery as any;
    const data = callbackQuery?.data;

    if (data?.startsWith('cat_') && session.step === WizardStep.WAITING_CATEGORY) {
      console.log('🔘 Handling category selection');
      const index = Number.parseInt(data.split('_')[1]);
      const categories = Object.values(ReportCategory);
      session.data.category = categories[index];
      session.step = WizardStep.WAITING_PHOTOS;
      ctx.reply('Send up to 3 photos (or press "Done" if you have no photos).', {
        reply_markup: {
          inline_keyboard: [[{ text: 'Done', callback_data: 'done' }]],
        },
      });
    } else if (data === 'done' && session.step === WizardStep.WAITING_PHOTOS) {
      console.log('✅ "Done" button pressed via callback');
      console.log('✅ Current number of photos:', session.data.photos?.length || 0);

      if (!session.data.photos || session.data.photos.length === 0) {
        console.log('❌ No photo attached');
        return ctx.reply('You must attach at least one photo before pressing "Done".', {
          reply_markup: {
            inline_keyboard: [[{ text: 'Done', callback_data: 'done' }]],
          },
        });
      }

      console.log('✅ Moving to WAITING_ANONYMOUS');
      session.step = WizardStep.WAITING_ANONYMOUS;
      ctx.reply('Do you want the report to be anonymous?', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Yes', callback_data: 'anon_yes' }],
            [{ text: 'No', callback_data: 'anon_no' }],
          ],
        },
      });
    } else if (data?.startsWith('anon_') && session.step === WizardStep.WAITING_ANONYMOUS) {
      console.log('🔘 Handling anonymous selection');
      this.handleAnonymous(ctx, session);
    } else if (data?.startsWith('confirm_') && session.step === WizardStep.WAITING_CONFIRMATION) {
      console.log('🔘 Handling report confirmation');
      this.handleConfirmation(ctx, session);
    } else {
      console.log('🔘 Unrecognized callback or wrong step');
    }
  }

  private handleAnonymous(ctx: Context, session: UserSession) {
    const callbackQuery = ctx.callbackQuery as any;
    const data = callbackQuery?.data;

    if (data === 'anon_yes') {
      session.data.isAnonymous = true;
      console.log('👤 Report set as anonymous');
    } else if (data === 'anon_no') {
      session.data.isAnonymous = false;
      console.log('👤 Report set as not anonymous');
    } else {
      console.log('👤 Unrecognized anon data');
      return;
    }

    session.step = WizardStep.WAITING_CONFIRMATION;
    this.showConfirmation(ctx, session.data);
  }

  private handleConfirmation(ctx: Context, session: UserSession) {
    const callbackQuery = ctx.callbackQuery as any;
    const data = callbackQuery?.data;

    if (data === 'confirm_yes') {
      const telegramUsername = ctx.from?.username!;
      this.saveReport(session.data, ctx.chat!.id, telegramUsername);
    } else if (data === 'confirm_no') {
      ctx.reply('Report creation cancelled. Use /newreport to start again.');
      this.removeSession(ctx.chat!.id);
    }
  }

  private showConfirmation(ctx: Context, data: ReportData) {
    const categoryNames: Record<string, string> = {
      ROADS: 'Roads',
      LIGHTING: 'Lighting',
      CLEANING: 'Cleaning',
      GREEN_AREAS: 'Green areas',
      TRAFFIC: 'Traffic',
      OTHER: 'Other'
    };

    const summary = `
📋 **Report Summary**

📍 **Location**: ${data.location!.latitude.toFixed(6)}, ${data.location!.longitude.toFixed(6)}
🏠 **Address**: ${data.address || 'Not available'}
🏷️ **Title**: ${data.title}
📝 **Description**: ${data.description}
🏷️ **Category**: ${categoryNames[data.category!] || data.category}
🖼️ **Photos**: ${data.photos?.length || 0}
${data.isAnonymous ? '👤 **Anonymous**: Yes' : '👤 **Anonymous**: No'}

Do you want to confirm the creation of the report?
    `.trim();

    ctx.reply(summary, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Confirm', callback_data: 'confirm_yes' }],
          [{ text: 'Cancel', callback_data: 'confirm_no' }]
        ]
      }
    });
  }

  private async saveReport(data: ReportData, chatId: number, telegramUsername: string) {
    console.log('💾 saveReport called with data:', {
      title: data.title,
      description: data.description?.substring(0, 50) + '...',
      category: data.category,
      location: data.location,
      photosCount: data.photos?.length || 0,
      isAnonymous: data.isAnonymous
    });

    try {
      console.log('👤 Searching user by telegram username:', telegramUsername);
      const user = await userRepository.findUserByTelegramUsername(telegramUsername);
      if (!user) {
        console.error('❌ User not found');
        throw new Error('User not found');
      }
      console.log('✅ User found:', user.id);

      console.log('🖼️ Converting photos to data URIs...');
      const photosDataUris = data.photos?.map(buffer => bufferToDataUri(buffer)) || [];
      console.log('✅ Photos converted:', photosDataUris.length);

      const createRequest: CreateReportRequest = {
        title: data.title!.trim(),
        description: data.description!.trim(),
        category: data.category! as ReportCategory,
        location: data.location!,
        address: data.address,
        photos: photosDataUris,
        isAnonymous: data.isAnonymous || false,
      };

      console.log('Creating report with request:', createRequest);
      const report = await reportService.createReport(createRequest, user.id);
      console.log('Report created:', report);
      this.bot.telegram.sendMessage(chatId, `Report #${report.id} created successfully!`);
      this.removeSession(chatId);
    } catch (error) {
      console.error('Error in saveReport:', error);
      this.handleSaveReportError(error, chatId);
    }
  }

  private handleSaveReportError(error: unknown, chatId: number) {
    if (error instanceof BadRequestError) {
      const message = error.message;
      if (message.includes('Location is required') || message.includes('Location must include')) {
        this.bot.telegram.sendMessage(chatId, '❌ Error: Invalid location.');
      } else if (message.includes('Invalid coordinates')) {
        this.bot.telegram.sendMessage(chatId, '❌ Error: Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.');
      } else if (message.includes('outside Turin city boundaries')) {
        this.bot.telegram.sendMessage(chatId, '❌ Error: The location must be within the boundaries of Turin.');
      } else if (message.includes('Photos must contain')) {
        this.bot.telegram.sendMessage(chatId, '❌ Error: You must attach between 1 and 3 valid photos.');
      } else if (message.includes('unsupported format')) {
        this.bot.telegram.sendMessage(chatId, '❌ Error: Unsupported photo format. Use JPEG, PNG or WebP.');
      } else if (message.includes('not a valid image data URI')) {
        this.bot.telegram.sendMessage(chatId, '❌ Error: Invalid photo.');
      } else {
        this.bot.telegram.sendMessage(chatId, `❌ Error: ${message}`);
      }
    } else if (error instanceof UnauthorizedError) {
      this.bot.telegram.sendMessage(chatId, '❌ Error: Not authorized to create reports.');
    } else if (error instanceof InsufficientRightsError) {
      this.bot.telegram.sendMessage(chatId, '❌ Error: Insufficient permissions.');
    } else if (error instanceof NotFoundError) {
      this.bot.telegram.sendMessage(chatId, '❌ Error: Resource not found.');
    } else {
      this.bot.telegram.sendMessage(chatId, '❌ Error creating the report. Please try again later.');
    }
  }

  async handlePhotos(ctx: Context, session: UserSession) {
    const message = ctx.message as any;
    const photos = message?.photo;
    const text = message?.text;

    if (photos) {
      const photo = photos[photos.length - 1];
      const buffer = await downloadPhoto(this.bot, photo.file_id);
      session.data.photos = session.data.photos || [];
      session.data.photos.push(buffer);

      if (session.data.photos.length >= 3) {
        ctx.reply('You have reached the limit of 3 photos. Press "Done" to continue.', {
          reply_markup: {
            inline_keyboard: [[{ text: 'Done', callback_data: 'done' }]],
          },
        });
      } else {
        ctx.reply(`Photo received (${session.data.photos.length}/3). Send more photos or press "Done" to continue.`, {
          reply_markup: {
            inline_keyboard: [[{ text: 'Done', callback_data: 'done' }]],
          },
        });
      }
    } else if (text) {
      ctx.reply('Please send photos or press "Done" to continue.', {
        reply_markup: {
          inline_keyboard: [[{ text: 'Done', callback_data: 'done' }]],
        },
      });
    }
  }
}