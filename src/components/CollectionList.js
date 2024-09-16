import React from "react";
import CollectionCard from "./CollectionCard";

const CollectionList = ({
  collections,
  onEdit,
  setCollections,
  showModal,
  setShowModal,
}) => {
  return (
    <div className="row">
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          onEdit={onEdit}
          setCollections={setCollections}
          showModal={showModal}
          setShowModal={setShowModal}
        />
      ))}
    </div>
  );
};

export default CollectionList;
