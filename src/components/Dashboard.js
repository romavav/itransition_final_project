import React, { useState, useEffect } from "react"; // Импортируем React и необходимые хуки useState и useEffect
import { collection, getDocs, addDoc } from "firebase/firestore"; // Импортируем функции для работы с Firestore
import { db } from "../firebase"; // Импортируем инициализированную базу данных Firebase
import SearchBar from "./SearchBar"; // Импортируем компонент строки поиска
import CollectionList from "./CollectionList"; // Импортируем компонент списка коллекций
import CollectionModal from "./CollectionModal"; // Импортируем модальное окно для добавления коллекций
import EditCollectionModal from "./EditCollectionModal"; // Импортируем модальное окно для редактирования коллекций
import "../styles/Dashboard.css"; // Импортируем CSS стили для компонента Dashboard

const Dashboard = () => {
  // Объявляем компонент Dashboard
  const [searchTerm, setSearchTerm] = useState(""); // Создаем состояние для хранения поискового запроса
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние для контроля открытия модального окна
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Состояние для контроля открытия модального окна редактирования
  const [collections, setCollections] = useState([]); // Состояние для хранения списка коллекций
  const [editingCollection, setEditingCollection] = useState({}); // Состояние для хранения данных редактируемой коллекции
  const [showModal, setShowModal] = useState({}); // Состояние для управления модальными окнами, может быть обновлено для конкретных модулей

  useEffect(() => {
    // Используем useEffect для загрузки данных о коллекциях при монтировании компонента
    const loadCollections = async () => {
      // Асинхронная функция для загрузки данных о коллекциях
      const collectionsRef = collection(db, "collections"); // Получаем ссылку на коллекцию 'collections' в базе данных
      const snapshot = await getDocs(collectionsRef); // Запрашиваем все документы из коллекции
      const collectionsData = []; // Массив для хранения данных о коллекциях

      for (const collectionDoc of snapshot.docs) {
        // Перебираем каждый документ из полученного снимка
        const commentsRef = collection(collectionDoc.ref, "comments"); // Получаем ссылку на подколлекцию 'comments' для текущей коллекции
        const commentsSnapshot = await getDocs(commentsRef); // Получаем все комментарии для текущей коллекции
        const commentsData = commentsSnapshot.docs.map((commentDoc) => ({
          // Формируем массив комментариев
          id: commentDoc.id, // Сохраняем id комментария
          ...commentDoc.data(), // Добавляем остальные данные комментария
        }));

        const collectionData = {
          // Формируем объект для текущей коллекции
          id: collectionDoc.id, // Добавляем id коллекции
          ...collectionDoc.data(), // Добавляем остальные данные коллекции
          comments: commentsData, // Добавляем данные о комментариях
        };
        collectionsData.push(collectionData); // Добавляем объект коллекции в массив
      }

      setCollections(collectionsData); // Обновляем состояние коллекций
    };

    loadCollections(); // Вызываем функцию загрузки коллекций
  }, []); // Пустой массив зависимостей означает, что эффект запускается только один раз, при первом маунте

  const openModal = () => {
    // Функция для открытия модального окна
    setIsModalOpen(true); // Устанавливаем состояние открытия модального окна на true
  };

  const closeModal = () => {
    // Функция для закрытия модального окна
    setIsModalOpen(false); // Устанавливаем состояние открытия модального окна на false
  };

  const openEditModal = (collection) => {
    // Функция для открытия модального окна редактирования
    setEditingCollection(collection); // Устанавливаем редактируемую коллекцию
    setIsEditModalOpen(true); // Открываем модальное окно редактирования
  };

  const closeEditModal = () => {
    // Функция для закрытия модального окна редактирования
    setIsEditModalOpen(false); // Закрываем модальное окно редактирования
  };

  const handleSearch = (event) => {
    // Функция для обработки изменений в поисковой строке
    setSearchTerm(event.target.value); // Обновляем состояние с поисковым запросом
  };

  const addCollection = async (name, description, category, image) => {
    // Асинхронная функция для добавления новой коллекции
    const newCollection = {
      // Объект с данными новой коллекции
      name, // Название коллекции
      description, // Описание коллекции
      category, // Категория коллекции
      image, // Изображение коллекции
      likes: 0, // Начальное количество лайков
      comments: [], // Начальный массив комментариев
    };

    const docRef = await addDoc(collection(db, "collections"), newCollection); // Добавляем новую коллекцию в Firestore и получаем ссылку на документ
    setCollections([...collections, { id: docRef.id, ...newCollection }]); // Обновляем состояние с коллекциями, добавляя новую
    closeModal(); // Закрываем модальное окно после добавления
  };

  const filteredCollections = collections.filter(
    (
      collection // Фильтруем коллекции по поисковому запросу
    ) => collection.name.toLowerCase().includes(searchTerm.toLowerCase()) // Если название коллекции включает поисковый запрос
  );

  return (
    // Возвращаем JSX для отображения компонент
    <div className="container">
      {/* Обертка для компонента */}
      <SearchBar onSearch={handleSearch} onAddClick={openModal} />
      {/* Строка поиска должна передать обработчики */}
      <CollectionList
        collections={filteredCollections} // Передаем фильтрованные коллекции
        onEdit={openEditModal} // Передаем функцию для редактирования коллекций
        setCollections={setCollections} // Передаем функцию для обновления состояния с коллекциями
        showModal={showModal} // Передаем состояние для показа модального окна
        setShowModal={setShowModal} // Передаем функцию для обновления состояния показа модального окна
      />
      <CollectionModal
        isOpen={isModalOpen} // Передаем состояние, открыто ли модальное окно
        onClose={closeModal} // Передаем функцию закрытия модального окна
        onAddCollection={addCollection} // Передаем функцию для добавления коллекции
      />
      <EditCollectionModal
        isOpen={isEditModalOpen} // Передаем состояние, открыто ли модальное окно редактирования
        onClose={closeEditModal} // Передаем функцию для закрытия модального окна редактирования
        collection={editingCollection} // Передаем данные редактируемой коллекции
        setCollections={setCollections} // Передаем функцию для обновления состояния с коллекциями
      />
    </div>
  );
};

export default Dashboard; // Экспортируем компонент Dashboard
