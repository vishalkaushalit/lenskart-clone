import "../assets/css/LoadingScreen.css";

const LoadingScreen = () => {

  return (

    <div className="loader-wrapper">

      <div className="glass-box">


        <svg
          width="260"
          height="120"
          viewBox="0 0 260 120"
          className="glasses"
        >


          {/* Left Lens */}
          <ellipse
            cx="70"
            cy="60"
            rx="50"
            ry="38"
            className="lens"
          />


          {/* Right Lens */}
          <ellipse
            cx="190"
            cy="60"
            rx="50"
            ry="38"
            className="lens"
          />


          {/* Bridge */}
          <path
            d="M120 55 Q130 45 140 55"
            className="bridge"
          />


          {/* Frame */}
          <ellipse
            cx="70"
            cy="60"
            rx="55"
            ry="43"
            className="frame"
          />


          <ellipse
            cx="190"
            cy="60"
            rx="55"
            ry="43"
            className="frame"
          />


        </svg>


        <div className="light-scan"></div>


      </div>


      <h2>
        Finding your perfect frame
      </h2>


      <div className="dots">
        <span></span>
        <span></span>
        <span></span>
      </div>


    </div>

  );
};


export default LoadingScreen;