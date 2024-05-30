import { useState } from "react";

export const SendMessage = ({ authUser }) => {
    const [message, setMessage] = useState('');

    const sendMessage = async () => {
        // Отправка сообщения и отображение имени пользователя
        console.log(`Пользователь ${authUser.displayName} отправил сообщение: ${message}`);
    };

    return (
        <div>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button onClick={sendMessage}>Отправить сообщение</button>
        </div>
    );
};