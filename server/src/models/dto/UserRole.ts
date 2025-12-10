/**
 * @swagger
 * components:
 *   schemas:
 *     UserRole:
 *       type: string
 *       description: User role in the system (dynamically loaded from database)
 *       example: "Citizen"
 */

/**
 * System roles - questi sono i ruoli speciali che hanno logica hardcoded
 * Altri ruoli tecnici vengono caricati dinamicamente dal database
 */
export const SystemRoles = {
  CITIZEN: 'citizen',
  ADMINISTRATOR: 'administrator',
  PUBLIC_RELATIONS_OFFICER: 'municipal public relations officer',
  EXTERNAL_MAINTAINER: 'external maintainer',
  DEPARTMENT_DIRECTOR: 'department director'
} as const;

/**
 * Type per i ruoli di sistema
 */
export type SystemRole = typeof SystemRoles[keyof typeof SystemRoles];

/**
 * Helper function per verificare se un ruolo è uno staff tecnico
 * (tutti i ruoli che non sono Citizen, Administrator, Public Relations Officer o External Maintainer)
 */
export function isTechnicalStaff(roleName: string): boolean {
  return roleName !== SystemRoles.CITIZEN &&
         roleName !== SystemRoles.ADMINISTRATOR &&
         roleName !== SystemRoles.PUBLIC_RELATIONS_OFFICER &&
         roleName !== SystemRoles.EXTERNAL_MAINTAINER;
}

/**
 * Helper function per verificare se un ruolo è un amministratore
 */
export function isAdmin(roleName: string): boolean {
  return roleName === SystemRoles.ADMINISTRATOR;
}

/** * Helper function per verificare se un ruolo è un cittadino
 */
export function isCitizen(roleName: string): boolean {
  return roleName === SystemRoles.CITIZEN;
}