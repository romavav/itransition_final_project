import React, { useState } from "react";
import {
  addDoc,
  deleteDoc,
  collection as firestoreCollection,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const CollectionComments = ({
  collection,
  setCollections,
  setShowModal,
  setCommentCount,
  currentCommentCount,
}) => {
  const [newComment, setNewComment] = useState("");

  if (!collection) {
    return null;
  }

  const addComment = async (collectionId, newComment) => {
    if (newComment.trim() === "") {
      return;
    }

    try {
      const user = await getCurrentUser();
      const currentUser = user.displayName || user.email;

      const newCommentData = {
        text: newComment,
        createdAt: new Date().toISOString(),
        user: currentUser,
      };

      const commentsCollection = firestoreCollection(
        db,
        "collections",
        collectionId,
        "comments"
      );
      const docRef = await addDoc(commentsCollection, newCommentData);

      setCollections((prevCollections) =>
        prevCollections.map((collection) => {
          if (collection.id === collectionId) {
            return {
              ...collection,
              comments: [
                ...collection.comments,
                { id: docRef.id, ...newCommentData },
              ],
            };
          }
          return collection;
        })
      );

      setNewComment("");

      // Обновляем количество комментариев
      const collectionDocRef = doc(db, "collections", collectionId);
      await updateDoc(collectionDocRef, {
        commentCount: currentCommentCount + 1,
      });
      setCommentCount(currentCommentCount + 1);
    } catch (error) {
      console.error("Ошибка при добавлении комментария: ", error);
    }
  };

  const deleteComment = async (collectionId, commentId) => {
    try {
      await deleteDoc(
        doc(db, "collections", collectionId, "comments", commentId)
      );
      setCollections((prev) =>
        prev.map((col) =>
          col.id === collectionId
            ? {
                ...col,
                comments: col.comments.filter(
                  (comment) => comment.id !== commentId
                ),
              }
            : col
        )
      );

      // Обновляем количество комментариев
      const collectionDocRef = doc(db, "collections", collectionId);
      await updateDoc(collectionDocRef, {
        commentCount: currentCommentCount - 1,
      });
      setCommentCount(currentCommentCount - 1);
    } catch (error) {
      console.error("Ошибка при удалении комментария: ", error);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date)) {
        throw new Error("Invalid date format");
      }
      return date.toLocaleString();
    } catch (error) {
      console.error("Error in formatDate:", error);
      return "Invalid date";
    }
  };

  const getCurrentUser = () => {
    const auth = getAuth();
    return new Promise((resolve, reject) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          resolve(user);
        } else {
          reject("No user is signed in.");
        }
      });
    });
  };

  return (
    <div className="modal">
      <div className="modal-content custom-modal">
        <button
          className="btn-close"
          data-bs-dismiss="modal"
          aria-label="Закрыть"
          onClick={() =>
            setShowModal((prev) => ({ ...prev, [collection.id]: false }))
          }
        ></button>
        <h2>Отзывы</h2>
        <div className="comments-container mt-4">
          {collection?.comments?.length > 0 ? (
            collection.comments
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((comment) => (
                <div
                  key={comment.id}
                  className="bg-light p-3 mb-2 comment-item"
                >
                  <div className="d-flex align-items-center">
                    <strong>{comment.user}</strong>
                    <span className="timestamp ms-auto">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <div className="d-flex align-items-center">
                    <p className="comment-text">{comment.text}</p>
                    <i
                      className="fas fa-trash-alt delete-icon"
                      onClick={() => deleteComment(collection.id, comment.id)}
                    ></i>
                  </div>
                </div>
              ))
          ) : (
            <p>Комментарии отсутствуют</p>
          )}
        </div>
        <form
          className="comments-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (newComment.trim() !== "") {
              addComment(collection.id, newComment);
            }
          }}
        >
          <input
            type="text"
            className="form-control mb-2"
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
  );
};

export default CollectionComments;
