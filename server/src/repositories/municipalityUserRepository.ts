import { AppDataSource } from "@database/connection";
import { userEntity } from "@models/entity/userEntity";
import { Repository, Not, In } from "typeorm";
import { UserRole } from "@models/dto/UserRole";
import { generatePasswordData } from "@utils/passwordUtils";

class MunicipalityUserRepository {
  private repository: Repository<userEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(userEntity);
  }

  /**
   * Creates a new municipality user with a hashed password.
   * @param userData Partial user data including plain text password and municipality role.
   * @returns The created user entity.
   * @throws Error if role is Citizen or Administrator.
   */
  public async createMunicipalityUser(
    userData: Omit<userEntity, 'id' | 'createdAt' | 'passwordHash'> & { password: string }
  ): Promise<userEntity> {
    // Validate that role is a municipality role
    if (userData.role === UserRole.CITIZEN || userData.role === UserRole.ADMINISTRATOR) {
      throw new Error('Cannot create Citizen or Administrator through municipality user repository');
    }

    const { password, ...userFields } = userData;
    const { salt, hash } = await generatePasswordData(password);
    
    const user = this.repository.create({
      ...userFields,
      passwordHash: `${salt}:${hash}`
    });

    return this.repository.save(user);
  }

  /**
   * Finds all municipality users (excludes Citizens and Administrators).
   * Returns users ordered by creation date (newest first).
   * @returns Array of municipality user entities.
   */
  public async findAllMunicipalityUsers(): Promise<userEntity[]> {
    return this.repository.find({
      where: {
        role: Not(In([UserRole.CITIZEN, UserRole.ADMINISTRATOR]))
      },
      order: {
        createdAt: 'DESC'
      }
    });
  }

  /**
   * Finds a municipality user by ID.
   * Verifies that the user is not a Citizen or Administrator.
   * @param id The ID of the user.
   * @returns The municipality user entity or null if not found or is a Citizen/Administrator.
   */
  public async findMunicipalityUserById(id: number): Promise<userEntity | null> {
    const user = await this.repository.findOneBy({ id });
    if (!user || user.role === UserRole.CITIZEN || user.role === UserRole.ADMINISTRATOR) {
      return null;
    }
    return user;
  }

  /**
   * Updates municipality user information.
   * Only municipality users (not Citizens or Administrators) can be updated through this method.
   * @param id The ID of the municipality user to update.
   * @param updateData Partial user data to update.
   * @returns The updated user entity.
   * @throws Error if user is not found or is a Citizen/Administrator.
   */
  public async updateMunicipalityUser(
    id: number,
    updateData: Partial<Omit<userEntity, 'id' | 'createdAt' | 'passwordHash'>>
  ): Promise<userEntity> {
    // Verify user exists and is a municipality user
    const existingUser = await this.findMunicipalityUserById(id);
    if (!existingUser) {
      throw new Error('Municipality user not found or cannot be modified');
    }

    // Update user
    await this.repository.update(id, {
      ...updateData,
      updatedAt: new Date()
    });

    const updatedUser = await this.repository.findOneBy({ id });
    if (!updatedUser) {
      throw new Error('User not found after update');
    }

    return updatedUser;
  }

  /**
   * Deletes a municipality user by ID.
   * Only municipality users (not Citizens or Administrators) can be deleted.
   * @param id The ID of the municipality user to delete.
   * @returns void
   * @throws Error if user is not found, is a Citizen, or is an Administrator.
   */
  public async deleteMunicipalityUser(id: number): Promise<void> {
    // Verify user exists and is deletable
    const existingUser = await this.findMunicipalityUserById(id);
    if (!existingUser) {
      throw new Error('Municipality user not found or cannot be deleted');
    }

    await this.repository.delete(id);
  }

  /**
   * Checks if a user is a municipality user (not a Citizen or Administrator).
   * @param id The ID of the user.
   * @returns True if the user is a municipality user, false otherwise.
   */
  public async isMunicipalityUser(id: number): Promise<boolean> {
    const user = await this.repository.findOneBy({ id });
    return user !== null && 
           user.role !== UserRole.CITIZEN && 
           user.role !== UserRole.ADMINISTRATOR;
  }

  /**
   * Finds all users with a specific municipality role.
   * Excludes Citizen and Administrator roles.
   * @param role The role to filter by.
   * @returns Array of user entities with the specified role.
   * @throws Error if role is Citizen or Administrator.
   */
  public async findUsersByRole(role: UserRole): Promise<userEntity[]> {
    if (role === UserRole.CITIZEN || role === UserRole.ADMINISTRATOR) {
      throw new Error('Cannot query Citizen or Administrator through municipality user repository');
    }

    return this.repository.find({
      where: { role },
      order: {
        createdAt: 'DESC'
      }
    });
  }

// Export a singleton instance of the repository
export const municipalityUserRepository = new MunicipalityUserRepository();