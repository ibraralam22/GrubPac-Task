import { Request, Response, NextFunction } from 'express';
import { getJobStatusById } from '../../jobs/queue';
import { NotFoundError } from '../../errors/AppError';

export class JobsController {
  getJobStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jobId = req.params.id as string;
      const jobInfo = await getJobStatusById(jobId);

      if (!jobInfo) {
        throw new NotFoundError(`Job with ID '${jobId}' was not found`, 'JOB_NOT_FOUND', { jobId });
      }

      res.status(200).json({
        data: jobInfo,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const jobsController = new JobsController();
