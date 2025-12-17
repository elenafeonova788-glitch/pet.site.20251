import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Dropdown } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import QuickSearch from '../components/QuickSearch';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти из системы?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <Navbar expand="lg" className="custom-navbar navbar-expand-lg navbar-light" style={{ backgroundColor: '#2f4f4f' }}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="navbar-brand">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/11647/11647571.png" 
            className="logo-img rounded-3" 
            alt="logo" 
            style={{ height: '40px' }}
          />
          <span className="ms-2 fw-bold align-middle text-white">GET PET BACK</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="navbarNav" style={{ borderColor: '#28a745' }} />
        
        <Navbar.Collapse id="navbarNav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/add-pet" 
              className={isActive('/add-pet') ? 'active text-success' : 'text-white'}
              style={{ 
                fontWeight: isActive('/add-pet') ? 'bold' : 'normal',
                borderBottom: isActive('/add-pet') ? '2px solid #28a745' : 'none'
              }}
            >
              Добавить объявление
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/search" 
              className={isActive('/search') ? 'active text-success' : 'text-white'}
              style={{ 
                fontWeight: isActive('/search') ? 'bold' : 'normal',
                borderBottom: isActive('/search') ? '2px solid #28a745' : 'none'
              }}
            >
              Поиск по объявлениям
            </Nav.Link>
          </Nav>
          
          {/* Блок быстрого поиска - центр навбара */}
          <div className="mx-3 flex-grow-1" style={{ maxWidth: '500px' }}>
            <QuickSearch />
          </div>
          
          {/* Блок авторизации/пользователя - правая часть */}
          {!isAuthenticated ? (
            <div id="authSection" className="d-flex">
              <Button 
                as={Link} 
                to="/register" 
                variant="outline-success" 
                className="ms-2"
                style={{ 
                  borderColor: '#28a745', 
                  color: '#28a745',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#28a745';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#28a745';
                }}
              >
                Регистрация
              </Button>
              <Button 
                as={Link} 
                to="/login" 
                variant="success" 
                className="ms-2"
                id="loginBtn"
                style={{ 
                  backgroundColor: '#28a745', 
                  borderColor: '#28a745',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#218838';
                  e.currentTarget.style.borderColor = '#1e7e34';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#28a745';
                  e.currentTarget.style.borderColor = '#28a745';
                }}
              >
                Вход
              </Button>
            </div>
          ) : (
            <div id="userSection">
              <Dropdown>
                <Dropdown.Toggle 
                  variant="success" 
                  id="userDropdown"
                  style={{ 
                    backgroundColor: '#28a745', 
                    borderColor: '#28a745',
                    fontWeight: '600'
                  }}
                >
                  <i className="bi bi-person-circle me-2"></i>
                  {user?.name || user?.email?.split('@')[0] || 'Пользователь'}
                </Dropdown.Toggle>
                
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">
                    <i className="bi bi-person me-2 text-success"></i>
                    Личный кабинет
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2 text-danger"></i>
                    Выйти
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;