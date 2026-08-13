import React from "react";
import category_img from "../assets/images/eyeglasses.webp";

const Eyeglasses = () => {
  return (
    <>
      <div className="categories_sec eyeglasses_sec padding_70">
        <div className="container">
          <div className="info">
            <h2 className="heading">Get the perfect shape - Eyeglasses</h2>
          </div>
          <div className="category_wrapper">
            <a href="#" className="category_link">
              <div className="category_box">
                <img
                  src={category_img}
                  alt="Category Name"
                  className="category_img"
                />
                <h3 className="category_title">Rectangle</h3>
              </div>
            </a>
            <a href="#" className="category_link">
              <div className="category_box">
                <img
                  src={category_img}
                  alt="Category Name"
                  className="category_img"
                />
                <h3 className="category_title">Cateye</h3>
              </div>
            </a>
            <a href="#" className="category_link">
              <div className="category_box">
                <img
                  src={category_img}
                  alt="Category Name"
                  className="category_img"
                />
                <h3 className="category_title">Aviator</h3>
              </div>
            </a>
            <a href="#" className="category_link">
              <div className="category_box">
                <img
                  src={category_img}
                  alt="Category Name"
                  className="category_img"
                />
                <h3 className="category_title">Geometric</h3>
              </div>
            </a>
            <a href="#" className="category_link">
              <div className="category_box">
                <img
                  src={category_img}
                  alt="Category Name"
                  className="category_img"
                />
                <h3 className="category_title">Round</h3>
              </div>
            </a>
            <a href="#" className="category_link">
              <div className="category_box">
                <img
                  src={category_img}
                  alt="Category Name"
                  className="category_img"
                />
                <h3 className="category_title">Clubmaster</h3>
              </div>
            </a>
            <a href="#" className="category_link">
              <div className="category_box">
                <img
                  src={category_img}
                  alt="Category Name"
                  className="category_img"
                />
                <h3 className="category_title">Square</h3>
              </div>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Eyeglasses;
