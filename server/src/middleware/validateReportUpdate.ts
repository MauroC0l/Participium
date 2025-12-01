import { Request, Response, NextFunction } from 'express';
import { ReportStatus } from '@models/dto/ReportStatus';
import { BadRequestError } from '@models/errors/BadRequestError';

export const validateReportUpdate = (req: Request, res: Response, next: NextFunction) => {
    const { status, reason } = req.body;

    if (!status || !Object.values(ReportStatus).includes(status)) {
        throw new BadRequestError(`Invalid status. Must be one of: ${Object.values(ReportStatus).join(', ')}`);
    }

    if (status === ReportStatus.REJECTED && (!reason || reason.trim().length === 0)) {
        throw new BadRequestError('Rejection reason is required when rejecting a report');
    }

    next();
};
