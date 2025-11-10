import { userRepository } from '@repositories/userRepository';
import { userEntity } from '@models/entity/userEntity';
import { UserRole } from '@models/dto/UserRole';
import * as passwordUtils from '@utils/passwordUtils';

// Mock delle dipendenze
jest.mock('@database/connection');
jest.mock('@utils/passwordUtils');

describe('UserRepository Unit Tests', () => {
  let mockRepository: any;
  let mockQueryBuilder: any;

  beforeEach(() => {
    // Reset dei mock prima di ogni test
    jest.clearAllMocks();

    // Setup mock del QueryBuilder
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    // Setup mock del repository TypeORM
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      exists: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    // Mock del repository interno di userRepository
    (userRepository as any).repository = mockRepository;

    // Mock di passwordUtils
    (passwordUtils.generatePasswordData as jest.Mock).mockResolvedValue({
      salt: 'mocksalt',
      hash: 'mockhash',
    });
  });

  describe('createUserWithPassword', () => {
    const validUserData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'SecurePass123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'citizen' as UserRole,
    };

    it('should create user with hashed password successfully', async () => {
      // Arrange
      const mockCreatedUser = {
        id: 1,
        username: validUserData.username,
        email: validUserData.email,
        passwordHash: 'mocksalt:mockhash',
        firstName: validUserData.firstName,
        lastName: validUserData.lastName,
        role: validUserData.role,
        emailNotificationsEnabled: true,
        personalPhotoUrl: undefined,
        telegramUsername: undefined,
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockCreatedUser);
      mockRepository.save.mockResolvedValue(mockCreatedUser);

      // Act
      const result = await userRepository.createUserWithPassword(validUserData);

      // Assert
      expect(passwordUtils.generatePasswordData).toHaveBeenCalledWith(validUserData.password);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: validUserData.username,
          email: validUserData.email,
          firstName: validUserData.firstName,
          lastName: validUserData.lastName,
          role: validUserData.role,
          passwordHash: 'mocksalt:mockhash',
        })
      );
      expect(mockRepository.save).toHaveBeenCalledWith(mockCreatedUser);
      expect(result).toEqual(mockCreatedUser);
      expect(result.id).toBe(1);
    });

    it('should set default emailNotificationsEnabled to true', async () => {
      // Arrange
      const mockCreatedUser = {
        id: 1,
        username: validUserData.username,
        email: validUserData.email,
        passwordHash: 'mocksalt:mockhash',
        firstName: validUserData.firstName,
        lastName: validUserData.lastName,
        role: validUserData.role,
        emailNotificationsEnabled: true,
        personalPhotoUrl: undefined,
        telegramUsername: undefined,
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockCreatedUser);
      mockRepository.save.mockResolvedValue(mockCreatedUser);

      // Act
      const result = await userRepository.createUserWithPassword(validUserData);

      // Assert - Verifica che il database imposti il valore di default
      expect(result.emailNotificationsEnabled).toBe(true);
    });

    it('should allow custom emailNotificationsEnabled value', async () => {
      // Arrange
      const userDataWithNotifications = {
        ...validUserData,
        emailNotificationsEnabled: false,
      };
      const mockCreatedUser = {
        id: 1,
        username: userDataWithNotifications.username,
        email: userDataWithNotifications.email,
        passwordHash: 'mocksalt:mockhash',
        firstName: userDataWithNotifications.firstName,
        lastName: userDataWithNotifications.lastName,
        role: userDataWithNotifications.role,
        emailNotificationsEnabled: false,
        personalPhotoUrl: undefined,
        telegramUsername: undefined,
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockCreatedUser);
      mockRepository.save.mockResolvedValue(mockCreatedUser);

      // Act
      const result = await userRepository.createUserWithPassword(userDataWithNotifications);

      // Assert - Verifica che il valore custom sia preservato
      expect(result.emailNotificationsEnabled).toBe(false);
    });

    it('should hash password with salt', async () => {
      // Arrange
      const mockCreatedUser = {
        id: 1,
        username: validUserData.username,
        email: validUserData.email,
        passwordHash: 'mocksalt:mockhash',
        firstName: validUserData.firstName,
        lastName: validUserData.lastName,
        role: validUserData.role,
        emailNotificationsEnabled: true,
        personalPhotoUrl: undefined,
        telegramUsername: undefined,
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockCreatedUser);
      mockRepository.save.mockResolvedValue(mockCreatedUser);

      // Act
      await userRepository.createUserWithPassword(validUserData);

      // Assert
      expect(passwordUtils.generatePasswordData).toHaveBeenCalledWith(validUserData.password);
      const createCall = mockRepository.create.mock.calls[0][0];
      expect(createCall.passwordHash).toBeDefined();
      expect(createCall.passwordHash).toBe('mocksalt:mockhash');
      expect(createCall.passwordHash).toContain(':');
      expect(createCall.passwordHash).not.toBe(validUserData.password);
    });

    it('should handle database save errors', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockRepository.create.mockReturnValue({});
      mockRepository.save.mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        userRepository.createUserWithPassword(validUserData)
      ).rejects.toThrow('Database connection failed');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should create user with all required fields', async () => {
      // Arrange
      const mockCreatedUser = {
        id: 1,
        username: validUserData.username,
        email: validUserData.email,
        passwordHash: 'mocksalt:mockhash',
        firstName: validUserData.firstName,
        lastName: validUserData.lastName,
        role: validUserData.role,
        personalPhotoUrl: undefined,
        telegramUsername: undefined,
        emailNotificationsEnabled: true,
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockCreatedUser);
      mockRepository.save.mockResolvedValue(mockCreatedUser);

      // Act
      const result = await userRepository.createUserWithPassword(validUserData);

      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('passwordHash');
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('lastName');
      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('createdAt');
    });

    it('should handle password hashing errors', async () => {
      // Arrange
      const hashError = new Error('Password hashing failed');
      (passwordUtils.generatePasswordData as jest.Mock).mockRejectedValue(hashError);

      // Act & Assert
      await expect(
        userRepository.createUserWithPassword(validUserData)
      ).rejects.toThrow('Password hashing failed');
    });
  });

  describe('existsUserByUsername', () => {
    it('should return true if username exists', async () => {
      // Arrange
      mockRepository.exists.mockResolvedValue(true);

      // Act
      const result = await userRepository.existsUserByUsername('existinguser');

      // Assert
      expect(mockRepository.exists).toHaveBeenCalledWith({
        where: { username: 'existinguser' },
      });
      expect(result).toBe(true);
    });

    it('should return false if username does not exist', async () => {
      // Arrange
      mockRepository.exists.mockResolvedValue(false);

      // Act
      const result = await userRepository.existsUserByUsername('newuser');

      // Assert
      expect(mockRepository.exists).toHaveBeenCalledWith({
        where: { username: 'newuser' },
      });
      expect(result).toBe(false);
    });

    it('should be case-sensitive', async () => {
      // Arrange
      mockRepository.exists.mockResolvedValue(false);

      // Act
      await userRepository.existsUserByUsername('TestUser');

      // Assert
      expect(mockRepository.exists).toHaveBeenCalledWith({
        where: { username: 'TestUser' },
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      const dbError = new Error('Database query failed');
      mockRepository.exists.mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        userRepository.existsUserByUsername('testuser')
      ).rejects.toThrow('Database query failed');
    });
  });

  describe('existsUserByEmail', () => {
    it('should return true if email exists', async () => {
      // Arrange
      mockRepository.exists.mockResolvedValue(true);

      // Act
      const result = await userRepository.existsUserByEmail('existing@example.com');

      // Assert
      expect(mockRepository.exists).toHaveBeenCalledWith({
        where: { email: 'existing@example.com' },
      });
      expect(result).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      // Arrange
      mockRepository.exists.mockResolvedValue(false);

      // Act
      const result = await userRepository.existsUserByEmail('new@example.com');

      // Assert
      expect(mockRepository.exists).toHaveBeenCalledWith({
        where: { email: 'new@example.com' },
      });
      expect(result).toBe(false);
    });

    it('should handle database errors', async () => {
      // Arrange
      const dbError = new Error('Database query failed');
      mockRepository.exists.mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        userRepository.existsUserByEmail('test@example.com')
      ).rejects.toThrow('Database query failed');
    });
  });

  describe('findUserByUsername', () => {
    const mockUser: userEntity = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'salt:hashedpassword',
      firstName: 'Test',
      lastName: 'User',
      role: 'citizen',
      personalPhotoUrl: undefined,
      telegramUsername: undefined,
      emailNotificationsEnabled: true,
      createdAt: new Date(),
    };

    it('should return user if found', async () => {
      // Arrange
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);

      // Act
      const result = await userRepository.findUserByUsername('testuser');

      // Assert
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user.username = :username', { username: 'testuser' });
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('user.passwordHash');
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
      expect(result?.username).toBe('testuser');
    });

    it('should return null if user not found', async () => {
      // Arrange
      mockQueryBuilder.getOne.mockResolvedValue(null);

      // Act
      const result = await userRepository.findUserByUsername('nonexistent');

      // Assert
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user.username = :username', { username: 'nonexistent' });
      expect(result).toBeNull();
    });

    it('should be case-sensitive', async () => {
      // Arrange
      mockQueryBuilder.getOne.mockResolvedValue(null);

      // Act
      await userRepository.findUserByUsername('TestUser');

      // Assert
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user.username = :username', { username: 'TestUser' });
    });

    it('should return user with all fields', async () => {
      // Arrange
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);

      // Act
      const result = await userRepository.findUserByUsername('testuser');

      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('passwordHash');
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('lastName');
      expect(result).toHaveProperty('role');
    });

    it('should handle database errors', async () => {
      // Arrange
      const dbError = new Error('Database query failed');
      mockQueryBuilder.getOne.mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        userRepository.findUserByUsername('testuser')
      ).rejects.toThrow('Database query failed');
    });

    it('should return user with passwordHash for authentication', async () => {
      // Arrange
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);

      // Act
      const result = await userRepository.findUserByUsername('testuser');

      // Assert
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('user.passwordHash');
      expect(result?.passwordHash).toBeDefined();
      expect(result?.passwordHash).toContain(':');
      expect(result?.passwordHash).not.toBe('plainPassword');
    });
  });

  describe('Repository Structure', () => {
    it('should have createUserWithPassword method', () => {
      expect(typeof userRepository.createUserWithPassword).toBe('function');
    });

    it('should have existsUserByUsername method', () => {
      expect(typeof userRepository.existsUserByUsername).toBe('function');
    });

    it('should have existsUserByEmail method', () => {
      expect(typeof userRepository.existsUserByEmail).toBe('function');
    });

    it('should have findUserByUsername method', () => {
      expect(typeof userRepository.findUserByUsername).toBe('function');
    });
  });
});