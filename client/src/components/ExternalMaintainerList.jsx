import { useState, useEffect } from "react";
import { Alert, Modal, InputGroup } from "react-bootstrap";
import { FaUser, FaEnvelope, FaUserShield, FaSave, FaBuilding } from "react-icons/fa";
import { 
  getAllMunicipalityUsers, 
  deleteMunicipalityUser,
  updateMunicipalityUser
} from "../api/municipalityUserApi";

import "../css/ExternalMaintainerList.css"; 

export default function ExternalMaintainerList({ refreshTrigger }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: "", email: "", firstName: "", lastName: "", role: "", companyName: "" });
  const [editLoading, setEditLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // --- FILTER LOGIC (HARDCODED) ---
  // Filtra solo gli utenti con:
  // Department: "External Service Provider"
  // Role: "External Maintainer"
  const filterExternalMaintainers = (allUsers) => {
    return allUsers.filter(user => {
      const dept = user.department_name ? user.department_name.toLowerCase() : "";
      const role = user.role_name ? user.role_name.toLowerCase() : "";
      
      return dept === "external service provider" && role === "external maintainer";
    });
  };

  // Initial Data Fetch
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const usersData = await getAllMunicipalityUsers();
        console.log("Fetched users data:", usersData);
        // Applica il filtro immediatamente sui dati grezzi
        const filteredData = filterExternalMaintainers(usersData);
        setUsers(filteredData);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        if (err.status === 403) {
          setError("You don't have permission to view data.");
        } else if (err.status === 401) {
          setError("You are not authenticated.");
        } else {
          setError(`Failed to load data: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [refreshTrigger]);

  const fetchUsers = async () => {
    try {
      const usersList = await getAllMunicipalityUsers();
      const filteredData = filterExternalMaintainers(usersList);
      setUsers(filteredData);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(`Failed to load users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Edit Modal Functions ---
  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      role: user.role_name,
      // Se l'utente ha un campo company_name nel DB, lo mostriamo, altrimenti vuoto
      companyName: user.company_name || "" 
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!editForm.email.trim() || !editForm.firstName.trim() || !editForm.lastName.trim()) {
      setError("All fields are required");
      return;
    }

    setEditLoading(true);

    try {
      // Nota: Non inviamo il ruolo per cambiarlo, assumiamo che rimanga External Maintainer
      // Se il backend richiede tutti i campi, includiamo role.
      const payload = {
        email: editForm.email,
        first_name: editForm.firstName,
        last_name: editForm.lastName,
        role: editForm.role, 
        // company_name: editForm.companyName // Scommentare se il backend supporta l'update della company
      };

      await updateMunicipalityUser(editingUser.id, payload);
      
      setSuccess(`User "${editForm.username}" updated successfully!`);
      setShowEditModal(false);
      await fetchUsers(); // Ricarica e rifiltra la lista

      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      console.error("Failed to update user:", err);
      if (err.status === 409) setError("Username or email already exists.");
      else if (err.status === 403) setError("You don't have permission to update users.");
      else if (err.status === 404) setError("User not found.");
      else setError(err.message || "Failed to update user.");
    } finally {
      setEditLoading(false);
    }
  };

  // --- Delete Modal Functions ---
  const handleDeleteClick = (user) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setError("");
    setSuccess("");
    setDeleteLoading(true);

    try {
      await deleteMunicipalityUser(deletingUser.id);
      setSuccess(`User "${deletingUser.username}" deleted successfully!`);
      setShowDeleteModal(false);
      setDeletingUser(null);
      await fetchUsers();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      console.error("Failed to delete user:", err);
      if (err.status === 403) setError("You don't have permission to delete users.");
      else if (err.status === 404) setError("User not found.");
      else setError(err.message || "Failed to delete user.");
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="externalMaintainerList-modern">
      {/* Header */}
      <div className="eml-header">
        <h1 className="eml-title">External Maintainers Management</h1>
        <div className="eml-subtitle text-muted">
            Viewing only <strong>External Service Provider</strong> personnel
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible className="mb-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess("")} dismissible className="mb-4">
          {success}
        </Alert>
      )}

      {/* Main Card */}
      <div className="eml-card">
        <div className="eml-card-body">
          {loading ? (
            <div className="eml-loading">
              <div className="eml-loading-content">
                <div className="eml-loading-spinner"></div>
                <div>Loading maintainers...</div>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="eml-empty">
              <div className="eml-empty-content">
                <div className="eml-empty-icon">👷</div>
                <div>No External Maintainers found.</div>
              </div>
            </div>
          ) : (
            <div className="eml-table-wrapper">
              <table className="eml-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Company</th> {/* Aggiunto campo Company se disponibile */}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td><strong>{user.username}</strong></td>
                      <td>{user.first_name} {user.last_name}</td>
                      <td>{user.email}</td>
                      <td><span className="eml-role-badge">{user.role_name}</span></td>
                      <td>
                        {user.company_name ? (
                            <span className="text-muted small"><FaBuilding className="me-1"/>{user.company_name}</span>
                        ) : (
                            <span className="text-muted small">-</span>
                        )}
                      </td>
                      <td>
                        <div className="eml-actions">
                          <button className="eml-btn eml-btn-edit" onClick={() => handleEdit(user)}>
                            Edit
                          </button>
                          <button className="eml-btn eml-btn-delete" onClick={() => handleDeleteClick(user)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered dialogClassName="eml-modal-content">
        <Modal.Header closeButton className="eml-modal-header">
          <Modal.Title className="eml-modal-title">Edit Maintainer</Modal.Title>
        </Modal.Header>
        <Modal.Body className="eml-modal-body">
          <form onSubmit={handleEditSubmit} className="eml-edit-form">
            <div className="name-row">
              <div className="eml-field">
                <label className="eml-label"><span className="eml-required">First Name</span></label>
                <InputGroup className="eml-input-group">
                    <InputGroup.Text className="eml-icon"><FaUser/></InputGroup.Text>
                    <input type="text" name="firstName" className="form-control eml-input" value={editForm.firstName} onChange={handleEditChange} required disabled={editLoading}/>
                </InputGroup>
              </div>
              <div className="eml-field">
                <label className="eml-label"><span className="eml-required">Last Name</span></label>
                <InputGroup className="eml-input-group">
                    <InputGroup.Text className="eml-icon"><FaUser/></InputGroup.Text>
                    <input type="text" name="lastName" className="form-control eml-input" value={editForm.lastName} onChange={handleEditChange} required disabled={editLoading}/>
                </InputGroup>
              </div>
            </div>

            <div className="eml-field">
              <label className="eml-label">Username</label>
              <InputGroup className="eml-input-group">
                    <InputGroup.Text className="eml-icon"><FaUser/></InputGroup.Text>
                    <input type="text" className="form-control eml-input eml-readonly" value={editForm.username} disabled />
              </InputGroup>
              <small className="eml-help-text">Username cannot be changed</small>
            </div>

            <div className="eml-field">
              <label className="eml-label"><span className="eml-required">Email</span></label>
              <InputGroup className="eml-input-group">
                    <InputGroup.Text className="eml-icon"><FaEnvelope/></InputGroup.Text>
                    <input type="email" name="email" className="form-control eml-input" value={editForm.email} onChange={handleEditChange} required disabled={editLoading}/>
              </InputGroup>
            </div>

            <div className="eml-field">
              <label className="eml-label">Role</label>
              <InputGroup className="eml-input-group">
                    <InputGroup.Text className="eml-icon"><FaUserShield/></InputGroup.Text>
                    <input type="text" className="form-control eml-input eml-readonly" value={editForm.role} disabled />
              </InputGroup>
              <small className="eml-help-text">Role is locked for this category</small>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer className="eml-modal-footer">
          <button className="eml-modal-btn eml-modal-btn-cancel" onClick={() => setShowEditModal(false)} disabled={editLoading}>
            Cancel
          </button>
          <button className="eml-modal-btn eml-modal-btn-confirm" onClick={handleEditSubmit} disabled={editLoading}>
            {editLoading ? "Saving..." : <><FaSave className="me-2"/> Save Changes</>}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered dialogClassName="eml-modal-content">
        <Modal.Header closeButton className="eml-modal-header">
          <Modal.Title className="eml-modal-title">Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="eml-modal-body">
          {deletingUser && (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗑️</div>
              <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                Delete <strong>{deletingUser.username}</strong>?
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                This action cannot be undone.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="eml-modal-footer">
          <button className="eml-modal-btn eml-modal-btn-cancel" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>
            Cancel
          </button>
          <button className="eml-modal-btn eml-modal-btn-danger" onClick={handleDeleteConfirm} disabled={deleteLoading}>
            {deleteLoading ? "Deleting..." : "Delete User"}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}