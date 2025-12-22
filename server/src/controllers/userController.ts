import { Request, Response, NextFunction } from 'express';
import { userService } from '@services/userService';
import { BadRequestError } from '@models/errors/BadRequestError';
import { RegisterRequest } from '@models/dto/input/RegisterRequest';
import { departmentService } from '@services/departmentService';
import { AppError } from '@models/errors/AppError';

/**
 * Controller for User-related HTTP requests
 */
class UserController {
  /**
   * Register a new citizen
   * Citizen registration logic
   * Body: { username, email, password, first_name, last_name }
   * Note: Automatically assigns Citizen role via department_role_ids
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, email, password, first_name, last_name } = req.body;

      if (!username || !email || !password || !first_name || !last_name) {
        throw new BadRequestError('All fields are required: username, email, password, first_name, last_name');
      }

      // Get all department role IDs for Citizen role
      const citizenRoleIds = await departmentService.getDepartmentRoleIdsByRoleName('Citizen');
      
      if (citizenRoleIds.length === 0) {
        throw new AppError('Citizen role configuration not found in database', 500);
      }

      const registerData: RegisterRequest = {
        username,
        email,
        password,
        first_name,
        last_name,
        department_role_ids: citizenRoleIds // Assign all Citizen department roles
      };

      const userResponse = await userService.registerCitizen(registerData);

      res.status(201).json(userResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get external maintainers by category
   * Returns list of external maintainers for a specific category
   */
  async getExternalMaintainersByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category } = req.query;

      const externalMaintainers = await userService.getExternalMaintainersByCategory(category as string || category as undefined);
      res.status(200).json(externalMaintainers);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();