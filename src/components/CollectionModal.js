import React, { useState } from "react";

const CollectionModal = ({ isOpen, onClose, onAddCollection }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");

  const uploadImageFromFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddCollection(name, description, category, image);
    setName("");
    setDescription("");
    setCategory("");
    setImage("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal" id="MyModal">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Создать коллекцию</h5>
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
                <button type="submit">Создать</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionModal;
