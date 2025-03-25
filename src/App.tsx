import "./App.css";
import Footer from "./Components/Footer/Footer";
import Header from "./Components/Header/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SearchBar from "./Components/SearchBar/SearchBar";
import Register from "./Components/Register/Register";
import Login from "./Components/Login/Login";

function App() {
  return (
    <Router>
      <Container fluid className="d-flex flex-column min-vh-100 p-0">
        <Header />
        <Routes>
          <Route path="/search" element={<SearchBar />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <Footer />
      </Container>
    </Router>
  );
}

export default App;
