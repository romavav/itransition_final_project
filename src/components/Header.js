import { Link } from "react-router-dom"; // Импортируем компонент Link из библиотеки react-router-dom для навигации между страницами без перезагрузки
import { Navbar, Nav } from "react-bootstrap"; // Импортируем компоненты Navbar и Nav из библиотеки react-bootstrap для создания навигационной панели
import "bootstrap/dist/css/bootstrap.min.css"; // Подключаем стили Bootstrap для использования в компонентах
import "../styles/Header.css"; // Подключаем собственные стили для компонента Header

// Создаем функциональный компонент Header, который принимает два пропса: isAuthenticated и userLogin
const Header = ({ isAuthenticated, userLogin }) => {
  return (
    <Navbar className="nav-main" bg="light" expand="lg">
      {/* Создаем компонент Navbar с классом nav-main, фоновым цветом light и возможностью расширения на больших экранах */}
      <Navbar.Brand>Моя коллекция</Navbar.Brand>
      {/* Заголовок для navbar с названием сайта */}
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      {/* Компонент для переключения навигации на малых экранах */}
      <Navbar.Collapse id="basic-navbar-nav">
        {/* Обертка для collapsible контента Navbar */}
        <Nav className="mr-auto nav-center">
          {/* Компонент Nav для группировки ссылок, смещенный вправо */}
          <Nav.Link as={Link} to="/" className="nav-link nav-about">
            {/* Ссылка для навигации на Главную страницу */}
            Главная
          </Nav.Link>
        </Nav>
        <Nav className="ml-auto">
          {/* Компонент Nav для группировки ссылок, смещенный влево */}
          {!isAuthenticated && ( // Если пользователь не аутентифицирован, отображаем две ссылки
            <Nav.Link as={Link} to="/register" className="nav-link">
              {/* Ссылка для навигации на страницу регистрации */}
              Регистрация
            </Nav.Link>
          )}
          {!isAuthenticated && ( // Если пользователь не аутентифицирован, отображаем вход
            <Nav.Link as={Link} to="/login" className="nav-link">
              {/* Ссылка для навигации на страницу входа */}
              Вход
            </Nav.Link>
          )}
          {isAuthenticated && ( // Если пользователь аутентифицирован, приветствуем его по имени
            <Nav.Link as={Link} to="/profile">
              {/* Ссылка для навигации на профиль пользователя */}
              Привет, {userLogin}
            </Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header; // Экспортируем компонент Header для его использования в других частях приложения
