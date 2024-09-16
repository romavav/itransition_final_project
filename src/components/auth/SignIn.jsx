import React, { useState } from "react";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import "./login.css";
import { useNavigate } from "react-router-dom";

export const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function login(e) {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        setError("");
        setEmail("");
        setPassword("");
        navigate("/profile");
      })
      .catch((error) => {
        setError("Аккаунт не найден");
      });
  }

  return (
    <div>
      <h2 className="login">Войти</h2>
      <form className="login__form" onSubmit={login}>
        <input
          className="login__input"
          value={email}
          placeholder="Введите свой e-mail"
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
        <input
          className="login__input"
          value={password}
          placeholder="Введите свой пароль"
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />
        <button className="login__button" type="submit">
          Войти
        </button>
        {error ? <p className="login__error">{error}</p> : ""}
      </form>
    </div>
  );
};

export default SignIn;
