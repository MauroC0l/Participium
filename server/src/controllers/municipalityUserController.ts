import { Request, Response, NextFunction } from 'express';
import { BadRequest } from '@models/errors/BadRequestError';
import { UserRole } from '@models/dto/UserRole';
import { municipalityUserService } from '@services/municipalityUserService';
import { RoleUtils } from '@utils/roleUtils';

class MunicipalityUserController {

  /**
   * Get all municipality roles
   * GET /api/roles
   * Story: List all available municipality roles (excluding Citizen and Administrator)
   */
  async getAllRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const municipalityRoles = RoleUtils.getAllMunicipalityRoles();
      res.status(200).json(municipalityRoles);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign role to municipality user
   * PUT /api/municipality/users/:id/role
   * Story: As a system administrator, I want to assign roles to municipality users
   */
  async assignRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;

      if (isNaN(userId)) {
        throw new BadRequest('Invalid user ID');
      }

      if (!role) {
        throw new BadRequest('Role is required');
      }

      // Validate role is a valid UserRole enum value
      if (!Object.values(UserRole).includes(role)) {
        throw new BadRequest('Invalid role specified');
      }
      
      const updatedUser = await municipalityUserService.assignRole(userId, role);
      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

}

export default new MunicipalityUserController();