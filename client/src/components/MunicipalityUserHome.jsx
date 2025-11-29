import { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Alert, Dropdown, Spinner } from 'react-bootstrap';
import { BsEye } from 'react-icons/bs';
import { FaFilter, FaList } from "react-icons/fa";
import '../css/MunicipalityUserHome.css';

// Componenti
import ReportDetails from './ReportDetails'; // Assicurati del percorso corretto

// IMPORT API
import {
  getReports,
  getAllCategories,
  approveReport,
  rejectReport,
  getReportsAssignedToMe,
} from "../api/reportApi";

const ALL_STATUSES = ["Pending Approval", "Assigned", "In Progress", "Suspended", "Rejected", "Resolved"];

export default function MunicipalityUserHome({ user }) {
  console.log("🔍 MunicipalityUserHome received user:", user);
  const [reports, setReports] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending Approval");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [apiError, setApiError] = useState(null);

  // Department to Category Mapping
  const getDepartmentCategory = (roleName) => {
    if (!roleName) return null;
    const normalizedRole = roleName.toLowerCase();
    const mapping = {
      "water network staff member": "Water Supply - Drinking Water",
      "sewer system staff member": "Sewer System",
      "road maintenance staff member": "Road Signs and Traffic Lights",
      "traffic management staff member": "Road Signs and Traffic Lights",
      "electrical staff member": "Public Lighting",
      "building maintenance staff member": "Architectural Barriers",
      "accessibility staff member": "Architectural Barriers",
      "recycling program staff member": "Waste",
      "parks maintenance staff member": "Parks and Recreation",
    };
    return mapping[normalizedRole] || null;
  };

  // Check if user is staff (not admin)
  const isStaffMember =
    user &&
    user.role_name &&
    user.role_name.toLowerCase() !== "administrator" &&
    user.role_name.toLowerCase() !== "municipal public relations officer";

  const userDepartmentCategory = isStaffMember
    ? getDepartmentCategory(user.role_name)
    : null;

  // Auto-set filters for staff members
  useEffect(() => {
    if (isStaffMember && userDepartmentCategory) {
      setCategoryFilter(userDepartmentCategory);
      setStatusFilter("Assigned");
    } else if (
      user &&
      (user.role_name === "Administrator" ||
        user.role_name.toLowerCase() === "municipal public relations officer")
    ) {
      setStatusFilter("Pending Approval");
    }
  }, [user, isStaffMember, userDepartmentCategory]);

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const categoriesData = await getAllCategories();
      setAllCategories(categoriesData || []);

      let reportsData;
      if (isStaffMember) {
        reportsData = await getReportsAssignedToMe();
      } else {
        reportsData = await getReports();
      }

      const formattedReports = reportsData.map((report) => ({
        ...report,
        createdAt: new Date(report.createdAt),
        images: report.photos
          ? report.photos.map((p) => (typeof p === "string" ? p : p.storageUrl))
          : [],
      }));

      formattedReports.sort((a, b) => b.createdAt - a.createdAt);
      setReports(formattedReports);
      setApiError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setApiError("Unable to load data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isStaffMember]);

  // --- Helpers ---
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending Approval": return "warning";
      case "Assigned": return "primary";
      case "In Progress": return "info";
      case "Resolved": return "success";
      case "Rejected": return "danger";
      default: return "secondary";
    }
  };

  const filteredReports = reports.filter((report) => {
    const categoryMatch = categoryFilter === "" || report.category === categoryFilter;
    const statusMatch = statusFilter === "" || report.status === statusFilter;
    return categoryMatch && statusMatch;
  });

  // --- Modal Actions ---
  const handleClose = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  const handleShow = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  // --- API ACTIONS Called from ReportDetails ---
  const handleAcceptReport = async (reportId) => {
    try {
      const result = await approveReport(reportId);

      // Refresh list to update UI
      await fetchData();

      // Se l'API ritorna un errore specifico in un oggetto invece di lanciare eccezione
      if (result && result.error) {
        throw new Error(result.error);
      }

      // Logica per determinare se è stato assegnato un ufficiale (Warning Giallo)
      if (result && !result.assignee) {
        return { noOfficerFound: true };
      }

      return { success: true };
    } catch (error) {
      console.error("Error approving report:", error);
      // RILANCIA L'ERRORE PER MOSTRARLO NEL MODALE
      throw error;
    }
  };

  const handleRejectReport = async (reportId, reason) => {
    try {
      await rejectReport(reportId, reason);
      await fetchData();
      return true; // Success handling inside modal
    } catch (error) {
      console.error("Error rejecting report:", error);
      alert(error.message || "Error rejecting report");
      return false;
    }
  };

  return (
    <Container className="mu-home-container">
      <div className="mu-header-wrapper">
        <div>
          <h2 className="mu-home-title">Officer Dashboard</h2>
          <p className="mu-home-subtitle">
            Manage and validate citizen reports.
          </p>
        </div>

        <div className="mu-filters">
          {!isStaffMember ? (
            <>
              <Dropdown onSelect={setCategoryFilter} className="mu-filter-dropdown">
                <Dropdown.Toggle className="modern-dropdown-toggle" id="category-filter">
                  <FaList className="dropdown-icon" />
                  <span className="dropdown-toggle-text">
                    {categoryFilter || "All Categories"}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="modern-dropdown-menu">
                  <Dropdown.Item eventKey="" active={categoryFilter === ""}>All Categories</Dropdown.Item>
                  {allCategories.map((cat, idx) => (
                    <Dropdown.Item key={idx} eventKey={cat} active={categoryFilter === cat}>{cat}</Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown onSelect={setStatusFilter} className="mu-filter-dropdown">
                <Dropdown.Toggle className="modern-dropdown-toggle" id="status-filter">
                  <FaFilter className="dropdown-icon" />
                  <span className="dropdown-toggle-text">
                    {statusFilter || "All Statuses"}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="modern-dropdown-menu">
                  <Dropdown.Item eventKey="" active={statusFilter === ""}>All Statuses</Dropdown.Item>
                  {ALL_STATUSES.map((st, idx) => {
                    return (
                      <Dropdown.Item key={idx} eventKey={st} active={statusFilter === st}>{st}</Dropdown.Item>
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown>
            </>
          ) : (
            <div className="text-muted" style={{ fontSize: '0.9rem', padding: '8px 16px', background: '#f8f9fa', borderRadius: '8px' }}>
              Viewing: <strong>{userDepartmentCategory}</strong>  Status: <strong>Assigned</strong>
            </div>
          )}
        </div>
      </div>

      {apiError && (
        <Alert variant="danger" onClose={() => setApiError(null)} dismissible>
          {apiError}
        </Alert>
      )}

      <Card className="mu-home-card">
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center p-5 text-muted">
              <h5>No reports found</h5>
              <p>Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <Table responsive hover className="mu-table mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Category</th>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <span className="fw-bold text-secondary">
                        {report.category}
                      </span>
                    </td>
                    <td>{report.title}</td>
                    <td>{report.createdAt.toLocaleDateString()}</td>
                    <td>
                      <Badge bg={getStatusBadge(report.status)}>
                        {report.status}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="rounded-pill px-3"
                        onClick={() => handleShow(report)}
                      >
                        <BsEye className="me-1" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* --- Detail Modal Component --- */}
      <ReportDetails
        show={showModal}
        onHide={handleClose}
        report={selectedReport}
        user={user}
        onApprove={handleAcceptReport}
        onReject={handleRejectReport}
      />

    </Container>
  );
}