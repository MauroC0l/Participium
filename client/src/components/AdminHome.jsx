import { useState } from 'react';
import { Container, Tab, Nav } from 'react-bootstrap';
// Aggiunta icona BsBuildingsFill per i manutentori esterni
import { BsPersonFillGear, BsPersonFillAdd, BsGearFill, BsBuildingsFill } from 'react-icons/bs';
import MunicipalityUserForm from './MunicipalityUserForm';
import MunicipalityUserList from './MunicipalityUserList';
import ExternalMaintainerList from './ExternalMaintainerList'; // <--- IMPORT DEL NUOVO COMPONENTE
import '../css/AdminHome.css';

export default function AdminHome() {
  const [activeTab, setActiveTab] = useState('users');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUserCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('users');
  };

  return (
    <Container fluid className="admin-home-container">
      <div className="admin-header-compact">
        <div>
          <h2 className="admin-title-modern">Admin Dashboard</h2>
          <p className="admin-subtitle-modern">Manage Municipality Officers & Externals</p>
        </div>
      </div>

      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <div className="admin-layout-wrapper">
          {/* Sidebar Navigation */}
          <div className="admin-sidebar">
            <Nav variant="pills" className="flex-column modern-pills">
              <Nav.Item>
                <Nav.Link eventKey="users">
                  <BsPersonFillGear className="me-2" /> Officers List
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link eventKey="add-user">
                  <BsPersonFillAdd className="me-2" /> Add Officer
                </Nav.Link>
              </Nav.Item>

              {/* --- NUOVA VOCE MENU PER EXTERNAL MAINTAINERS --- */}
              <Nav.Item>
                <Nav.Link eventKey="externals">
                  <BsBuildingsFill className="me-2" /> External Maintainers
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link eventKey="settings">
                  <BsGearFill className="me-2" /> Settings
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>

          {/* Main Content Area */}
          <div className="admin-content">
            <Tab.Content>
              {/* TAB 1: OFFICERS LIST */}
              <Tab.Pane eventKey="users">
                <div className="content-card">
                  <MunicipalityUserList refreshTrigger={refreshTrigger} />
                </div>
              </Tab.Pane>

              {/* TAB 2: EXTERNAL MAINTAINERS LIST */}
              <Tab.Pane eventKey="externals">
                <div className="content-card">
                  {/* Passo refreshTrigger se vuoi che si aggiorni insieme agli altri, altrimenti puoi rimuoverlo */}
                  <ExternalMaintainerList refreshTrigger={refreshTrigger} />
                </div>
              </Tab.Pane>

              {/* TAB 3: ADD OFFICER */}
              <Tab.Pane eventKey="add-user">
                <MunicipalityUserForm
                  onUserCreated={handleUserCreated}
                  onCancel={() => setActiveTab('users')}
                />
              </Tab.Pane>

              {/* TAB 4: SETTINGS */}
              <Tab.Pane eventKey="settings">
                <div className="content-card">
                  <div className="p-4 text-center text-muted">
                    <h5>Coming Soon</h5>
                    <p>Configuration panel under construction.</p>
                  </div>
                </div>
              </Tab.Pane>
            </Tab.Content>
          </div>
        </div>
      </Tab.Container>
    </Container>
  );
}