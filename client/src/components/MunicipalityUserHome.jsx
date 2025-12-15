import React, { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Container,
  Card,
  Table,
  Badge,
  Button,
  Alert,
  Dropdown,
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

const STAFF_MEMBER_STATUSES_LIST = [
  "Assigned",
  "In Progress",
  "Suspended",
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
  "parks maintenance staff member": "Public Green Areas and Playgrounds",
};

// MAPPATURA COLORI (Coerente con MapPage e Bootstrap standard)
const getStatusBadgeVariant = (status) => {
  const normalizedStatus = status?.replaceAll("_", " ").toLowerCase();

  switch (normalizedStatus) {
    case "resolved":
      return "success"; // Verde
    case "assigned":
      return "primary"; // Blu
    case "in progress":
      return "info"; // Arancione (Override via CSS)
    case "pending approval":
      return "warning"; // Giallo
    case "rejected":
      return "danger"; // Rosso
    case "suspended":
      return "secondary"; // Grigio
    default:
      return "secondary";
  }
};

const getDepartmentCategory = (roleName) => {
  if (!roleName) return null;
  return ROLE_DEPARTMENT_MAPPING[roleName.toLowerCase()] || null;
};

// Helper per convertire lo stato UI (es. "Pending Approval") in stato API (es. "PENDING_APPROVAL")
const formatStatusForApi = (uiStatus) => {
  if (!uiStatus || uiStatus === "All Statuses") return null;
  return uiStatus;
};

// --- SUB-COMPONENTI ---

// 1. Componente per il corpo della tabella
const ReportsTableBody = React.memo(({ reports, handleShow }) => {
  if (reports.length === 0) {
    return (
      <tr>
        <td colSpan="6" className="text-center p-5 text-muted">
          <h5>Nessuna segnalazione trovata</h5>
          <p className="mb-0">
            Nessuna segnalazione corrisponde ai criteri di ricerca.
          </p>
        </td>
      </tr>
    );
  }

  return reports.map((report) => (
    <tr key={report.id}>
      <td className="ps-4">
        <span className="fw-semibold text-dark">{report.category}</span>
      </td>
      <td>{report.title}</td>
      <td>{report.createdAt.toLocaleDateString()}</td>
      <td>
        {/* Colonna Aggiunta per l'Assegnatario */}
        {report.assignee?.username || report.assignee?.id || (
          <span className="text-muted fst-italic">N/A</span>
        )}
      </td>
      <td>
        <Badge
          bg={getStatusBadgeVariant(report.status)}
          className="fw-normal"
        >
          {report.status.replaceAll("_", " ")}
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
  ));
});

ReportsTableBody.propTypes = {
  reports: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      category: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      createdAt: PropTypes.instanceOf(Date).isRequired,
      status: PropTypes.string.isRequired,
      assignee: PropTypes.oneOfType([
        PropTypes.shape({ username: PropTypes.string, id: PropTypes.number }),
        PropTypes.number,
        PropTypes.string,
      ]),
    })
  ).isRequired,
  handleShow: PropTypes.func.isRequired,
};

