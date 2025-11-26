import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { departmentRoleRepository } from '../../../repositories/departmentRoleRepository';
import { BadRequestError } from '../../../models/errors/BadRequestError';
import { In } from 'typeorm';
import { AppDataSource } from '@database/connection';
import { reportService } from '@services/reportService';
import { reportRepository } from '@repositories/reportRepository';
import { userRepository } from '@repositories/userRepository';
import { departmentRepository } from '@repositories/departmentRepository';
import { ReportStatus } from '@models/dto/ReportStatus';
import { ReportCategory } from '@models/dto/ReportCategory';
import { userEntity } from '@models/entity/userEntity';
import { DepartmentEntity } from '@models/entity/departmentEntity';

// Mock storage service to avoid actual file I/O
jest.mock('../../../services/storageService', () => ({
  storageService: {
    uploadPhoto: jest.fn<() => Promise<string>>().mockResolvedValue('uploads/reports/1/mock_photo.jpg'),
    deleteReportPhotos: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  }
}));

const r = () => `_${Math.floor(Math.random() * 1000000)}`;

describe('ReportService Integration Tests', () => {
    let createdUserIds: number[] = [];
    let createdReportIds: number[] = [];

    let citizenUser: userEntity;
    let officerUser: userEntity;

    beforeAll(async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
    });

    afterAll(async () => {
        if (createdReportIds.length > 0) {
            await (reportRepository as any)['repository'].delete({ id: In(createdReportIds) });
        }
        if (createdUserIds.length > 0) {
            await (userRepository as any)['repository'].delete({ id: In(createdUserIds) });
        }
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    });

    afterEach(async () => {
         if (createdReportIds.length > 0) {
            await (reportRepository as any)['repository'].delete({ id: In(createdReportIds) });
            createdReportIds = [];
        }
        if (createdUserIds.length > 0) {
            await (userRepository as any)['repository'].delete({ id: In(createdUserIds) });
            createdUserIds = [];
        }
        jest.clearAllMocks();
    });

    beforeEach(async () => {
        // Create Citizen
        const citizenRole = await departmentRoleRepository.findByDepartmentAndRole('Organization', 'Citizen');
        citizenUser = await userRepository.createUserWithPassword({
            username: `citizen${r()}`,
            password: 'Password123!',
            email: `citizen${r()}@test.com`,
            firstName: 'Citizen',
            lastName: 'Test',
            departmentRoleId: citizenRole!.id
        });
        createdUserIds.push(citizenUser.id);

        // Create Officer
        const officerRole = await departmentRoleRepository.findByDepartmentAndRole('Organization', 'Municipal Public Relations Officer');
        officerUser = await userRepository.createUserWithPassword({
            username: `officer${r()}`,
            password: 'Password123!',
            email: `officer${r()}@test.com`,
            firstName: 'Officer',
            lastName: 'Test',
            departmentRoleId: officerRole!.id
        });
        createdUserIds.push(officerUser.id);
    });

    const VALID_PHOTO = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

    describe('createReport', () => {
        it('should create a valid report', async () => {
            const reportData = {
                title: 'Test Report',
                description: 'Description',
                category: ReportCategory.ROADS,
                location: { latitude: 45.0703, longitude: 7.6869 }, // Turin
                photos: [VALID_PHOTO],
                isAnonymous: false
            };

            const result = await reportService.createReport(reportData, citizenUser.id);

            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.title).toBe(reportData.title);
            expect(result.status).toBe(ReportStatus.PENDING_APPROVAL);
            
            createdReportIds.push(result.id);

            // Verify DB
            const saved = await reportRepository.findReportById(result.id);
            expect(saved).toBeDefined();
            expect(saved?.title).toBe(reportData.title);
        });

        it('should throw BadRequestError if location is outside Turin', async () => {
             const reportData = {
                title: 'Outside Turin',
                description: 'Description',
                category: ReportCategory.ROADS,
                location: { latitude: 41.9028, longitude: 12.4964 }, // Rome
                photos: [VALID_PHOTO],
                isAnonymous: false
            };

            await expect(reportService.createReport(reportData, citizenUser.id))
                .rejects.toThrow(BadRequestError);
        });

        it('should throw BadRequestError if photos are invalid (empty)', async () => {
            const reportData = {
               title: 'No Photos',
               description: 'Description',
               category: ReportCategory.ROADS,
               location: { latitude: 45.0703, longitude: 7.6869 }, 
               photos: [], // Empty
               isAnonymous: false
           };

           await expect(reportService.createReport(reportData, citizenUser.id))
               .rejects.toThrow(BadRequestError);
       });
    });

    describe('getAllReports', () => {
        it('should return reports visible to Citizen (excluding Pending)', async () => {
            // Create a pending report (by Citizen)
            const r1 = await reportService.createReport({
                title: 'Pending Report',
                description: 'Desc',
                category: ReportCategory.ROADS,
                location: { latitude: 45.0703, longitude: 7.6869 },
                photos: [VALID_PHOTO],
                isAnonymous: false
            }, citizenUser.id);
            createdReportIds.push(r1.id);

            // Create an assigned report (manually update status)
            const r2 = await reportService.createReport({
                title: 'Assigned Report',
                description: 'Desc',
                category: ReportCategory.WASTE,
                location: { latitude: 45.0703, longitude: 7.6869 },
                photos: [VALID_PHOTO],
                isAnonymous: false
            }, citizenUser.id);
            createdReportIds.push(r2.id);
            
            await reportRepository['repository'].update(r2.id, { status: ReportStatus.ASSIGNED });

            // Act
            const results = await reportService.getAllReports(citizenUser.id);

            // Assert
            expect(results.some(r => r.id === r2.id)).toBe(true);
            expect(results.some(r => r.id === r1.id)).toBe(false); // Citizen can't see Pending
        });

        it('should return all reports to Officer (including Pending)', async () => {
             // Create a pending report
            const r1 = await reportService.createReport({
                title: 'Pending Report',
                description: 'Desc',
                category: ReportCategory.ROADS,
                location: { latitude: 45.0703, longitude: 7.6869 },
                photos: [VALID_PHOTO],
                isAnonymous: false
            }, citizenUser.id);
            createdReportIds.push(r1.id);

            // Act
            const results = await reportService.getAllReports(officerUser.id);

            // Assert
            expect(results.some(r => r.id === r1.id)).toBe(true);
        });
        
        it('should filter by category', async () => {
             const r1 = await reportService.createReport({
                title: 'Roads',
                description: 'Desc',
                category: ReportCategory.ROADS,
                location: { latitude: 45.0703, longitude: 7.6869 },
                photos: [VALID_PHOTO],
                isAnonymous: false
            }, citizenUser.id);
            createdReportIds.push(r1.id);
            await reportRepository['repository'].update(r1.id, { status: ReportStatus.ASSIGNED });

             const r2 = await reportService.createReport({
                title: 'Waste',
                description: 'Desc',
                category: ReportCategory.WASTE,
                location: { latitude: 45.0703, longitude: 7.6869 },
                photos: [VALID_PHOTO],
                isAnonymous: false
            }, citizenUser.id);
            createdReportIds.push(r2.id);
            await reportRepository['repository'].update(r2.id, { status: ReportStatus.ASSIGNED });

            const results = await reportService.getAllReports(citizenUser.id, undefined, ReportCategory.ROADS);
            
            expect(results.some(r => r.id === r1.id)).toBe(true);
            expect(results.some(r => r.id === r2.id)).toBe(false);
        });
    });
});

