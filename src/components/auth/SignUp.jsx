import React, { useState } from 'react'
import { auth } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import './login.css'
import { useNavigate } from 'react-router-dom';

export const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [copyPassword, setCopyPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    function register(e) {
        e.preventDefault();

        // Проверка на минимальную длину пароля
        // if (password.length < 6) {
        //     setError('Пароль должен содержать не менее 6 символов!');
        //     return;
        // }

        // Проверка на совпадение паролей
        if (copyPassword !== password) {
            setError('Пароль не совпадает!');
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((user) => {
                console.log(user);
                setError("");
                setEmail("");
                setCopyPassword("");
                setPassword(""); // Исправлено: сброс значения пароля
                navigate('/login');
            }).catch((error) => {
                console.log(error);
                setError(error.message); // Устанавливаем сообщение об ошибке
            });
    }

    return (
        <div>
            <h2 className='login'>Регистрация</h2>
            <form className='login__form' onSubmit={register}>
                <input
                    className='login__input'
                    value={email}
                    placeholder='Введите свой e-mail'
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                />
                <input
                    className='login__input'
                    value={password}
                    placeholder='Введите свой пароль'
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                />
                <input
                    className='login__input'
                    value={copyPassword}
                    placeholder='Введите пароль повторно'
                    onChange={(e) => setCopyPassword(e.target.value)}
                    type="password"
                />
                <button className='login__button' type='submit'>Создать аккаунт</button>
                {error ? <p className='login__error'>{error}</p> : ""}
            </form>
        </div>
    )
}

export default SignUp;