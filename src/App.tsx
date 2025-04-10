import "./App.css";
import Footer from "./Components/Footer/Footer";
import Header from "./Components/Header/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SearchBar from "./Components/SearchBar/SearchBar";
import Register from "./Components/Register/Register";
import Login from "./Components/Login/Login";
import FavoritesPage from "./Components/Favorites/FavoritesPage";
import Description from "./Components/Description/Description";
import { useEffect, useState } from "react";
import SimilarArtistsCarousel from "./Components/SimilarArtistsCarousel/SimilarArtistsCarousel";
import axios from "axios";
import Cookies from "js-cookie";
const baseUrl = import.meta.env.VITE_API_BACKEND_URI;

function App() {
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(
    localStorage.getItem("selectedArtistId") || null
  );
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) return;
        const res = await axios.get(`${baseUrl}/api/auth/me`, {
          withCredentials: true,
        });
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
        localStorage.setItem(
          "favorites",
          JSON.stringify(res.data.favorites.map((f: any) => f.artistId))
        );
        window.dispatchEvent(new Event("favoritesUpdated"));
      } catch (err) {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("favorites");
        window.dispatchEvent(new Event("favoritesUpdated"));
      }
    };

    fetchMe();
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
      {/* <Container fluid className="d-flex flex-column min-vh-100 p-0"> */}
      <Header />
      <main className="flex-grow-1 mx-auto px-3" style={{ maxWidth: "1280px" }}>
        <Routes>
          <Route
            path="/search"
            element={
              <div
                className="container-fluid mt-5 pb-5"
                style={{ paddingLeft: 0, paddingRight: 0 }}
              >
                <SearchBar
                  onArtistSelect={handleArtistSelect}
                  onClear={handleSearchClear}
                />
                {selectedArtistId && (
                  <Description
                    artistId={selectedArtistId}
                    onArtistSelect={handleArtistSelect}
                  />
                )}
                {selectedArtistId && user && (
                  <SimilarArtistsCarousel
                    artistId={selectedArtistId}
                    onArtistSelect={handleArtistSelect}
                  />
                )}
              </div>
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </main>
      <div style={{ height: "100px" }}></div>
      <Footer />
      {/* </Container> */}
    </Router>
  );
}

export default App;
