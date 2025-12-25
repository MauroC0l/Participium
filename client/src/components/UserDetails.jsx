import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { InputGroup, Button, Form, Table, Row, Col, Dropdown } from "react-bootstrap";
import { FaUser, FaEnvelope, FaUserShield, FaTrash, FaPlus, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import "../css/UserDetails.css";

export default function UserDetails({ user, departmentRolesMapping, onSave, onCancel, loading }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        roles: []
    });
    
    // New Role Selection State
    const [newRoleDept, setNewRoleDept] = useState("");
    const [newRoleName, setNewRoleName] = useState("");

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.first_name || "",
                lastName: user.last_name || "",
                email: user.email || "",
                roles: user.roles ? [...user.roles] : []
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRemoveRole = (index) => {
        setFormData(prev => ({
            ...prev,
            roles: prev.roles.filter((_, i) => i !== index)
        }));
    };

    const handleAddRole = () => {
        if (!newRoleDept || !newRoleName) return;

        // Find the mapping entry
        const mapping = departmentRolesMapping.find(
            dr => dr.department === newRoleDept && dr.role === newRoleName
        );

        if (mapping) {
            // Check if already exists
            const exists = formData.roles.some(r => r.department_role_id === mapping.id);
            if (!exists) {
                setFormData(prev => ({
                    ...prev,
                    roles: [...prev.roles, {
                        department_role_id: mapping.id,
                        department_name: newRoleDept,
                        role_name: newRoleName
                    }]
                }));
            }
        }
        setNewRoleDept("");
        setNewRoleName("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        setIsEditing(false);
    };

    // Filter roles based on selected department
    const availableRolesForDept = newRoleDept 
        ? [...new Set(departmentRolesMapping
            .filter(dr => dr.department === newRoleDept)
            .map(dr => dr.role))]
        : [];

    return (
        <div className="user-details-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>User Details</h3>
                {!isEditing ? (
                    <Button variant="primary" onClick={() => setIsEditing(true)} disabled={loading}>
                        <FaEdit className="me-2" /> Modify
                    </Button>
                ) : (
                    <div>
                        <Button variant="secondary" className="me-2" onClick={() => { setIsEditing(false); onCancel(); }} disabled={loading}>
                            <FaTimes className="me-2" /> Cancel
                        </Button>
                        <Button variant="success" onClick={handleSubmit} disabled={loading}>
                            <FaSave className="me-2" /> Save
                        </Button>
                    </div>
                )}
            </div>

            <Form onSubmit={handleSubmit}>
                {/* Basic Info - Compact Grid */}
                <Row className="mb-2">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>First Name</Form.Label>
                            <InputGroup>
                                <InputGroup.Text><FaUser /></InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    disabled={!isEditing || loading}
                                    required
                                />
                            </InputGroup>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Last Name</Form.Label>
                            <InputGroup>
                                <InputGroup.Text><FaUser /></InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    disabled={!isEditing || loading}
                                    required
                                />
                            </InputGroup>
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mb-2">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Email</Form.Label>
                            <InputGroup>
                                <InputGroup.Text><FaEnvelope /></InputGroup.Text>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!isEditing || loading}
                                    required
                                />
                            </InputGroup>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Username</Form.Label>
                            <InputGroup>
                                <InputGroup.Text><FaUserShield /></InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    value={user?.username || ""}
                                    disabled
                                    readOnly
                                />
                            </InputGroup>
                        </Form.Group>
                    </Col>
                </Row>

                {/* Roles Management */}
                <div className="roles-section mt-4">
                    <h5>Roles</h5>
                    <div className="roles-table-wrapper">
                        <Table striped hover size="sm">
                            <thead>
                                <tr>
                                    <th>Department</th>
                                    <th>Role</th>
                                    {isEditing && <th style={{ width: '50px' }}>Action</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {formData.roles.map((role, index) => (
                                    <tr key={index}>
                                        <td>{role.department_name}</td>
                                        <td>{role.role_name}</td>
                                        {isEditing && (
                                            <td className="text-center">
                                                <Button variant="danger" size="sm" onClick={() => handleRemoveRole(index)}>
                                                    <FaTrash />
                                                </Button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>

                    {isEditing && (
                        <div className="add-role-form p-3 bg-light rounded">
                            <h6>Add New Role</h6>
                            <Row>
                                <Col md={5}>
                                    <Dropdown 
                                        className="ud-dropdown"
                                        onSelect={(eventKey) => {
                                            setNewRoleDept(eventKey);
                                            setNewRoleName("");
                                        }}
                                    >
                                        <Dropdown.Toggle className="ud-dropdown-toggle" variant="light">
                                            <span>{newRoleDept || "Department..."}</span>
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu className="ud-dropdown-menu">
                                            {[...new Set(departmentRolesMapping.map(dr => dr.department))].map(dept => (
                                                <Dropdown.Item 
                                                    key={dept} 
                                                    eventKey={dept}
                                                    className="ud-dropdown-item"
                                                    active={newRoleDept === dept}
                                                >
                                                    {dept}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </Col>
                                <Col md={5}>
                                    <Dropdown 
                                        className="ud-dropdown"
                                        onSelect={(eventKey) => setNewRoleName(eventKey)}
                                    >
                                        <Dropdown.Toggle 
                                            className="ud-dropdown-toggle" 
                                            variant="light"
                                            disabled={!newRoleDept}
                                        >
                                            <span>{newRoleName || "Role..."}</span>
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu className="ud-dropdown-menu">
                                            {availableRolesForDept.map(role => (
                                                <Dropdown.Item 
                                                    key={role} 
                                                    eventKey={role}
                                                    className="ud-dropdown-item"
                                                    active={newRoleName === role}
                                                >
                                                    {role}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </Col>
                                <Col md={2}>
                                    <Button 
                                        variant="success" 
                                        onClick={handleAddRole} 
                                        disabled={!newRoleDept || !newRoleName}
                                        className="w-100"
                                    >
                                        <FaPlus /> Add
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    )}
                </div>
            </Form>
        </div>
    );
}

UserDetails.propTypes = {
    user: PropTypes.object,
    departmentRolesMapping: PropTypes.array,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    loading: PropTypes.bool
};