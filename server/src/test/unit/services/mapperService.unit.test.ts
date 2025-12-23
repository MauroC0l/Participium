import * as mapperService from '@services/mapperService';
import { UserEntity } from '@models/entity/userEntity';
import { ReportEntity } from '@models/entity/reportEntity';
import { DepartmentEntity } from '@models/entity/departmentEntity';
import { RoleEntity } from '@models/entity/roleEntity';
import { ReportStatus } from '@models/dto/ReportStatus';
import { ReportCategory } from '@models/dto/ReportCategory';
import { createMockUserRole } from '@test/utils/mockEntities';

describe('MapperService', () => {

    describe('mapUserEntityToUserResponse', () => {
        it('should map user entity to user response', () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                userRoles: [
                    createMockUserRole(1, 1, 'Manager', 'Dep1')
                ]
            } as UserEntity;

            const result = mapperService.mapUserEntityToUserResponse(mockUser);

            expect(result).not.toBeNull();
            expect(result?.id).toBe(1);
            expect(result?.username).toBe('testuser');
            expect(result?.email).toBe('test@example.com');
            expect(result?.first_name).toBe('Test');
            expect(result?.last_name).toBe('User');
            expect(result?.roles).toHaveLength(1);
            expect(result?.roles[0].role_name).toBe('Manager');
            expect(result?.roles[0].department_name).toBe('Dep1');
        });

        it('should return null if entity is null', () => {
            const result = mapperService.mapUserEntityToUserResponse(null);
            expect(result).toBeNull();
        });

        it('should map company name if provided', () => {
            const mockUser = { id: 1, username: 'testuser' } as UserEntity;
            const result = mapperService.mapUserEntityToUserResponse(mockUser, 'Acme Corp');
            expect(result?.company_name).toBe('Acme Corp');
        });
    });

    describe('mapReportEntityToReportResponse', () => {
        it('should map report entity to report response', () => {
            const mockReport = {
                id: 1,
                title: 'Test Report',
                description: 'Test Description',
                category: ReportCategory.ROADS,
                location: 'POINT(10 20)',
                isAnonymous: false,
                status: ReportStatus.ASSIGNED,
                createdAt: new Date(),
                updatedAt: new Date(),
                reporterId: 100,
                reporter: { id: 100, username: 'reporter' } as UserEntity,
                assigneeId: 200,
                assignee: { id: 200, username: 'assignee' } as UserEntity,
                photos: [{ id: 1, storageUrl: 'path/to/photo.jpg', createdAt: new Date() }]
            } as unknown as ReportEntity;

            const result = mapperService.mapReportEntityToReportResponse(mockReport);

            expect(result.id).toBe(1);
            expect(result.title).toBe('Test Report');
            expect(result.location).toEqual({ longitude: 10, latitude: 20 });
            expect(result.reporter).toBeDefined();
            expect(result.reporter?.username).toBe('reporter');
            expect(result.assignee).toBeDefined();
            expect(result.assignee?.username).toBe('assignee');
            expect(result.photos).toHaveLength(1);
            expect(result.photos[0].storageUrl).toContain('path/to/photo.jpg');
        });

        it('should handle anonymous reports', () => {
            const mockReport = {
                id: 1,
                isAnonymous: true,
                location: { latitude: 10, longitude: 20 }, // Object location format
                reporter: { id: 100, username: 'reporter' } as UserEntity // Should be ignored
            } as unknown as ReportEntity;

            const result = mapperService.mapReportEntityToReportResponse(mockReport);

            expect(result.reporterId).toBeNull();
            expect(result.reporter).toBeNull();
        });
    });

    describe('mapDepartmentEntityToDTO', () => {
        it('should map department entity', () => {
            const mockDept = { id: 1, name: 'Dep1' } as DepartmentEntity;
            const result = mapperService.mapDepartmentEntityToDTO(mockDept);
            expect(result).toEqual({ id: 1, name: 'Dep1' });
        });
    });

    describe('mapRoleEntityToDTO', () => {
        it('should map role entity', () => {
            const mockRole = { id: 1, name: 'Role1', description: 'Desc' } as RoleEntity;
            const result = mapperService.mapRoleEntityToDTO(mockRole);
            expect(result).toEqual({ id: 1, name: 'Role1', description: 'Desc' });
        });
    });

    describe('createErrorDTO', () => {
        it('should create error DTO', () => {
            const result = mapperService.createErrorDTO(400, 'Bad Request', 'BadRequestError');
            expect(result).toEqual({ code: 400, message: 'Bad Request', name: 'BadRequestError' });
        });
    });
});
