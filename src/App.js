import React, { useEffect, useState } from "react"; // Импортируем React и хуки useEffect и useState
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Импортируем маршруты для приложения
import Header from "./components/Header.js"; // Импортируем компонент Header
import Dashboard from "./components/Dashboard.js"; // Импортируем компонент Dashboard
import { SignUp } from "./components/auth/SignUp.jsx"; // Импортируем компонент регистрации
import { SignIn } from "./components/auth/SignIn.jsx"; // Импортируем компонент входа
import AuthDetails from "./components/auth/AuthDetails.jsx"; // Импортируем компонент для отображения информации о пользователе
import { onAuthStateChanged } from "firebase/auth"; // Импортируем функцию для отслеживания состояния аутентификации
import { auth } from "./firebase"; // Импортируем объект аутентификации Firebase

const App = () => {
  // Определяем основной функциональный компонент приложения
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Состояние для проверки авторизации пользователя
  const [userLogin, setUserLogin] = useState(""); // Состояние для хранения имени или электронной почты пользователя

  useEffect(() => {
    // Используем хук useEffect для отслеживания состояния аутентификации
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Подписываемся на изменения состояния аутентификации
      if (user) {
        // Если пользователь аутентифицирован
        setIsAuthenticated(true); // Обновляем состояние аутентификации
        setUserLogin(user.displayName || user.email); // Устанавливаем имя или email пользователя
      } else {
        // Если пользователь не аутентифицирован
        setIsAuthenticated(false); // Обновляем состояние аутентификации на false
        setUserLogin(""); // Очищаем состояние пользователя
      }
    });

    return () => unsubscribe(); // Возвращаем функцию отписки при размонтировании компонента
  }, []); // Пустой массив зависимостей, хук выполняется только при монтировании

  return (
    // Возвращаем JSX-шаблон
    <Router>
      {" "}
      {/* Оборачиваем в Router для поддержки маршрутизации */}
      <div>
        {" "}
        {/* Оборачиваем в div для группировки элементов */}
        <Header isAuthenticated={isAuthenticated} userLogin={userLogin} />
        {/* Компонент Header с пропсами для аутентификации */}
        <Routes>
          {" "}
          {/* Определяем маршруты приложения */}
          <Route path="/" element={<Dashboard />} />
          {/* Главная страница, компонент Dashboard */}
          <Route path="/collection/:id" element={<Dashboard />} />
          {/* Маршрут для коллекции с ID */}
          {isAuthenticated ? ( // Если пользователь аутентифицирован
            <Route path="/profile" element={<AuthDetails />} /> // Путь к профилю пользователя
          ) : (
            // Если пользователь не аутентифицирован
            <Route path="/login" element={<SignIn />} /> // Путь к странице входа
          )}
          {!isAuthenticated && <Route path="/register" element={<SignUp />} />}{" "}
          {/* Путь к регистрации, если пользователь не аутентифицирован */}
        </Routes>{" "}
        {/* Закрываем маршруты */}
      </div>{" "}
      {/* Закрываем div */}
    </Router> // Закрываем Router
  );
}; // Закрываем компонент

export default App; // Экспортируем App компонент как модуль
