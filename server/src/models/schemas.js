/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Username for authentication
 *           example: mariorossi
 *         password:
 *           type: string
 *           description: User password
 *           example: password123
 *     
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: User ID
 *           example: 1
 *         username:
 *           type: string
 *           description: Username
 *           example: mariorossi
 *         email:
 *           type: string
 *           format: email
 *           description: User email
 *           example: mario.rossi@polito.it
 *         first_name:
 *           type: string
 *           description: First name
 *           example: Mario
 *         last_name:
 *           type: string
 *           description: Last name
 *           example: Rossi
 *         role:
 *           type: string
 *           description: User role (citizen or municipality_user)
 *           example: citizen
 *     
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - first_name
 *         - last_name
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Unique username
 *           example: giuliabianchi
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *           example: giulia.bianchi@comune.it
 *         first_name:
 *           type: string
 *           description: First name
 *           example: Giulia
 *         last_name:
 *           type: string
 *           description: Last name
 *           example: Bianchi
 *         password:
 *           type: string
 *           description: Password (min 6 characters)
 *           example: securePassword123
 *     
 *     MunicipalityUserRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - first_name
 *         - last_name
 *         - role_id
 *       properties:
 *         username:
 *           type: string
 *           description: Unique username
 *           example: lbianchi
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *           example: luca.bianchi@comune.torino.it
 *         first_name:
 *           type: string
 *           description: First name
 *           example: Luca
 *         last_name:
 *           type: string
 *           description: Last name
 *           example: Bianchi
 *         password:
 *           type: string
 *           description: Temporary password
 *           example: Init#2025
 *         role_id:
 *           type: integer
 *           description: Role ID to assign
 *           example: 2
 *         department:
 *           type: string
 *           description: Department name
 *           example: Direzione Infrastrutture e Mobilità
 *     
 *     RoleAssignmentRequest:
 *       type: object
 *       required:
 *         - role_id
 *       properties:
 *         role_id:
 *           type: integer
 *           description: ID of the role to assign
 *           example: 3
 *     
 *     RoleResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Role ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Role name
 *           example: admin
 *         description:
 *           type: string
 *           description: Role description
 *           example: Administrator with full access
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: Invalid credentials
 */
