import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Container,
  Card,
  Table,
  Badge,
  Button,
  Alert,
  Dropdown,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { BsEye } from "react-icons/bs";
import { FaFilter, FaList, FaChevronDown } from "react-icons/fa";
import "../css/MunicipalityUserHome.css";

// Componenti
import ReportDetails from "./ReportDetails";

// IMPORT API
import {
  getReports,
  getAllCategories,
  updateReportStatus,
  getReportsAssignedToMe,
} from "../api/reportApi";

// --- CONSTANTS & CONFIGURATION ---
const ALL_STATUSES = [
  "Pending Approval",
  "Assigned",
  "In Progress",
  "Suspended",
  "Rejected",
  "Resolved",
];

const ROLE_DEPARTMENT_MAPPING = {
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

const getStatusBadgeVariant = (status) => {
  switch (status) {
    case "Pending Approval":
      return "warning";
    case "Assigned":
      return "primary";
    case "In Progress":
      return "info";
    case "Resolved":
      return "success";
    case "Rejected":
      return "danger";
    default:
      return "secondary";
  }
};

const getDepartmentCategory = (roleName) => {
  if (!roleName) return null;
  return ROLE_DEPARTMENT_MAPPING[roleName.toLowerCase()] || null;
};

export default function MunicipalityUserHome({ user }) {
  // --- DERIVED USER INFO ---
  const userRole = user?.role_name?.toLowerCase();

  const isStaffMember = useMemo(() => {
    return (
      userRole &&
      userRole !== "administrator" &&
      userRole !== "municipal public relations officer"
    );
  }, [userRole]);

  const userDepartmentCategory = useMemo(() => {
    return isStaffMember ? getDepartmentCategory(user?.role_name) : null;
  }, [isStaffMember, user?.role_name]);

  // --- STATE ---
  // Inizializziamo lo stato dei filtri direttamente con la logica corretta per evitare doppi render/fetch
  const [categoryFilter, setCategoryFilter] = useState(() => {
    return userDepartmentCategory || "";
  });

  const [statusFilter, setStatusFilter] = useState(() => {
    if (isStaffMember) return "Assigned";
    if (
      userRole === "administrator" ||
      userRole === "municipal public relations officer"
    ) {
      return "Pending Approval";
    }
    return "";
  });

  const [reports, setReports] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // --- EFFECT: Handle User Role Changes (Reset filters if user prop changes radically) ---
  useEffect(() => {
    if (isStaffMember) {
      setStatusFilter("Assigned");
      setCategoryFilter(userDepartmentCategory || "");
    } else if (
      userRole === "administrator" ||
      userRole === "municipal public relations officer"
    ) {
      // Solo se non abbiamo già un filtro impostato o se vogliamo forzare il reset al cambio utente
      // Qui manteniamo la logica originale di default
      if (!statusFilter) setStatusFilter("Pending Approval");
    }
  }, [isStaffMember, userDepartmentCategory, userRole]);

  // --- FETCHING LOGIC ---

  // 1. Fetch Categories (Only once on mount)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        setAllCategories(categoriesData || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // 2. Fetch Reports (Whenever filters or user changes)
  const fetchReportsData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setApiError(null);

    try {
      // Prepare params: convert empty strings to null for the API if needed, 
      // or pass them as is depending on API implementation. 
      // Assumo che l'API accetti null o stringa vuota per indicare "nessun filtro".
      const statusParam = statusFilter === "" || statusFilter === "All Statuses" ? null : statusFilter;
      const categoryParam = categoryFilter === "" || categoryFilter === "All Categories" ? null : categoryFilter;

      console.log(`Fetching reports with params - Status: ${statusParam}, Category: ${categoryParam}`);

      let reportsData;

      if (isStaffMember) {
        reportsData = await getReportsAssignedToMe(statusParam, categoryParam);
      } else {
        reportsData = await getReports(statusParam, categoryParam);
      }

      const formattedReports = (reportsData || []).map((report) => ({
        ...report,
        createdAt: new Date(report.createdAt),
        images:
          report.photos?.map((p) =>
            typeof p === "string" ? p : p.storageUrl
          ) || [],
      }));

      // Sort by date descending
      formattedReports.sort((a, b) => b.createdAt - a.createdAt);

      setReports(formattedReports);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setApiError("Unable to load data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [user, isStaffMember, statusFilter, categoryFilter]);

  // Trigger fetch when dependencies change
  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);


  // --- HANDLERS ---
  const handleClose = () => {
    setShowModal(false);
    setTimeout(() => setSelectedReport(null), 200);
  };

  const handleShow = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const handleAcceptReport = async (reportId) => {
    try {
      const result = await updateReportStatus(reportId, "Assigned");
      // Refresh data to reflect status change (the current list might shrink if filtering by status)
      await fetchReportsData();

      if (result?.error) throw new Error(result.error);

      if (!result?.assignee) return { noOfficerFound: true };
      return { success: true };
    } catch (error) {
      console.error("Error approving report:", error);
      throw error;
    }
  };

  const handleRejectReport = async (reportId, reason) => {
    try {
      await updateReportStatus(reportId, "Rejected", reason);
      await fetchReportsData();
      return true;
    } catch (error) {
      console.error("Error rejecting report:", error);
      return false;
    }
  };

  // --- RENDER CONTENT HELPER ---
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading reports...</p>
        </div>
      );
    }

    if (reports.length === 0) {
      return (
        <div className="text-center p-5 text-muted">
          <h5>No reports found</h5>
          <p className="mb-0">
            There are no reports matching the current criteria.
          </p>
        </div>
      );
    }

    return (
      <Table responsive hover className="mu-table mb-0 align-middle">
        <thead className="bg-light text-uppercase small text-muted">
          <tr>
            <th className="ps-4">Category</th>
            <th>Title</th>
            <th>Date</th>
            <th>Status</th>
            <th className="text-end pe-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td className="ps-4">
                <span className="fw-semibold text-dark">{report.category}</span>
              </td>
              <td>{report.title}</td>
              <td>{report.createdAt.toLocaleDateString()}</td>
              <td>
                <Badge
                  bg={getStatusBadgeVariant(report.status)}
                  className="fw-normal"
                >
                  {report.status}
                </Badge>
              </td>
              <td className="text-end pe-4">
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="rounded-pill px-3 d-inline-flex align-items-center"
                  onClick={() => handleShow(report)}
                >
                  <BsEye className="me-2" /> View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  // --- MAIN RENDER ---
  return (
    <Container className="mu-home-container">
      {/* Header Section */}
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
              {/* Category Filter */}
              <InputGroup className="mu-filter-group">
                <InputGroup.Text className="mu-filter-icon">
                  <FaList />
                </InputGroup.Text>
                <Dropdown
                  onSelect={setCategoryFilter}
                  className="mu-custom-dropdown"
                >
                  <Dropdown.Toggle
                    variant="light"
                    className="mu-filter-toggle"
                    id="category-filter"
                  >
                    <div className="d-flex align-items-center justify-content-between w-100">
                      <span className="text-truncate">
                        {categoryFilter || "All Categories"}
                      </span>
                      <FaChevronDown className="mu-dropdown-arrow ms-2" />
                    </div>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="modern-dropdown-menu">
                    <Dropdown.Item eventKey="" active={categoryFilter === ""}>
                      All Categories
                    </Dropdown.Item>
                    {allCategories.map((cat, idx) => (
                      <Dropdown.Item
                        key={idx}
                        eventKey={cat}
                        active={categoryFilter === cat}
                      >
                        {cat}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </InputGroup>

              {/* Status Filter */}
              <InputGroup className="mu-filter-group">
                <InputGroup.Text className="mu-filter-icon">
                  <FaFilter />
                </InputGroup.Text>
                <Dropdown
                  onSelect={setStatusFilter}
                  className="mu-custom-dropdown"
                >
                  <Dropdown.Toggle
                    variant="light"
                    className="mu-filter-toggle"
                    id="status-filter"
                  >
                    <div className="d-flex align-items-center justify-content-between w-100">
                      <span className="text-truncate">
                        {statusFilter || "All Statuses"}
                      </span>
                      <FaChevronDown className="mu-dropdown-arrow ms-2" />
                    </div>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="modern-dropdown-menu">
                    <Dropdown.Item eventKey="" active={statusFilter === ""}>
                      All Statuses
                    </Dropdown.Item>
                    {ALL_STATUSES.map((st, idx) => (
                      <Dropdown.Item
                        key={idx}
                        eventKey={st}
                        active={statusFilter === st}
                      >
                        {st}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </InputGroup>
            </>
          ) : (
            <div className="bg-light p-2 px-3 rounded text-muted small border">
              Viewing:{" "}
              <strong>{userDepartmentCategory || "My Department"}</strong>{" "}
              &nbsp;|&nbsp; Status: <strong>Assigned</strong>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {apiError && (
        <Alert variant="danger" onClose={() => setApiError(null)} dismissible>
          {apiError}
        </Alert>
      )}

      {/* Table Card */}
      <Card className="mu-home-card border-0 shadow-sm">
        <Card.Body className="p-0">{renderContent()}</Card.Body>
      </Card>

      {/* Report Detail Modal */}
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