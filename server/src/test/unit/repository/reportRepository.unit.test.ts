import { reportRepository } from '../../../repositories/reportRepository';
import { reportEntity } from '../../../models/entity/reportEntity';
import { ReportStatus } from '../../../models/dto/ReportStatus';
import { ReportCategory } from '../../../models/dto/ReportCategory';

describe('ReportRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findReportById', () => {
    it('should call findReportById with correct parameters', async () => {
      const mockReport: Partial<reportEntity> = {
        id: 1,
        title: 'Test Report',
        status: ReportStatus.PENDING_APPROVAL,
        category: ReportCategory.ROADS
      };

      jest.spyOn(reportRepository, 'findReportById').mockResolvedValue(mockReport as reportEntity);

      const result = await reportRepository.findReportById(1);

      expect(reportRepository.findReportById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockReport);
    });

    it('should return null when report is not found', async () => {
      jest.spyOn(reportRepository, 'findReportById').mockResolvedValue(null);

      const result = await reportRepository.findReportById(999);

      expect(reportRepository.findReportById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });

    it('should return report with all properties', async () => {
      const mockReport: Partial<reportEntity> = {
        id: 1,
        title: 'Test Report',
        reporter: {
          id: 100,
          email: 'reporter@example.com'
        } as any,
        assignee: {
          id: 50,
          email: 'assignee@example.com'
        } as any,
        photos: [
          { id: 1, reportId: 1, photoUrl: 'photo1.jpg' } as any
        ]
      };

      jest.spyOn(reportRepository, 'findReportById').mockResolvedValue(mockReport as reportEntity);

      const result = await reportRepository.findReportById(1);

      expect(result?.reporter).toBeDefined();
      expect(result?.reporter.id).toBe(100);
      expect(result?.assignee).toBeDefined();
      expect(result?.assignee?.id).toBe(50);
      expect(result?.photos).toBeDefined();
      expect(result?.photos.length).toBe(1);
    });
  });

  describe('findAllReports', () => {
    describe('without filters', () => {
      it('should return all reports when no filters provided', async () => {
        const mockReports: Partial<reportEntity>[] = [
          { id: 1, title: 'Report 1' },
          { id: 2, title: 'Report 2' }
        ];

        jest.spyOn(reportRepository, 'findAllReports').mockResolvedValue(mockReports as reportEntity[]);

        const result = await reportRepository.findAllReports();

        expect(reportRepository.findAllReports).toHaveBeenCalledWith();
        expect(result).toEqual(mockReports);
        expect(result.length).toBe(2);
      });

      it('should return empty array when no reports exist', async () => {
        jest.spyOn(reportRepository, 'findAllReports').mockResolvedValue([]);

        const result = await reportRepository.findAllReports();

        expect(result).toEqual([]);
        expect(result.length).toBe(0);
      });
    });

    describe('with status filter', () => {
      it('should filter by PENDING_APPROVAL status', async () => {
        const mockReports: Partial<reportEntity>[] = [
          { id: 1, status: ReportStatus.PENDING_APPROVAL }
        ];

        jest.spyOn(reportRepository, 'findAllReports').mockResolvedValue(mockReports as reportEntity[]);

        const result = await reportRepository.findAllReports(ReportStatus.PENDING_APPROVAL);

        expect(reportRepository.findAllReports).toHaveBeenCalledWith(ReportStatus.PENDING_APPROVAL);
        expect(result.length).toBe(1);
      });

      it('should filter by ASSIGNED status', async () => {
        jest.spyOn(reportRepository, 'findAllReports').mockResolvedValue([]);

        await reportRepository.findAllReports(ReportStatus.ASSIGNED);

        expect(reportRepository.findAllReports).toHaveBeenCalledWith(ReportStatus.ASSIGNED);
      });

      it('should filter by IN_PROGRESS status', async () => {
        jest.spyOn(reportRepository, 'findAllReports').mockResolvedValue([]);

        await reportRepository.findAllReports(ReportStatus.IN_PROGRESS);

        expect(reportRepository.findAllReports).toHaveBeenCalledWith(ReportStatus.IN_PROGRESS);
      });

      it('should filter by RESOLVED status', async () => {
        jest.spyOn(reportRepository, 'findAllReports').mockResolvedValue([]);

        await reportRepository.findAllReports(ReportStatus.RESOLVED);

        expect(reportRepository.findAllReports).toHaveBeenCalledWith(ReportStatus.RESOLVED);
      });

      it('should filter by REJECTED status', async () => {
        jest.spyOn(reportRepository, 'findAllReports').mockResolvedValue([]);

        await reportRepository.findAllReports(ReportStatus.REJECTED);

        expect(reportRepository.findAllReports).toHaveBeenCalledWith(ReportStatus.REJECTED);
      });
    });

    describe('with category filter', () => {
      it('should filter by ROADS category', async () => {
        const mockReports: Partial<reportEntity>[] = [
          { id: 1, category: ReportCategory.ROADS }
        ];

        jest.spyOn(reportRepository, 'findAllReports').mockResolvedValue(mockReports as reportEntity[]);

        const result = await reportRepository.findAllReports(undefined, ReportCategory.ROADS);

        expect(reportRepository.findAllReports).toHaveBeenCalledWith(undefined, ReportCategory.ROADS);
        expect(result.length).toBe(1);
      });

      it('should filter by PUBLIC_LIGHTING category', async () => {
        jest.spyOn(reportRepository, 'findAllReports').mockResolvedValue([]);

        await reportRepository.findAllReports(undefined, ReportCategory.PUBLIC_LIGHTING);

        expect(reportRepository.findAllReports).toHaveBeenCalledWith(undefined, ReportCategory.PUBLIC_LIGHTING);
      });

      it('should filter by GREEN_AREAS category', async () => {
        jest.spyOn(reportRepository, 'findAllReports').mockResolvedValue([]);

        await reportRepository.findAllReports(undefined, ReportCategory.GREEN_AREAS);

        expect(reportRepository.findAllReports).toHaveBeenCalledWith(undefined, ReportCategory.GREEN_AREAS);
      });
    });

    describe('with combined filters', () => {
      it('should filter by both status and category', async () => {
        const mockReports: Partial<reportEntity>[] = [
          {
            id: 1,
            status: ReportStatus.ASSIGNED,
            category: ReportCategory.ROADS
          }
        ];

        jest.spyOn(reportRepository, 'findAllReports').mockResolvedValue(mockReports as reportEntity[]);

        const result = await reportRepository.findAllReports(
          ReportStatus.ASSIGNED,
          ReportCategory.ROADS
        );

        expect(reportRepository.findAllReports).toHaveBeenCalledWith(
          ReportStatus.ASSIGNED,
          ReportCategory.ROADS
        );
        expect(result.length).toBe(1);
      });
    });
  });

  describe('findByAssigneeId', () => {
    describe('without status filter', () => {
      it('should find all reports assigned to specific user', async () => {
        const assigneeId = 50;
        const mockReports: Partial<reportEntity>[] = [
          { id: 1, assigneeId: 50 },
          { id: 2, assigneeId: 50 }
        ];

        jest.spyOn(reportRepository, 'findByAssigneeId').mockResolvedValue(mockReports as reportEntity[]);

        const result = await reportRepository.findByAssigneeId(assigneeId);

        expect(reportRepository.findByAssigneeId).toHaveBeenCalledWith(assigneeId);
        expect(result.length).toBe(2);
      });

      it('should return empty array when user has no assigned reports', async () => {
        jest.spyOn(reportRepository, 'findByAssigneeId').mockResolvedValue([]);

        const result = await reportRepository.findByAssigneeId(999);

        expect(result).toEqual([]);
        expect(result.length).toBe(0);
      });
    });

    describe('with status filter', () => {
      it('should filter by ASSIGNED status', async () => {
        const assigneeId = 50;
        const mockReports: Partial<reportEntity>[] = [
          { id: 1, assigneeId: 50, status: ReportStatus.ASSIGNED }
        ];

        jest.spyOn(reportRepository, 'findByAssigneeId').mockResolvedValue(mockReports as reportEntity[]);

        const result = await reportRepository.findByAssigneeId(assigneeId, ReportStatus.ASSIGNED);

        expect(reportRepository.findByAssigneeId).toHaveBeenCalledWith(assigneeId, ReportStatus.ASSIGNED);
        expect(result.length).toBe(1);
      });

      it('should filter by IN_PROGRESS status', async () => {
        jest.spyOn(reportRepository, 'findByAssigneeId').mockResolvedValue([]);

        await reportRepository.findByAssigneeId(50, ReportStatus.IN_PROGRESS);

        expect(reportRepository.findByAssigneeId).toHaveBeenCalledWith(50, ReportStatus.IN_PROGRESS);
      });

      it('should filter by RESOLVED status', async () => {
        jest.spyOn(reportRepository, 'findByAssigneeId').mockResolvedValue([]);

        await reportRepository.findByAssigneeId(50, ReportStatus.RESOLVED);

        expect(reportRepository.findByAssigneeId).toHaveBeenCalledWith(50, ReportStatus.RESOLVED);
      });
    });
  });

  describe('save', () => {
    it('should save a new report', async () => {
      const newReport: Partial<reportEntity> = {
        title: 'New Report',
        description: 'Test description',
        status: ReportStatus.PENDING_APPROVAL,
        category: ReportCategory.ROADS
      };

      const savedReport = { ...newReport, id: 1 } as reportEntity;
      jest.spyOn(reportRepository, 'save').mockResolvedValue(savedReport);

      const result = await reportRepository.save(newReport as reportEntity);

      expect(reportRepository.save).toHaveBeenCalledWith(newReport);
      expect(result).toEqual(savedReport);
      expect(result.id).toBe(1);
    });

    it('should update an existing report', async () => {
      const existingReport: Partial<reportEntity> = {
        id: 1,
        title: 'Existing Report',
        status: ReportStatus.PENDING_APPROVAL
      };

      const updatedReport = {
        ...existingReport,
        status: ReportStatus.ASSIGNED,
        assigneeId: 50
      } as reportEntity;

      jest.spyOn(reportRepository, 'save').mockResolvedValue(updatedReport);

      const result = await reportRepository.save(updatedReport);

      expect(reportRepository.save).toHaveBeenCalledWith(updatedReport);
      expect(result.status).toBe(ReportStatus.ASSIGNED);
      expect(result.assigneeId).toBe(50);
    });

    it('should update report status to REJECTED', async () => {
      const report: Partial<reportEntity> = {
        id: 1,
        status: ReportStatus.PENDING_APPROVAL
      };

      const rejectedReport = {
        ...report,
        status: ReportStatus.REJECTED,
        rejectionReason: 'Invalid location'
      } as reportEntity;

      jest.spyOn(reportRepository, 'save').mockResolvedValue(rejectedReport);

      const result = await reportRepository.save(rejectedReport);

      expect(result.status).toBe(ReportStatus.REJECTED);
      expect(result.rejectionReason).toBe('Invalid location');
    });

    it('should clear rejection reason when approving', async () => {
      const report: Partial<reportEntity> = {
        id: 1,
        status: ReportStatus.REJECTED,
        rejectionReason: 'Old reason'
      };

      const approvedReport = {
        ...report,
        status: ReportStatus.ASSIGNED,
        rejectionReason: undefined,
        assigneeId: 50
      } as reportEntity;

      jest.spyOn(reportRepository, 'save').mockResolvedValue(approvedReport);

      const result = await reportRepository.save(approvedReport);

      expect(result.status).toBe(ReportStatus.ASSIGNED);
      expect(result.rejectionReason).toBeUndefined();
      expect(result.assigneeId).toBe(50);
    });

    it('should handle multiple field updates', async () => {
      const originalReport: Partial<reportEntity> = {
        id: 1,
        title: 'Original Title',
        category: ReportCategory.ROADS,
        status: ReportStatus.PENDING_APPROVAL
      };

      const updatedReport = {
        ...originalReport,
        title: 'Updated Title',
        category: ReportCategory.PUBLIC_LIGHTING,
        status: ReportStatus.ASSIGNED,
        assigneeId: 50
      } as reportEntity;

      jest.spyOn(reportRepository, 'save').mockResolvedValue(updatedReport);

      const result = await reportRepository.save(updatedReport);

      expect(result.title).toBe('Updated Title');
      expect(result.category).toBe(ReportCategory.PUBLIC_LIGHTING);
      expect(result.status).toBe(ReportStatus.ASSIGNED);
      expect(result.assigneeId).toBe(50);
    });
  });
});
