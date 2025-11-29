import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { 
  FaTimes, 
  FaUser, 
  FaMapMarkerAlt, 
  FaHardHat, 
  FaCalendarAlt, 
  FaTag, 
  FaInfoCircle,
  FaCamera
} from "react-icons/fa";
import "../css/ReportDetails.css";

const ReportDetails = ({ show, onHide, report }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

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
      const [lng, lat] = loc.coordinates; // GeoJSON is [lng, lat]
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

  const getAssigneeName = () => {
    if (report.assignee) return `${report.assignee.first_name} ${report.assignee.last_name}`;
    return "Unassigned";
  };

  // Status Color Logic
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'status-success';
      case 'rejected': return 'status-danger';
      case 'assigned': return 'status-primary'; // Blueish for assigned
      case 'pending approval': return 'status-warning';
      default: return 'status-default';
    }
  };

  // Parse photos safely
  const photos = report.photos
    ? report.photos.map((p) => (typeof p === "string" ? p : p.storageUrl))
    : report.images || [];

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        size="xl" // Extra large per un look dashboard
        centered
        scrollable
        className="rdm-modal"
      >
        {/* HEADER: Brand Gradient with Title & ID */}
        <Modal.Header className="rdm-header">
          <div className="rdm-header-content">
            <div className="rdm-id-badge">#{report.id}</div>
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
            
            {/* LEFT COLUMN: Main Content (Description & Photos) */}
            <div className="rdm-main-content">
              
              <div className="rdm-section">
                <h3 className="rdm-section-title">
                  <FaInfoCircle /> Description
                </h3>
                <div className="rdm-description-box">
                  {report.description || "No description provided."}
                </div>
              </div>

              {photos.length > 0 && (
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
                          <span>View</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Meta Data Sidebar */}
            <div className="rdm-sidebar">
              
              {/* Card 1: Timeline */}
              <div className="rdm-info-card">
                <h4 className="rdm-card-label">Timeline</h4>
                <div className="rdm-info-row">
                  <div className="rdm-icon-box"><FaCalendarAlt /></div>
                  <div>
                    <span className="rdm-label">Created</span>
                    <div className="rdm-value">{formatDate(report.createdAt)}</div>
                  </div>
                </div>
                {report.updatedAt && report.updatedAt !== report.createdAt && (
                   <div className="rdm-info-row">
                   <div className="rdm-icon-box secondary"><FaCalendarAlt /></div>
                   <div>
                     <span className="rdm-label">Last Update</span>
                     <div className="rdm-value">{formatDate(report.updatedAt)}</div>
                   </div>
                 </div>
                )}
              </div>

              {/* Card 2: People */}
              <div className="rdm-info-card">
                <h4 className="rdm-card-label">Involved Parties</h4>
                
                {/* Reporter */}
                <div className="rdm-info-row">
                  <div className="rdm-icon-box"><FaUser /></div>
                  <div>
                    <span className="rdm-label">Reporter</span>
                    <div className="rdm-value highlight">{getReporterName()}</div>
                  </div>
                </div>

                {/* Assignee (New!) */}
                <div className="rdm-info-row">
                  <div className="rdm-icon-box assignee"><FaHardHat /></div>
                  <div>
                    <span className="rdm-label">Technician ID:</span>
                    <div className="rdm-value highlight">
                      {report.assignee ? report.assignee.id : <span className="text-muted">Not assigned yet</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Location */}
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

      {/* Lightbox (Cleaned up) */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered size="xl" className="rdm-lightbox">
        <Modal.Body className="rdm-lightbox-body" onClick={() => setShowImageModal(false)}>
          <button className="rdm-lightbox-close"><FaTimes /></button>
          <img src={selectedImage} alt="Full Detail" onClick={(e) => e.stopPropagation()} />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ReportDetails;