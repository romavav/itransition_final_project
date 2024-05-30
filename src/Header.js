import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const Header = ({ isAuthenticated, userLogin }) => {
  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand>Моя коллекция</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link as={Link} to="/">Главная</Nav.Link>
          <Nav.Link as={Link} to="/profile">Профиль</Nav.Link>
          <Nav.Link as={Link} to="/register">Регистрация</Nav.Link>
          <Nav.Link as={Link} to="/login">{isAuthenticated ? 'Профиль' : 'Вход'}</Nav.Link>
        </Nav>
        {isAuthenticated && <Nav>
          <Nav.Link disabled>Привет, {userLogin}</Nav.Link>
        </Nav>}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;