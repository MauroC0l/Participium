import { categoryRoleRepository } from '@repositories/categoryRoleRepository';
import { AppDataSource } from '@database/connection';
import { CategoryRoleEntity } from '@models/entity/categoryRoleEntity';
import { createMockRole } from '../../utils/mockEntities';

jest.mock('@database/connection', () => ({
    AppDataSource: {
        getRepository: jest.fn()
    }
}));

describe('CategoryRoleRepository', () => {
    let mockRepository: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRepository = {
            findOne: jest.fn(),
            find: jest.fn()
        };
        (categoryRoleRepository as any).repository = mockRepository;
    });

    describe('findRoleIdByCategory', () => {
        it('should return roleId if found', async () => {
            const mockMapping = { roleId: 5 };
            mockRepository.findOne.mockResolvedValue(mockMapping);

            const category = 'Water Supply - Drinking Water';
            const result = await categoryRoleRepository.findRoleIdByCategory(category as any);

            expect(result).toBe(5);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { category },
                select: ['roleId']
            });
        });

        it('should return null if not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);
            const category = 'Water Supply - Drinking Water';
            const result = await categoryRoleRepository.findRoleIdByCategory(category as any);
            expect(result).toBeNull();
        });
    });

    describe('findAllMappings', () => {
        it('should return all mappings with relations', async () => {
            const mockMappings = [
                { id: 1, category: 'Water', role: createMockRole('Staff', 1) }
            ];
            mockRepository.find.mockResolvedValue(mockMappings);

            const result = await categoryRoleRepository.findAllMappings();

            expect(result).toEqual(mockMappings);
            expect(mockRepository.find).toHaveBeenCalledWith({
                relations: ['role'],
                order: { category: 'ASC' }
            });
        });
    });

    describe('findMappingByCategory', () => {
        it('should return mapping if found', async () => {
            const mockMapping = { id: 1, category: 'Water', role: createMockRole('Staff', 1) };
            mockRepository.findOne.mockResolvedValue(mockMapping);

            const category = 'Water Supply - Drinking Water';
            const result = await categoryRoleRepository.findMappingByCategory(category as any);

            expect(result).toEqual(mockMapping);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { category },
                relations: ['role']
            });
        });

        it('should return null if not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);
            const category = 'Water Supply - Drinking Water';
            const result = await categoryRoleRepository.findMappingByCategory(category as any);
            expect(result).toBeNull();
        });
    });
});
