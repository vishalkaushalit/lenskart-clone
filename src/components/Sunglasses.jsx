import React from "react";
import rectangle from "../assets/images/sunglasses/rectangle.webp";
import cateye from "../assets/images/sunglasses/cateye.webp";
import aviator from "../assets/images/sunglasses/aviator.webp";
import geometric from "../assets/images/sunglasses/geometric.webp";
import round from "../assets/images/sunglasses/round.webp";
import clubmaster from "../assets/images/sunglasses/clubmaster.webp";
import square from "../assets/images/sunglasses/square.webp";

const Sunglasses = () => {
  return (
    <>
      <div className="categories_sec eyeglasses_sec sunglasses_sec padding_70">
        <div className="container">
          <div className="info">
            <h2 className="heading">Get the perfect shape - Sunglasses</h2>
          </div>
          <div className="category_wrapper">
            <a href="#" className="category_link">
              <div className="category_box">
                <img
                  src={rectangle}
                  alt="Category Name"
                  className="category_img"
                />
                <h3 className="category_title">Rectangle</h3>
              </div>
            </a>
            <a href="#" className="category_link">
              <div className="category_box">
                <img
                  src={cateye}
                  alt="Category Name"
                  className="category_img"
                />
                <h3 className="category_title">Cateye</h3>
              </div>
            </a>
            <a href="#" className="category_link">
              <div className="category_box">
                <img
                  src={aviator}
                  alt="Category Name"
                  className="category_img"
                />
                <h3 className="category_title">Aviator</h3>
              </div>
            </a>
            <a href="#" className="category_link">
              <div className="category_box">
                <img
                  src={geometric}
                  alt="Category Name"
                  className="category_img"
                />
                <h3 className="category_title">Geometric</h3>
              </div>
            </a>
            <a href="#" className="category_link">
              <div className="category_box">
                <img src={round} alt="Category Name" className="category_img" />
                <h3 className="category_title">Round</h3>
              </div>
            </a>
            <a href="#" className="category_link">
              <div className="category_box">
                <img
                  src={clubmaster}
                  alt="Category Name"
                  className="category_img"
                />
                <h3 className="category_title">Clubmaster</h3>
              </div>
            </a>
            <a href="#" className="category_link">
              <div className="category_box">
                <img
                  src={square}
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

export default Sunglasses;
