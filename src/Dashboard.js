import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import './Dashboard.css';


const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [newCollectionCategory, setNewCollectionCategory] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [editingCollection, setEditingCollection] = useState({ name: '', description: '', category: '' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [collections, setCollections] = useState([]);
  const [userLiked, setUserLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showModal, setShowModal] = useState(false);


  useEffect(() => {
    const loadCollections = async () => {
      const collectionsRef = collection(db, 'collections');
      const snapshot = await getDocs(collectionsRef);
      const collectionsData = [];

      for (const collectionDoc of snapshot.docs) {
        const commentsRef = collection(collectionDoc.ref, 'comments');
        const commentsSnapshot = await getDocs(commentsRef);
        const commentsData = commentsSnapshot.docs.map(commentDoc => commentDoc.data());

        const collectionData = { id: collectionDoc.id, ...collectionDoc.data(), comments: commentsData };
        collectionsData.push(collectionData);
      }

      setCollections(collectionsData);
    };

    loadCollections();
  }, []);

  const addCollection = async () => {
    const newCollection = {
      name: newCollectionName,
      description: newCollectionDescription,
      category: newCollectionCategory,
      image: uploadedImageUrl,
      likes: 0,
      comments: [
        {
          id: 'comment-1',
          text: 'Текст комментария 1',
          createdAt: 'Дата создания комментария',
        },
        {
          id: 'comment-2',
          text: 'Текст комментария 2',
          createdAt: 'Дата создания комментария',
        },
      ]
    };

    const docRef = await addDoc(collection(db, 'collections'), newCollection);
    const newCollectionData = { id: docRef.id, ...newCollection };
    setCollections([...collections, newCollectionData]);

    closeModal();
    setNewCollectionName('');
    setNewCollectionDescription('');
    setNewCollectionCategory('');
    setUploadedImageUrl('');
  };

  const addComment = async (collectionId, newComment) => {
    if (newComment.trim() === '') {
      return;
    }

    try {
      const newCommentData = {
        text: newComment,
        createdAt: new Date(),
        collectionId: collectionId,
      };

      const commentsCollection = collection(db, 'collections', collectionId, 'comments');
      const docRef = await addDoc(commentsCollection, newCommentData);
      console.log("Комментарий успешно добавлен с ID: ", docRef.id);

      // Обновление состояния, чтобы отразить новый комментарий
      setCollections(prevCollections =>
        prevCollections.map(collection => {
          if (collection.id === collectionId) {
            return {
              ...collection,
              comments: [...collection.comments, newCommentData],
            };
          }
          return collection;
        })
      );

      setNewComment('');
    } catch (error) {
      console.error("Ошибка при добавлении комментария: ", error);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleEditClick = (collection) => {
    setEditingCollection({ ...collection });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  }

  const saveEditedCollection = async () => {
    await updateCollection(editingCollection.id, {
      name: editingCollection.name,
      description: editingCollection.description,
      category: editingCollection.category,
      image: editingCollection.image,
    });

    // Обновление локального состояния после успешного обновления данных в Firestore
    setCollections(prevCollections => prevCollections.map(collection => {
      if (collection.id === editingCollection.id) {
        return {
          ...collection,
          name: editingCollection.name,
          description: editingCollection.description,
          category: editingCollection.category,
          image: editingCollection.image,
        };
      }
      return collection;
    }));

    setIsEditModalOpen(false); // Закрытие модального окна редактирования
  };

  const filteredCollections = collections.filter(collection => collection.name && collection.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const uploadImageFromFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const updateCollection = (collectionId, updatedData) => {
    const collectionRef = doc(db, 'collections', collectionId);

    updateDoc(collectionRef, updatedData)
      .then(() => {
        console.log('Данные успешно обновлены');
      })
      .catch(error => {
        console.error('Ошибка при обновлении данных:', error);
      });
  };

  const deleteCollection = async (collectionId) => {
    try {
      const collectionRef = doc(db, 'collections', collectionId);
      await deleteDoc(collectionRef);
      setCollections(collections.filter((item) => item.id !== collectionId));
      console.log('Коллекция успешно удалена');
    } catch (error) {
      console.error('Ошибка при удалении коллекции:', error);
    }
  };

  const handleLike = async (id) => {
    const collectionRef = doc(db, 'collections', id);

    try {
      const collectionSnapshot = await getDoc(collectionRef);
      const currentLikes = collectionSnapshot.data().likes;

      if (userLiked) {
        // Убираем лайк
        await updateDoc(collectionRef, { likes: currentLikes - 1 });

        setUserLiked(false);
        setCollections(prevCollections => prevCollections.map(collection => {
          if (collection.id === id) {
            return {
              ...collection,
              likes: currentLikes - 1,
            };
          }
          return collection;
        }));

        console.log('Лайк снят');
      } else {
        // Ставим лайк
        await updateDoc(collectionRef, { likes: currentLikes + 1 });

        setUserLiked(true);
        setCollections(prevCollections => prevCollections.map(collection => {
          if (collection.id === id) {
            return {
              ...collection,
              likes: currentLikes + 1,
            };
          }
          return collection;
        }));

        console.log('Лайк успешно сохранен');
      }
    } catch (error) {
      console.error('Ошибка при обновлении лайков:', error);
    }
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <div className='container'>
      <h1>Управление коллекциями</h1>
      <div className="d-flex align-items-center">
        <input
          type="text"
          className='form-control me-2'
          placeholder="Поиск по коллекции"
          value={searchTerm}
          onChange={handleSearch}
        />
        <button onClick={openModal} type='button' className='btn btn-primary btn-sm' data-bs-toggle='modal'>
          Создать коллекцию
        </button>
      </div>
      {isModalOpen && (
        <div className="modal" id='MyModal'>
          <div className='modal-dialog'>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title ">Создать коллекцию</h5>
                <button onClick={closeModal} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
              </div>
              <div className='modal-body'>
                <input
                  type="text"
                  className='form-control'
                  placeholder="Название коллекции"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                />
                <input
                  type="text"
                  className='form-control'
                  placeholder="Описание коллекции"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                />
                <input
                  type="text"
                  className='form-control'
                  placeholder="Категория"
                  value={newCollectionCategory}
                  onChange={(e) => setNewCollectionCategory(e.target.value)}
                />
                <input
                  type="file"
                  className='form-control'
                  onChange={(e) => uploadImageFromFile(e.target.files[0])}
                />
                <div className='modal-footer'>
                  <button onClick={addCollection}>Создать</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal" id='MyEditModal'>
          <div className='modal-dialog'>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Редактировать коллекцию</h5>
                <button onClick={closeEditModal} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
              </div>
              <div className='modal-body'>
                <input
                  type="text"
                  className='form-control'
                  placeholder="Название коллекции"
                  value={editingCollection.name}
                  onChange={(e) => setEditingCollection({ ...editingCollection, name: e.target.value })}
                />
                <input
                  type="text"
                  className='form-control'
                  placeholder="Описание коллекции"
                  value={editingCollection.description}
                  onChange={(e) => setEditingCollection({ ...editingCollection, description: e.target.value })}
                />
                <input
                  type="text"
                  className='form-control'
                  placeholder="Категория"
                  value={editingCollection.category}
                  onChange={(e) => setEditingCollection({ ...editingCollection, category: e.target.value })}
                />
                <input
                  type="file"
                  className='form-control'
                  onChange={(e) => {
                    const file = e.target.files[0]; // Получаем выбранный файл
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        // Устанавливаем изображение в состоянии editingCollection
                        setEditingCollection({ ...editingCollection, image: reader.result });
                      };
                      reader.readAsDataURL(file); // Читаем файл как Data URL
                    }
                  }}
                />
              </div>
              <div className='modal-footer'>
                <button onClick={() => saveEditedCollection(editingCollection)}>Сохранить</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        {filteredCollections.map((collection) => (
          <div key={collection.id} className="col-lg-4 mt-3">
            <div className="card">
              <img src={collection.image} className="card-img-top" alt={collection.name} />
              <div className="card-body">
                <h5 className="card-title">{collection.name}</h5>
                <p className="card-text">{collection.description}</p>
                <p className="card-text">Категория: {collection.category}</p>
                <div className="btn-group mb-2" role="group" aria-label="Управление">
                  <button type="button" onClick={() => handleEditClick(collection)} className="btn btn-primary me-2">Редактировать</button>
                  <button type="button" onClick={() => deleteCollection(collection.id)} className="btn btn-danger me-2">Удалить</button>
                </div>
                <button className='button-heart' onClick={() => handleLike(collection.id)}>
                  ❤️ {collection.likes}
                </button>

                <button
                  // onClick={() => toggleComments(collection.id)}
                  onClick={toggleModal}
                  className="btn btn-secondary mt-2">
                  {/* {commentsVisibility[collection.id] ? 'Скрыть комментарии' : 'Показать комментарии'} */}
                  {showModal ? 'Скрыть комментарии' : 'Показать комментарии'}
                </button>

                {/* Отображение комментариев */}
                {showModal && (
                  <div className="modal">
                    <div className="modal-content">
                      <button className='btn-close' data-bs-dismiss='modal' aria-label='Закрыть' onClick={toggleModal}></button>
                      <h2>Отзывы</h2>

                      {/* Отображение комментариев */}
                      <div className="mt-4">
                        {collection && collection.comments && collection.comments.map((comment, index) => (
                          <div key={index} className="bg-light p-3 mb-2">
                            <p className="m-0">{comment.text}</p>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const comment = e.target.elements.comment.value;
                        addComment(collection.id, comment);
                        e.target.reset();
                      }}>
                        {/* Форма для добавления комментария */}
                        <input
                          type="text"
                          className="form-control mb-2"
                          name="comment"
                          placeholder="Добавить комментарий"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">
                          Отправить
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;