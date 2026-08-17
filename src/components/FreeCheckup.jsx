import store_eye_test from "../assets/images/store_eye_test.webp";
import home_eye_test from "../assets/images/home_eye_test.webp";
import online_eye_test from "../assets/images/online_eye_test.webp";

const checkupList = [
  { name: "Visit Nearest Store", image: store_eye_test, checkupUrl: "#" },
  { name: "Schedule at Home", image: home_eye_test, checkupUrl: "#" },
  { name: "Take an Online Eye Test", image: online_eye_test, checkupUrl: "#" },
];

const FreeCheckup = () => {
  return (
    <>
      <div className="checkup_sec padding_70">
        <div className="container">
          <div className="info mb_30">
            <h2 className="heading">Get a FREE Eye Check Up</h2>
          </div>
          <div className="checkup_wrappper">
            {checkupList.map(({ name, image, checkupUrl }) => (
              <a href={checkupUrl} className="store_box" key={name}>
                <div className="imgBox">
                  <img className="img-fluid" src={image} alt={name} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default FreeCheckup;
