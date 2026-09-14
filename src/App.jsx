import { useState, useEffect } from "react";

import Footer from "./footer/Footer";
import Header from "./header/Header";
import Home from "./pages/Home";
import LoadingScreen from "./components/LoadingScreen";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <Header />

          <main>
            <Home />
          </main>

          <Footer />
        </>
      )}
    </>
  );
};

export default App;
