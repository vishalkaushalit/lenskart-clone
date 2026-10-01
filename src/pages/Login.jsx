import React from "react";

import LoginImage from "../components/LoginImage";
import LoginForm from "../components/LoginForm";

const Login = () => {
  return (
    <>
      <section className="py-12 sm:py-16 ">
        <div className="mx-auto w-[90%] max-w-[1320px] ">
          <div className="flex items-center justify-center min-h-screen">
            {/* Main Card Container */}
            <div
              className="flex w-full flex-col overflow-hidden rounded-lg
 bg-white shadow-2xl lg:flex-row"
            >
              <LoginImage />
              <LoginForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
