import { Request, Response, NextFunction } from 'express';
import { userService } from '@services/userService';
import { BadRequest } from '@models/errors/BadRequestError';

/**
 * Controller for User-related HTTP requests
 */
class UserController {
  /**
   * Register a new citizen
   * Citizen registration logic
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, email, password, first_name, last_name } = req.body;

      if (!username || !email || !password || !first_name || !last_name) {
        throw new BadRequest('All fields are required: username, email, password, first_name, last_name');
      }

      const userResponse = await userService.registerCitizen({
        username,
        email,
        password,
        first_name,
        last_name
      });

      res.status(201).json(userResponse);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();