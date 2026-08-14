import React from "react";
import category_img from "../assets/images/eyeglasses/eyeglasses.webp";

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
                <img
                  src={category_img}
                  alt="Category Name"
                  className="category_img"
                />
                <h3 className="category_title">Eyeglasses</h3>
              </div>
            </a>
            <a href="#" className="category_link">
              <div className="category_box">
                <img
                  src={category_img}
                  alt="Category Name"
                  className="category_img"
                />
                <h3 className="category_title">Sunglasses</h3>
              </div>
            </a>
            <a href="#" className="category_link">
              <div className="category_box">
                <img
                  src={category_img}
                  alt="Category Name"
                  className="category_img"
                />
                <h3 className="category_title">Special Power</h3>
              </div>
            </a>
            <a href="#" className="category_link">
              <div className="category_box">
                <img
                  src={category_img}
                  alt="Category Name"
                  className="category_img"
                />
                <h3 className="category_title">Contact Lenses</h3>
              </div>
            </a>
            <a href="#" className="category_link">
              <div className="category_box">
                <img
                  src={category_img}
                  alt="Category Name"
                  className="category_img"
                />
                <h3 className="category_title">Kids Glasses</h3>
              </div>
            </a>
            <a href="#" className="category_link">
              <div className="category_box">
                <img
                  src={category_img}
                  alt="Category Name"
                  className="category_img"
                />
                <h3 className="category_title">Sale</h3>
              </div>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Categories;