// 2. Componente per i filtri
const ReportsFilters = React.memo(
  ({
    isCategoryFilterDisabled,
    categoryFilter,
    statusFilter,
    allCategories,
    availableStatuses,
    setCategoryFilter,
    setStatusFilter,
  }) => (
    <div className="mu-filters">
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
            disabled={isCategoryFilterDisabled}
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
            {allCategories.map((cat) => (
              <Dropdown.Item
                key={cat}
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
            {availableStatuses.map((st) => (
              <Dropdown.Item
                key={st}
                eventKey={st}
                active={statusFilter === st}
              >
                {st}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </InputGroup>
    </div>
  )
);

ReportsFilters.propTypes = {
  isCategoryFilterDisabled: PropTypes.bool.isRequired,
  categoryFilter: PropTypes.string.isRequired,
  statusFilter: PropTypes.string.isRequired,
  allCategories: PropTypes.array.isRequired,
  availableStatuses: PropTypes.array.isRequired,
  setCategoryFilter: PropTypes.func.isRequired,
  setStatusFilter: PropTypes.func.isRequired,
};

// --- COMPONENTE PRINCIPALE ---

export default function MunicipalityUserHome({ user }) {
  // --- DERIVED USER INFO ---
  const userRole = user?.role_name?.toLowerCase();
  const isAdministrator = userRole === "administrator";
  const isPublicRelations = userRole === "municipal public relations officer";

  const isStaffMember = useMemo(() => {
    return userRole && !isAdministrator && !isPublicRelations;
  }, [userRole, isAdministrator, isPublicRelations]);

  const isCategoryFilterDisabled = useMemo(
    () => isStaffMember && !isPublicRelations && !isAdministrator,
    [isStaffMember, isPublicRelations, isAdministrator]
  );

  const userDepartmentCategory = useMemo(() => {
    return isStaffMember ? getDepartmentCategory(user?.role_name) : null;
  }, [isStaffMember, user?.role_name]);

  const availableStatuses = useMemo(() => {
    return isStaffMember ? STAFF_MEMBER_STATUSES_LIST : ALL_STATUSES;
  }, [isStaffMember]);

  // --- STATE ---
  const [categoryFilter, setCategoryFilter] = useState(
    () => userDepartmentCategory || ""
  );

  const [statusFilter, setStatusFilter] = useState(() => {
    if (isAdministrator || isPublicRelations) {
      return "Pending Approval";
    }
    return ""; // Include "All Statuses"
  });

  const [reports, setReports] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // --- EFFECT: Sincronizzazione Iniziale ---
  useEffect(() => {
    if (isStaffMember && !isPublicRelations && !isAdministrator) {
      if (categoryFilter !== userDepartmentCategory) {
        setCategoryFilter(userDepartmentCategory || "");
      }
      if (
        !STAFF_MEMBER_STATUSES_LIST.includes(statusFilter) &&
        statusFilter !== ""
      ) {
        setStatusFilter("");
      }
    } else if (isAdministrator || isPublicRelations) {
      if (categoryFilter === userDepartmentCategory) {
        setCategoryFilter("");
      }
    }
  }, [
    isStaffMember,
    userDepartmentCategory,
    isAdministrator,
    isPublicRelations,
    categoryFilter,
    statusFilter,
  ]);

  // 1. Fetch Categories
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

  // 2. Fetch Reports
  const fetchReportsData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setApiError(null);

    try {
      const apiStatusParam = formatStatusForApi(statusFilter);
      const apiCategoryParam =
        categoryFilter === "" || categoryFilter === "All Categories"
          ? null
          : categoryFilter;

      let reportsData;

      if (isStaffMember) {
        reportsData = await getReportsAssignedToMe(
          apiStatusParam,
          apiCategoryParam
        );
      } else {
        reportsData = await getReports(apiStatusParam, apiCategoryParam);
      }

      const formattedReports = (reportsData || []).map((report) => ({
        ...report,
        createdAt: new Date(report.createdAt),
        images:
          report.photos?.map((p) =>
            typeof p === "string" ? p : p.storageUrl
          ) || [],
      }));

      formattedReports.sort((a, b) => b.createdAt - a.createdAt);

      setReports(formattedReports);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setApiError("Unable to load data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [user, isStaffMember, statusFilter, categoryFilter]);

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
      if (result?.error) throw new Error(result.error);
      if (!result?.assignee) return { noOfficerFound: true };
      return { success: true, assignee: result.assignee };
    } catch (error) {
      console.error("Error approving report:", error);
      throw error;
    }
  };

  const handleRejectReport = async (reportId, reason) => {
    try {
      await updateReportStatus(reportId, "Rejected", reason);
      return true;
    } catch (error) {
      console.error("Error rejecting report:", error);
      return false;
    }
  };

  const handleReportUpdateFromModal = async (reportId, updates) => {
    await fetchReportsData();
    setSelectedReport((prev) =>
      prev && prev.id === reportId ? { ...prev, ...updates } : prev
    );
  };

  const renderTable = (tableReports, handleView) => {
    return (
      <Table responsive hover className="mu-table mb-0 align-middle">
        <thead className="bg-light text-uppercase small text-muted">
          <tr>
            <th className="ps-4">Category</th>
            <th>Title</th>
            <th>Date</th>
            <th>Assigned External</th>
            <th>Status</th>
            <th className="text-end pe-4">Action</th>
          </tr>
        </thead>
        <tbody>
          <ReportsTableBody reports={tableReports} handleShow={handleView} />
        </tbody>
      </Table>
    );
  };

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

        <ReportsFilters
          isCategoryFilterDisabled={isCategoryFilterDisabled}
          categoryFilter={categoryFilter}
          statusFilter={statusFilter}
          allCategories={allCategories}
          availableStatuses={availableStatuses}
          setCategoryFilter={setCategoryFilter}
          setStatusFilter={setStatusFilter}
        />
      </div>

      {/* Error Alert */}
      {apiError && (
        <Alert variant="danger" onClose={() => setApiError(null)} dismissible>
          {apiError}
        </Alert>
      )}

      {/* Table Card */}
      <Card
        className="mu-home-card border-0 shadow-sm"
        style={{ minHeight: "300px" }}
      >
        {isLoading ? (
          <div className="text-center p-5"></div>
        ) : (
          <Card.Body className="p-0">
            {reports.length === 0 ? (
              <div className="text-center p-5 text-muted">
                <h5>No reports found</h5>
                <p className="mb-0">
                  There are no reports matching the current criteria (
                  {statusFilter || "All Statuses"}).
                </p>
              </div>
            ) : (
              renderTable(reports, handleShow)
            )}
          </Card.Body>
        )}
      </Card>

      {/* Report Detail Modal */}
      <ReportDetails
        show={showModal}
        onHide={handleClose}
        report={selectedReport}
        user={user}
        onApprove={handleAcceptReport}
        onReject={handleRejectReport}
        onReportUpdated={handleReportUpdateFromModal}
        onStatusUpdate={fetchReportsData}
      />
    </Container>
  );
}

MunicipalityUserHome.propTypes = {
  user: PropTypes.shape({
    role_name: PropTypes.string,
  }).isRequired,
};