describe('ReportService Integration Tests - getMyAssignedReports', () => {
  let testTechnician: userEntity;
  let testCitizen: userEntity;
  let publicLightingDepartment: DepartmentEntity;
  let electricalStaffDeptRoleId: number;
  let citizenDeptRoleId: number;

  beforeAll(async () => {
    await AppDataSource.initialize();

    // Find Public Lighting Department
    publicLightingDepartment = await departmentRepository.findByName('Public Lighting Department') as DepartmentEntity;
    if (!publicLightingDepartment) throw new Error('Public Lighting Department not found');

    // Find Electrical staff member department_role_id
    const electricalDeptRoleArr = await AppDataSource.query(
      `SELECT dr.id
       FROM department_roles dr
       INNER JOIN roles r ON dr.role_id = r.id
       WHERE r.name = $1 AND dr.department_id = $2`,
      ['Electrical staff member', publicLightingDepartment.id]
    );
    if (!electricalDeptRoleArr || electricalDeptRoleArr.length === 0) throw new Error('Electrical staff member role not found');
    electricalStaffDeptRoleId = electricalDeptRoleArr[0].id;

    // Find Citizen department_role_id
    const citizenDeptRoleArr = await AppDataSource.query(
      `SELECT dr.id
       FROM department_roles dr
       INNER JOIN departments d ON dr.department_id = d.id
       INNER JOIN roles r ON dr.role_id = r.id
       WHERE d.name = $1 AND r.name = $2`,
      ['Organization', 'Citizen']
    );
    if (!citizenDeptRoleArr || citizenDeptRoleArr.length === 0) throw new Error('Citizen department_role not found');
    citizenDeptRoleId = citizenDeptRoleArr[0].id;

    // Create test citizen
    const citizenResult = await AppDataSource.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, department_role_id, email_notifications_enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        'citizen.test.service',
        'citizen.test.service@example.com',
        '$2b$10$dummyHashForTesting',
        'Citizen',
        'Test',
        citizenDeptRoleId,
        true
      ]
    );
    testCitizen = citizenResult[0];

    // Create test technician
    const techResult = await AppDataSource.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, department_role_id, email_notifications_enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        'tech.test.service',
        'tech.test.service@comune.it',
        '$2b$10$dummyHashForTesting',
        'Technician',
        'Service',
        electricalStaffDeptRoleId,
        true
      ]
    );
    testTechnician = techResult[0];
  });

  afterAll(async () => {
    await AppDataSource.query(
      `DELETE FROM reports WHERE reporter_id IN ($1, $2)`,
      [testCitizen.id, testTechnician.id]
    );
    await AppDataSource.query(
      `DELETE FROM users WHERE id IN ($1, $2)`,
      [testCitizen.id, testTechnician.id]
    );
    await AppDataSource.destroy();
  });

  afterEach(async () => {
    await AppDataSource.query(
      `DELETE FROM reports WHERE reporter_id IN ($1, $2)`,
      [testCitizen.id, testTechnician.id]
    );
  });

  describe('getMyAssignedReports', () => {
    it('should return all reports assigned to the technician', async () => {
      // Arrange
      await AppDataSource.query(
        `INSERT INTO reports 
          (reporter_id, title, description, category, location, status, assignee_id, is_anonymous, created_at) 
         VALUES ($1, $2, $3, $4, ST_GeogFromText($5), $6, $7, $8, $9)`,
        [
          testCitizen.id,
          'Street light broken',
          'Lamp not working',
          ReportCategory.PUBLIC_LIGHTING,
          'POINT(7.6869005 45.0703393)',
          ReportStatus.ASSIGNED,
          testTechnician.id,
          false,
          new Date('2024-01-01')
        ]
      );
      await AppDataSource.query(
        `INSERT INTO reports 
          (reporter_id, title, description, category, location, status, assignee_id, is_anonymous, created_at) 
         VALUES ($1, $2, $3, $4, ST_GeogFromText($5), $6, $7, $8, $9)`,
        [
          testCitizen.id,
          'Light maintenance needed',
          'Routine check',
          ReportCategory.PUBLIC_LIGHTING,
          'POINT(7.6932941 45.0692403)',
          ReportStatus.IN_PROGRESS,
          testTechnician.id,
          false,
          new Date('2024-01-02')
        ]
      );

      // Act
      const reports = await reportService.getMyAssignedReports(testTechnician.id);

      // Assert
      expect(reports).toHaveLength(2);
      expect(reports.map(r => r.title)).toContain('Street light broken');
      expect(reports.map(r => r.title)).toContain('Light maintenance needed');
      expect(reports.every(r => r.assigneeId === testTechnician.id)).toBe(true);
    });

    it('should return only ASSIGNED reports when status filter is ASSIGNED', async () => {
      // Arrange
      await AppDataSource.query(
        `INSERT INTO reports 
          (reporter_id, title, description, category, location, status, assignee_id, is_anonymous, created_at) 
         VALUES ($1, $2, $3, $4, ST_GeogFromText($5), $6, $7, $8, $9),
                ($1, $10, $11, $4, ST_GeogFromText($12), $13, $7, $8, $14)`,
        [
          testCitizen.id,
          'Assigned report',
          'Status is ASSIGNED',
          ReportCategory.PUBLIC_LIGHTING,
          'POINT(7.6869005 45.0703393)',
          ReportStatus.ASSIGNED,
          testTechnician.id,
          false,
          new Date('2024-01-01'),
          'In progress report',
          'Status is IN_PROGRESS',
          'POINT(7.6932941 45.0692403)',
          ReportStatus.IN_PROGRESS,
          new Date('2024-01-02')
        ]
      );

      // Act
      const reports = await reportService.getMyAssignedReports(testTechnician.id, ReportStatus.ASSIGNED);

      // Assert
      expect(reports).toHaveLength(1);
      expect(reports[0].title).toBe('Assigned report');
      expect(reports[0].status).toBe(ReportStatus.ASSIGNED);
    });

    it('should return only IN_PROGRESS reports when status filter is IN_PROGRESS', async () => {
      // Arrange
      await AppDataSource.query(
        `INSERT INTO reports 
          (reporter_id, title, description, category, location, status, assignee_id, is_anonymous, created_at) 
         VALUES ($1, $2, $3, $4, ST_GeogFromText($5), $6, $7, $8, $9),
                ($1, $10, $11, $4, ST_GeogFromText($12), $6, $7, $8, $13)`,
        [
          testCitizen.id,
          'In progress 1',
          'Working on it',
          ReportCategory.PUBLIC_LIGHTING,
          'POINT(7.6869005 45.0703393)',
          ReportStatus.IN_PROGRESS,
          testTechnician.id,
          false,
          new Date('2024-01-01'),
          'In progress 2',
          'Still working',
          'POINT(7.6932941 45.0692403)',
          new Date('2024-01-02')
        ]
      );

      // Act
      const reports = await reportService.getMyAssignedReports(testTechnician.id, ReportStatus.IN_PROGRESS);

      // Assert
      expect(reports).toHaveLength(2);
      expect(reports.every(r => r.status === ReportStatus.IN_PROGRESS)).toBe(true);
    });

    it('should return empty array when technician has no assigned reports', async () => {
      // No insert

      // Act
      const reports = await reportService.getMyAssignedReports(testTechnician.id);

      // Assert
      expect(reports).toHaveLength(0);
    });

    it('should return reports in chronological order (newest first)', async () => {
      // Arrange
      await AppDataSource.query(
        `INSERT INTO reports 
          (reporter_id, title, description, category, location, status, assignee_id, is_anonymous, created_at) 
         VALUES ($1, $2, $3, $4, ST_GeogFromText($5), $6, $7, $8, $9),
                ($1, $10, $11, $4, ST_GeogFromText($12), $6, $7, $8, $13),
                ($1, $14, $15, $4, ST_GeogFromText($16), $6, $7, $8, $17)`,
        [
          testCitizen.id,
          'Oldest report',
          'Created first',
          ReportCategory.PUBLIC_LIGHTING,
          'POINT(7.6869005 45.0703393)',
          ReportStatus.ASSIGNED,
          testTechnician.id,
          false,
          new Date('2024-01-01T10:00:00'),
          'Middle report',
          'Created second',
          'POINT(7.6932941 45.0692403)',
          new Date('2024-01-02T10:00:00'),
          'Newest report',
          'Created third',
          'POINT(7.6782069 45.0625748)',
          new Date('2024-01-03T10:00:00')
        ]
      );

      // Act
      const reports = await reportService.getMyAssignedReports(testTechnician.id);

      // Assert
      expect(reports).toHaveLength(3);
      expect(reports[0].title).toBe('Newest report');
      expect(reports[1].title).toBe('Middle report');
      expect(reports[2].title).toBe('Oldest report');
      expect(reports[0].createdAt.getTime()).toBeGreaterThan(reports[1].createdAt.getTime());
      expect(reports[1].createdAt.getTime()).toBeGreaterThan(reports[2].createdAt.getTime());
    });
  });
});