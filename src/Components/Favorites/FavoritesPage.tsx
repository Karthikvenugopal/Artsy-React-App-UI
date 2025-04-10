import React, { useEffect, useState } from "react";
import {
  Card,
  Container,
  Row,
  Col,
  Spinner,
  ToastContainer,
} from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import fallBackImage from "../../assets/images/artsy_logo.svg";
import "./FavoritesPage.css";
import ToastComponent from "../Toast/Toast";

const baseUrl = import.meta.env.VITE_API_BACKEND_URI;

interface Favorite {
  artistId: string;
  name: string;
  birthday: string;
  deathday: string;
  nationality: string;
  thumbnail: string;
  addedAt: string;
}

const getRelativeTime = (dateStr: string) => {
  const addedDate = new Date(dateStr);
  const diff = Date.now() - addedDate.getTime();
  const seconds = Math.floor(diff / 1000);

  if (seconds <= 60) return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
  const minutes = Math.floor(seconds / 60);
  if (seconds < 3600) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
};

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [tick, setTick] = useState(0);
  const [toasts, setToasts] = useState<
    { id: number; message: string; type: "success" | "danger" }[]
  >([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem("cached_favorites");
    if (cached) {
      setFavorites(JSON.parse(cached));
      setLoading(false);
    }

    const fetchFavorites = async () => {
      try {
        const res = await axios.get(`${baseUrl}/api/artists/favorites/saved`, {
          withCredentials: true,
        });
        const sorted = [...res.data.favorites].sort(
          (a, b) =>
            new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );
        setFavorites(sorted);
        localStorage.setItem("cached_favorites", JSON.stringify(sorted));
      } catch (err) {
        console.error("Error fetching favorites:", err);
      } finally {
        setHasFetched(true);
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const addToast = (message: string, type: "success" | "danger") => {
    setToasts((prev) => {
      const next = [...prev, { id: Date.now(), message, type }];
      return next.slice(-3); // Keep max 3 toasts
    });
  };

  const handleRemove = async (artistId: string) => {
    try {
      await axios.post(
        `${baseUrl}/api/artists/favorites`,
        { artistId },
        { withCredentials: true }
      );
      const updated = favorites.filter((a) => a.artistId !== artistId);
      setFavorites(updated);
      localStorage.setItem("cached_favorites", JSON.stringify(updated));
      window.dispatchEvent(new Event("favoritesUpdated"));
      addToast("Removed from favorites", "danger");
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    }
  };

  const handleCardClick = (artistId: string) => {
    localStorage.setItem("selectedArtistId", artistId);
    navigate("/search");
  };

  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) navigate("/login");

  return (
    <Container className="mt-5 pt-5">
      {loading && !hasFetched ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="w-100 d-flex justify-content-center mt-4">
          <div
            className="w-100 p-3"
            style={{
              maxWidth: "3000px",
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c2c7",
              color: "#842029",
              borderRadius: "0.375rem",
              textAlign: "left",
            }}
          >
            No favorite artists.
          </div>
        </div>
      ) : (
        <Row className="g-4">
          {favorites.map((artist) => (
            <Col
              key={artist.artistId}
              xs={12}
              md={6}
              lg={4}
              className="favorites-col"
            >
              <Card
                className="favorites-card"
                onClick={() => handleCardClick(artist.artistId)}
              >
                {/* Blurred background */}
                <div
                  style={{
                    backgroundImage: `url(${
                      artist.thumbnail || fallBackImage
                    })`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(8px)",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1,
                  }}
                />
                {/* Overlay content */}
                <Card.Body
                  style={{
                    position: "relative",
                    zIndex: 2,
                    padding: "0.75rem",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    borderRadius: "0.5rem",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div>
                    <Card.Title className="fw-bold fs-5 text-white text-start">
                      {artist.name}
                    </Card.Title>
                    <div className="text-start">
                      {artist.birthday} - {artist.deathday}
                    </div>
                    <div className="text-start">{artist.nationality}</div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="small">
                      {getRelativeTime(artist.addedAt)}
                    </div>
                    <span
                      className="text-white text-decoration-underline"
                      style={{ cursor: "pointer", fontSize: "0.9rem" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(artist.artistId);
                      }}
                    >
                      Remove
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ marginTop: "70px" }}
      >
        {toasts.map((toast) => (
          <ToastComponent
            key={toast.id}
            message={toast.message}
            show={true}
            type={toast.type}
            onClose={() =>
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
          />
        ))}
      </ToastContainer>
    </Container>
  );
};

export default FavoritesPage;
