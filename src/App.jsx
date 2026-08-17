import "./assets/css/App.css";
import "./assets/css/Responsive.css";
import Footer from "./footer/Footer";
import Header from "./header/Header";
import Home from "./pages/Home";

function App() {
  return (
    <>
      <Header />
      <main>
        <Home />
      </main>
      <Footer />
    </>
  );
}

export default App;
