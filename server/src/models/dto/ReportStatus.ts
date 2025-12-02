/**
 * @swagger
 * components:
 *   schemas:
 *     ReportStatus:
 *       type: string
 *       enum:
 *         - Pending Approval
 *         - Assigned
 *         - In Progress
 *         - Suspended
 *         - Rejected
 *         - Resolved
 *         - In External Maintenance
 *       description: Report status
 *       example: "Pending Approval"
 */

export enum ReportStatus {
  PENDING_APPROVAL = 'Pending Approval',
  ASSIGNED = 'Assigned',
  IN_PROGRESS = 'In Progress',
  SUSPENDED = 'Suspended',
  REJECTED = 'Rejected',
  RESOLVED = 'Resolved',
  IN_EXTERNAL_MAINTENANCE = 'In External Maintenance'
}
