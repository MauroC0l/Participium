import { Request, Response, NextFunction } from 'express';
import { CreateReportRequest } from '../models/dto/input/CreateReportRequest';
import { ReportCategory } from '../models/dto/ReportCategory';
import { BadRequestError } from '../models/errors/BadRequestError';

/**
 * Middleware to validate create report request
 */
export const validateCreateReport = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const data: CreateReportRequest = req.body;

    // Validate location
    if (!data.location || typeof data.location !== 'object') {
      throw new BadRequestError('Location is required and must be an object');
    }
    if (typeof data.location.latitude !== 'number' || typeof data.location.longitude !== 'number') {
      throw new BadRequestError('Location must include numeric latitude and longitude');
    }
    if (data.location.latitude < -90 || data.location.latitude > 90) {
      throw new BadRequestError('Latitude must be between -90 and 90');
    }
    if (data.location.longitude < -180 || data.location.longitude > 180) {
      throw new BadRequestError('Longitude must be between -180 and 180');
    }

    next();
  } catch (error) {
    next(error);
  }
};
