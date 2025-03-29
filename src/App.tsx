import "./App.css";
import Footer from "./Components/Footer/Footer";
import Header from "./Components/Header/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SearchBar from "./Components/SearchBar/SearchBar";
import Register from "./Components/Register/Register";
import Login from "./Components/Login/Login";
import Description from "./Components/Description/Description";
import { useEffect, useState } from "react";
import SimilarArtistsCarousel from "./Components/SimilarArtistsCarousel/SimilarArtistsCarousel";

function App() {
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(
    localStorage.getItem("selectedArtistId") || null
  );
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    setUserId(user?._id || null);
  }, []);

  const handleArtistSelect = (artistId: string) => {
    localStorage.setItem("selectedArtistId", artistId);
    setSelectedArtistId(artistId);
  };

  const handleSearchClear = () => {
    localStorage.removeItem("selectedArtistId");
    setSelectedArtistId(null);
  };

  return (
    <Router>
      <Container fluid className="d-flex flex-column min-vh-100 p-0">
        <Header />
        <Routes>
          <Route
            path="/search"
            element={
              <div
                className="container-fluid mt-5"
                style={{ padding: "0px !important" }}
              >
                <SearchBar
                  onArtistSelect={handleArtistSelect}
                  onClear={handleSearchClear}
                />

                {selectedArtistId && (
                  <>
                    <Description
                      artistId={selectedArtistId}
                      onArtistSelect={handleArtistSelect}
                    />

                    {userId && (
                      <SimilarArtistsCarousel
                        artistId={selectedArtistId}
                        onArtistSelect={handleArtistSelect}
                      />
                    )}
                  </>
                )}
              </div>
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <Footer />
      </Container>
    </Router>
  );
}

export default App;
