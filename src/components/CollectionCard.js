import React, { useState, useEffect, useCallback } from "react";
import { doc, deleteDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import CollectionComments from "./CollectionComments";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment as faRegularComment } from "@fortawesome/free-regular-svg-icons";
import { faHeart as faSolidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faRegularHeart } from "@fortawesome/free-regular-svg-icons";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const CollectionCard = ({
  collection,
  onEdit,
  setCollections,
  showModal,
  setShowModal,
}) => {
  const [userLiked, setUserLiked] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const defaultImage = process.env.PUBLIC_URL + "/default.jpg";

  const fetchLikeStatus = useCallback(async (userId) => {
    const collectionRef = doc(db, "collections", collection.id);
    const collectionSnapshot = await getDoc(collectionRef);
    if (collectionSnapshot.exists()) {
      const data = collectionSnapshot.data();
      setUserLiked(data.userLikes?.includes(userId) ?? false);
    }
  }, [collection.id]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchLikeStatus(user.uid);
      } else {
        setUserLiked(false);
      }
    });

    return () => unsubscribe(); // Очистка подписки на изменение состояния аутентификации
  }, [fetchLikeStatus]);

  const fetchCommentsCount = useCallback(async () => {
    try {
      const collectionRef = doc(db, "collections", collection.id);
      const collectionSnapshot = await getDoc(collectionRef);
      if (collectionSnapshot.exists()) {
        const data = collectionSnapshot.data();
        setCommentCount(data.commentCount || 0);
      }
    } catch (error) {
      console.error("Ошибка при получении количества комментариев:", error);
    }
  }, [collection.id]);

  useEffect(() => {
    fetchCommentsCount();
  }, [fetchCommentsCount]);

  if (!collection) return null;

  const deleteCollection = async (collectionId) => {
    try {
      await deleteDoc(doc(db, "collections", collectionId));
      setCollections((prev) => prev.filter((item) => item.id !== collectionId));
      console.log("Коллекция успешно удалена");
    } catch (error) {
      console.error("Ошибка при удалении коллекции:", error);
    }
  };

  const handleLike = async (id) => {
    const collectionRef = doc(db, "collections", id);
    const auth = getAuth();

    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;

    try {
      const collectionSnapshot = await getDoc(collectionRef);
      const data = collectionSnapshot.data();
      const currentLikes = data.likes;

      if (userLiked) {
        await updateDoc(collectionRef, {
          likes: currentLikes - 1,
          userLikes: data.userLikes.filter((uid) => uid !== userId),
        });
        setUserLiked(false);
      } else {
        await updateDoc(collectionRef, {
          likes: currentLikes + 1,
          userLikes: [...(data.userLikes || []), userId],
        });
        setUserLiked(true);
      }

      setCollections((prevCollections) =>
        prevCollections.map((collection) => {
          if (collection.id === id) {
            return {
              ...collection,
              likes: userLiked ? currentLikes - 1 : currentLikes + 1,
            };
          }
          return collection;
        })
      );

      console.log(userLiked ? "Лайк снят" : "Лайк успешно сохранен");
    } catch (error) {
      console.error("Ошибка при обновлении лайков:", error);
    }
  };

  const toggleShowModal = (id) => {
    setShowModal((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="col-lg-4 mt-3">
      <div className="card">
        <img
          src={collection.image || defaultImage}
          className="card-img-top"
          alt={collection.name}
        />
        <div className="card-body">
          <h5 className="card-title">{collection.name}</h5>
          <p className="card-text">{collection.description}</p>
          <p className="card-text">Категория: {collection.category}</p>
          <div className="btn-group mb-2" role="group">
            <button
              type="button"
              onClick={() => onEdit(collection)}
              className="btn btn-primary me-2"
            >
              Редактировать
            </button>
            <button
              type="button"
              onClick={() => deleteCollection(collection.id)}
              className="btn btn-danger me-2"
            >
              Удалить
            </button>
          </div>
          <button
            className="button-heart"
            onClick={() => handleLike(collection.id)}
          >
            <FontAwesomeIcon
              icon={userLiked ? faSolidHeart : faRegularHeart}
              style={{ color: "red", marginRight: "5px" }}
            />
            {collection.likes || 0}
          </button>
          <div style={{ display: "inline-block", marginLeft: "10px" }}>
            <FontAwesomeIcon
              icon={faRegularComment}
              onClick={() => toggleShowModal(collection.id)}
              className="comments-icon"
            />
            <span style={{ marginLeft: "5px" }}>{commentCount}</span>
          </div>
          {showModal[collection.id] && (
            <CollectionComments
              collection={collection}
              setCollections={setCollections}
              setShowModal={setShowModal}
              setCommentCount={setCommentCount}
              currentCommentCount={commentCount}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionCard;