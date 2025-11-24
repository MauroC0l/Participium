import express from 'express';
import { reportController } from '@controllers/reportController';
import { isLoggedIn, requireRole } from '@middleware/authMiddleware';
import { validateCreateReport } from '@middleware/reportMiddleware';
import { UserRole } from '@dto/UserRole';

const router = express.Router();

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Create a new geolocated report
 *     description: |
 *       Allows an authenticated citizen to create a new geolocated report.
 *       The location is specified through geographic coordinates (latitude and longitude)
 *       obtained by selecting a point on an OpenStreetMap map.
 *       
 *       **Validations:**
 *       - Latitude: between -90 and 90
 *       - Longitude: between -180 and 180
 *       - Title: min 5, max 200 characters
 *       - Description: min 10, max 2000 characters
 *       - Category: must be one of the valid categories
 *       
 *     tags: [Reports]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReportRequest'
 *           examples:
 *             pothole:
 *               summary: Pothole report
 *               value:
 *                 title: "Dangerous pothole on Via Roma"
 *                 description: "There is a deep pothole approximately 20cm deep that poses a danger to pedestrians and vehicles. The pothole is located near building number 15."
 *                 category: "Roads and Urban Furnishings"
 *                 location:
 *                   latitude: 45.4642
 *                   longitude: 9.1900
 *                 photos:
 *                   - "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
 *                   - "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
 *                 isAnonymous: false
 *             streetlight:
 *               summary: Non-functioning streetlight
 *               value:
 *                 title: "Broken streetlight in Piazza Garibaldi"
 *                 description: "The streetlight in Piazza Garibaldi at the corner with Via Verdi has not been working for a week, creating a dangerous dark area in the evening."
 *                 category: "Public Lighting"
 *                 location:
 *                   latitude: 45.4655
 *                   longitude: 9.1905
 *                 photos:
 *                   - "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
 *                 isAnonymous: false
 *     responses:
 *       201:
 *         description: Report created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportResponse'
 *             example:
 *               id: 42
 *               reporterId: 15
 *               title: "Dangerous pothole on Via Roma"
 *               description: "Presence of a pothole approximately 20cm deep that poses a danger to pedestrians and vehicles"
 *               category: "Roads and Urban Furnishings"
 *               location:
 *                 latitude: 45.4642
 *                 longitude: 9.1900
 *               photos: []
 *               isAnonymous: false
 *               status: "Pending Approval"
 *               rejectionReason: null
 *               assigneeId: null
 *               createdAt: "2025-11-15T10:30:00Z"
 *               updatedAt: "2025-11-15T10:30:00Z"
 *       400:
 *         description: Validation error or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   get:
 *     summary: Get all reports
 *     description: |
 *       Returns the list of all reports with their geographic coordinates.
 *       Coordinates are provided in WGS84 format (OpenStreetMap standard).
 *       
 *     tags: [Reports]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/ReportStatus'
 *         description: Filter by report status
 *         required: false
 *       - in: query
 *         name: category
 *         schema:
 *           $ref: '#/components/schemas/ReportCategory'
 *         description: Filter by category
 *         required: false
 *     responses:
 *       200:
 *         description: List of reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReportResponse'
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', requireRole(UserRole.CITIZEN), validateCreateReport, reportController.createReport);
router.get('/', isLoggedIn, reportController.getAllReports);

/**
 * @swagger
 * /api/reports/categories:
 *   get:
 *     summary: Get all available report categories
 *     description: |
 *       Returns the list of all valid report categories that can be used when creating a report.
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: List of available report categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/categories', reportController.getCategories);

/**
 * @swagger
 * /api/reports/assigned/me:
 *   get:
 *     summary: Get reports assigned to the current user
 *     description: |
 *       Returns all reports assigned to the authenticated technical office staff member.
 *     tags: [Reports]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/ReportStatus'
 *         description: Filter assigned reports by status
 *         required: false
 *     responses:
 *       200:
 *         description: List of reports assigned to current user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReportResponse'
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/assigned/me', isLoggedIn, reportController.getMyAssignedReports);

/**
 * @swagger
 * /api/reports/{id}/approve:
 *   put:
 *     summary: Approve a report
 *     description: |
 *       Municipal Public Relations Officer can approve a report in "Pending Approval" status.
 *       Upon approval, the report is automatically assigned to the technical office
 *       responsible for the report category and status changes to "Assigned".
 *     tags: [Reports]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Report ID to approve
 *     requestBody:
 *       description: Optional body to modify report category during approval
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 $ref: '#/components/schemas/ReportCategory'
 *     responses:
 *       200:
 *         description: Report approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Report not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id/approve', requireRole(UserRole.PUBLIC_RELATIONS_OFFICER), reportController.approveReport);

/**
 * @swagger
 * /api/reports/{id}/reject:
 *   put:
 *     summary: Reject a report
 *     description: |
 *       Municipal Public Relations Officer can reject a report in "Pending Approval" status.
 *       A rejection reason must be provided to explain why the report is not valid.
 *     tags: [Reports]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Report ID to reject
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectReportRequest'
 *     responses:
 *       200:
 *         description: Report rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Report not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id/reject', requireRole(UserRole.PUBLIC_RELATIONS_OFFICER), reportController.rejectReport);

export default router;
