import { UserRole } from "./UserRole";

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - first_name
 *         - last_name
 *         - role
 *       properties:
 *         username:
 *           type: string
 *           description: Unique username
 *           example: "m.rossi"
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *           example: "m.rossi@comune.torino.it"
 *         password:
 *           type: string
 *           description: Password
 *           example: "SecurePass123!"
 *         first_name:
 *           type: string
 *           description: First name
 *           example: "Mario"
 *         last_name:
 *           type: string
 *           description: Last name
 *           example: "Rossi"
 *         role:
 *           type: string
 *           enum: [Citizen, Administrator, Municipal_public_relations_officer, Technical_office_staff_member, Infrastructure_manager, Urban_planning_officer, Sustainability_coordinator, Administrative_assistant, Project_coordinator, Community_engagement_specialist]
 *           description: User role
 *           example: "Citizen"
 *       description: User registration request with role
 */
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: UserRole; // Required - set by controller based on context
}