import React from "react";

const SearchBar = ({ onSearch, onAddClick }) => {
  return (
    <div className="d-flex align-items-center">
      <input
        type="text"
        className="form-control me-2"
        placeholder="Поиск по коллекции"
        onChange={onSearch}
      />
      <button
        onClick={onAddClick}
        type="button"
        className="btn btn-primary btn-sm"
      >
        <i className="fas fa-plus"></i>
        {/* Иконка плюса в пустом квадрате */}
      </button>
    </div>
  );
};

export default SearchBar;
