import React from "react";

const Categories = () => {
  return (
    <>
      <div className="categories_sec padding_70">
        <div className="container">
          <div className="info">
            <h2 className="heading">Top Categories</h2>
          </div>
          <div className="category_wrapper">
            <a href="#" className="category_link">
                <div className="category_box">
                    <img src={category_img} alt="Category Name" className="category_img" />
                    
                </div>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Categories;
