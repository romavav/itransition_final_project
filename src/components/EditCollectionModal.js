import React, { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const EditCollectionModal = ({
  isOpen,
  onClose,
  collection,
  setCollections,
}) => {
  const [name, setName] = useState(collection.name || "");
  const [description, setDescription] = useState(collection.description || "");
  const [category, setCategory] = useState(collection.category || "");
  const [image, setImage] = useState(collection.image || "");

  useEffect(() => {
    if (isOpen && collection) {
      setName(collection.name || "");
      setDescription(collection.description || "");
      setCategory(collection.category || "");
      setImage(collection.image || "");
    }
  }, [isOpen, collection]);

  const uploadImageFromFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Утилита для удаления пар undefined из объекта
  const removeUndefinedFields = (obj) => {
    const cleanedObj = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleanedObj[key] = value;
      }
    }
    return cleanedObj;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let updatedData = { name, description, category, image };

    // Удаляем поля с undefined значением
    updatedData = removeUndefinedFields(updatedData);

    await updateDoc(doc(db, "collections", collection.id), updatedData);
    setCollections((prev) =>
      prev.map((col) =>
        col.id === collection.id ? { ...col, ...updatedData } : col
      )
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal" id="MyEditModal">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Редактировать коллекцию</h5>
            <button
              onClick={onClose}
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Закрыть"
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                className="form-control"
                placeholder="Название коллекции"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Описание коллекции"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Категория"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <input
                type="file"
                className="form-control"
                onChange={(e) => uploadImageFromFile(e.target.files[0])}
              />
              <div className="modal-footer">
                <button type="submit">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCollectionModal;
