import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { 
  FaTimes, 
  FaUser, 
  FaMapMarkerAlt, 
  FaHardHat, 
  FaCalendarAlt, 
  FaTag, 
  FaInfoCircle,
  FaCamera,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaExclamationCircle
} from "react-icons/fa";
import "../css/ReportDetails.css";

const ReportDetails = ({ show, onHide, report, user, onApprove, onReject }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  
  // Stati per la gestione azioni
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  
  // Stati messaggi
  const [errorMsg, setErrorMsg] = useState(""); 
  const [assignmentWarning, setAssignmentWarning] = useState(""); 

  // --- 1. RESET LOGIC ---
  useEffect(() => {
    if (show) {
      setIsRejecting(false);
      setRejectionReason("");
      setErrorMsg("");
      setAssignmentWarning("");
    }
  }, [show]);

  if (!report) return null;

  // --- Helpers ---
  const openImage = (imgUrl) => {
    setSelectedImage(imgUrl);
    setShowImageModal(true);
  };

  const formatLocation = (loc) => {
    if (!loc) return "N/A";
    if (loc.latitude && loc.longitude) {
      return `${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}`;
    }
    if (loc.type === "Point" && Array.isArray(loc.coordinates)) {
      const [lng, lat] = loc.coordinates; 
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
    return "N/A";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const getReporterName = () => {
    if (report.isAnonymous || report.is_anonymous) return "Anonymous User";
    if (report.reporter) return `${report.reporter.first_name} ${report.reporter.last_name}`;
    return "Unknown User";
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'status-success';
      case 'rejected': return 'status-danger';
      case 'assigned': return 'status-primary';
      case 'pending approval': return 'status-warning';
      default: return 'status-default';
    }
  };

  const canManage = user && (
    user.role_name === "Administrator" || 
    user.role_name.toLowerCase() === "municipal public relations officer"
  );

  const photos = report.photos
    ? report.photos.map((p) => (typeof p === "string" ? p : p.storageUrl))
    : report.images || [];

  // --- Action Handlers ---

  const handleRejectClick = () => {
    setIsRejecting(true);
    setErrorMsg("");
    setAssignmentWarning("");
  };

  const handleCancelReject = () => {
    setIsRejecting(false);
    setRejectionReason("");
    setErrorMsg("");
  };

  const handleSubmitReject = async () => {
    if (!rejectionReason.trim()) {
      setErrorMsg("Please provide a reason for rejection.");
      return;
    }
    
    try {
        const success = await onReject(report.id, rejectionReason);
        // --- 2. CLOSE LOGIC ---
        if (success) {
            onHide(); 
        }
    } catch (err) {
        setErrorMsg(err.message || "Error rejecting report");
    }
  };

  const handleApproveClick = async () => {
    setAssignmentWarning(""); 
    setErrorMsg(""); 

    try {
      const result = await onApprove(report.id);

      if (result && result.error) {
         setErrorMsg(result.error);
         return;
      }

      onHide();
      
    } catch (error) {
      console.error("Approval error in modal:", error);
      setErrorMsg(error.message || "An unexpected error occurred while approving the report.");
    }
  };

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        size="xl"
        centered
        scrollable
        className="rdm-modal"
      >
        <Modal.Header className="rdm-header">
          <div className="rdm-header-content">
            <h2 className="rdm-title">{report.title}</h2>
            <div className="rdm-header-meta">
              <span className={`rdm-badge ${getStatusClass(report.status)}`}>
                {report.status || "Open"}
              </span>
              <span className="rdm-badge category">
                <FaTag className="rdm-badge-icon"/> {report.category}
              </span>
            </div>
          </div>
          <button className="rdm-close-btn" onClick={onHide}>
            <FaTimes />
          </button>
        </Modal.Header>

        <Modal.Body className="rdm-body">
          <div className="rdm-grid-layout">
            
            {/* LEFT COLUMN */}
            <div className="rdm-main-content">
              
              <div className="rdm-section">
                <h3 className="rdm-section-title">
                  <FaInfoCircle /> Description
                </h3>
                <div className="rdm-description-box">
                  {report.description || "No description provided."}
                </div>
              </div>

              {photos.length > 0 ? (
                <div className="rdm-section">
                  <h3 className="rdm-section-title">
                    <FaCamera /> Evidence ({photos.length})
                  </h3>
                  <div className="rdm-photo-grid">
                    {photos.map((photo, index) => (
                      <div
                        key={index}
                        className="rdm-photo-card"
                        onClick={() => openImage(photo)}
                      >
                        <img src={photo} alt={`Evidence ${index}`} loading="lazy" />
                        <div className="rdm-photo-overlay">
                          <span>View Fullscreen</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rdm-section">
                    <p className="text-muted fst-italic mt-3">No images attached to this report.</p>
                </div>
              )}

              {/* ACTION AREA */}
              {canManage && report.status === "Pending Approval" && (
                <div className="rdm-actions-area">
                  
                  {/* WARNING ALERT */}
                  {assignmentWarning && (
                    <div className="rdm-alert rdm-alert-warning animate-shake">
                      <div className="rdm-alert-icon-box">
                        <FaExclamationTriangle />
                      </div>
                      <div className="rdm-alert-content">
                        <h6 className="rdm-alert-title">Assignment Warning</h6>
                        <p className="rdm-alert-msg">{assignmentWarning}</p>
                      </div>
                      <Button size="sm" variant="outline-warning" className="rdm-alert-btn" onClick={() => setAssignmentWarning("")}>
                        Understood
                      </Button>
                    </div>
                  )}

                  {/* ERROR ALERT */}
                  {errorMsg && !isRejecting && (
                    <div className="rdm-alert rdm-alert-error animate-shake">
                      <div className="rdm-alert-icon-box">
                        <FaExclamationCircle />
                      </div>
                      <div className="rdm-alert-content">
                        <h6 className="rdm-alert-title">Error</h6>
                        <p className="rdm-alert-msg">{errorMsg}</p>
                      </div>
                      <Button size="sm" variant="outline-danger" className="rdm-alert-btn" onClick={() => setErrorMsg("")}>
                        Dismiss
                      </Button>
                    </div>
                  )}

                  {/* PULSANTI E FORM */}
                  {!isRejecting ? (
                    <div className="d-flex justify-content-end gap-3 mt-3">
                      <Button variant="outline-danger" className="rdm-btn-reject" onClick={handleRejectClick}>
                        <FaTimesCircle className="me-2"/> Reject Report
                      </Button>
                      <Button variant="success" className="rdm-btn-approve" onClick={handleApproveClick}>
                        <FaCheckCircle className="me-2"/> Accept & Assign
                      </Button>
                    </div>
                  ) : (
                    // --- 3. MARKUP RIVISTO (Stile più classico) ---
                    <div className="rdm-reject-wrapper">
                      <div className="rdm-reject-header">
                        <FaExclamationTriangle /> Reject Report
                      </div>
                      
                      <Form.Group className="mb-3">
                        <Form.Label className="rdm-reject-label">Reason for rejection (Required)</Form.Label>
                        <Form.Control
                          as="textarea"
                          className={`rdm-reject-textarea ${errorMsg ? 'is-invalid' : ''}`}
                          rows={3}
                          placeholder="Please describe why this report is being rejected..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        />
                         <Form.Control.Feedback type="invalid">
                          {errorMsg}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <div className="rdm-reject-actions">
                        <Button variant="secondary" className="rdm-btn-cancel" onClick={handleCancelReject}>
                          Cancel
                        </Button>
                        <Button variant="danger" className="rdm-btn-confirm-reject" onClick={handleSubmitReject}>
                          Confirm Rejection
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="rdm-id-footer">
                Report ID: #{report.id}
              </div>

            </div>

            {/* RIGHT COLUMN: Sidebar */}
            <div className="rdm-sidebar">
              
              <div className="rdm-info-card">
                <h4 className="rdm-card-label">Timeline</h4>
                <div className="rdm-info-row">
                  <div className="rdm-icon-box"><FaCalendarAlt /></div>
                  <div>
                    <span className="rdm-label">Created</span>
                    <div className="rdm-value">{formatDate(report.createdAt)}</div>
                  </div>
                </div>
              </div>

              <div className="rdm-info-card">
                <h4 className="rdm-card-label">Involved Parties</h4>
                
                <div className="rdm-info-row">
                  <div className="rdm-icon-box"><FaUser /></div>
                  <div>
                    <span className="rdm-label">Reporter</span>
                    <div className="rdm-value highlight">{getReporterName()}</div>
                  </div>
                </div>

                <div className="rdm-info-row">
                  <div className="rdm-icon-box assignee"><FaHardHat /></div>
                  <div>
                    <span className="rdm-label">Technician ID:</span>
                    <div className="rdm-value highlight">
                      {report.assignee ? `${report.assignee.id}` : <span className="text-muted">Not assigned yet</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rdm-info-card">
                <h4 className="rdm-card-label">Location Data</h4>
                <div className="rdm-info-row">
                  <div className="rdm-icon-box location"><FaMapMarkerAlt /></div>
                  <div>
                    <span className="rdm-label">Coordinates</span>
                    <div className="rdm-value font-monospace">
                      {formatLocation(report.location)}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Lightbox */}
      <Modal 
        show={showImageModal} 
        onHide={() => setShowImageModal(false)} 
        centered 
        className="rdm-lightbox"
        backdropClassName="rdm-lightbox-backdrop"
      >
        <div className="rdm-lightbox-container" onClick={() => setShowImageModal(false)}>
            <button className="rdm-lightbox-close" onClick={() => setShowImageModal(false)}><FaTimes /></button>
            <img src={selectedImage} alt="Full Detail" className="rdm-lightbox-img" onClick={(e) => e.stopPropagation()} />
        </div>
      </Modal>
    </>
  );
};

export default ReportDetails;