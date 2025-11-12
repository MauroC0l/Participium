import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import MunicipalityUserForm from './MunicipalityUserForm';
import MunicipalityUserList from './MunicipalityUserList';

export default function AdminHome() {
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUserCreated = (newUser) => {
    console.log("New user created:", newUser);
    setRefreshTrigger(prev => prev + 1);
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  return (
    <Container 
      fluid 
      className="py-5" 
      style={{ 
        backgroundColor: 'var(--bg-lighter)', 
        minHeight: 'calc(100vh - 120px)' 
      }}
    >
      {showForm ? (
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            <MunicipalityUserForm
              onUserCreated={handleUserCreated}
              onCancel={handleCancel}
            />
          </Col>
        </Row>
      ) : (
        <> 
          <Row className="mb-5">
            <Col>
              <h2 
                style={{ 
                  color: 'var(--primary)',
                  fontWeight: 'var(--font-bold)',
                  fontSize: 'var(--font-xxxl)',
                  marginBottom: 'var(--spacing-sm)'
                }}
              >
                Administrator Dashboard
              </h2>
              <p 
                className="text-muted mb-0" 
                style={{ fontSize: 'var(--font-lg)' }}
              >
                Manage municipality users and their access to the platform.
              </p>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col className="d-flex justify-content-between align-items-center">
              <h3 
                className="mb-0" 
                style={{ 
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--text-primary)'
                }}
              >
                Municipality Users
              </h3>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowForm(true)}
                style={{
                  fontWeight: 'var(--font-semibold)',
                  padding: '0.75rem 2rem'
                }}
              >
                + Add New User
              </Button>
            </Col>
          </Row>

          <Row>
            <Col>
              <MunicipalityUserList refreshTrigger={refreshTrigger} />
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}