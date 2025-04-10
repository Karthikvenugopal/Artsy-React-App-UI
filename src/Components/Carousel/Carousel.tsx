import React, { useEffect, useState } from "react";
import { Card, ToastContainer } from "react-bootstrap";
import { FaStar, FaRegStar } from "react-icons/fa";
import fallBackImage from "../../assets/images/artsy_logo.svg";
import "./Carousel.css";
import axios from "axios";
import ToastComponent from "../Toast/Toast";

const baseUrl = import.meta.env.VITE_API_BACKEND_URI;

interface CarouselProps {
  items: any[];
  onArtistSelect: (artistId: string) => void;
}

const ArtistCarousel: React.FC<CarouselProps> = ({ items, onArtistSelect }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toasts, setToasts] = useState<
    { id: number; message: string; type: "success" | "danger" }[]
  >([]);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const syncFavorites = () => {
      const storedFavs = JSON.parse(localStorage.getItem("favorites") || "[]");
      setFavorites(storedFavs);
    };

    syncFavorites();
    window.addEventListener("favoritesUpdated", syncFavorites);
    return () => window.removeEventListener("favoritesUpdated", syncFavorites);
  }, []);

  const addToast = (message: string, type: "success" | "danger") => {
    setToasts((prev) => {
      const next = [...prev, { id: Date.now(), message, type }];
      return next.slice(-3);
    });
  };

  const toggleFavorite = async (artistId: string) => {
    try {
      const res = await axios.post(
        `${baseUrl}/api/artists/favorites`,
        { artistId },
        { withCredentials: true }
      );
      const updatedFavorites = res.data.favorites.map((f: any) => f.artistId);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      window.dispatchEvent(new Event("favoritesUpdated"));

      if (favorites.includes(artistId)) {
        addToast("Removed from favorites", "danger");
      } else {
        addToast("Added to favorites", "success");
      }
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  const handleArtistClick = (href: string) => {
    const parts = href.split("/");
    const artistId = parts[parts.length - 1];
    onArtistSelect(artistId);
  };

  return (
    <div className="custom-carousel-container">
      <div className="custom-carousel">
        {items.map((item) => {
          const artistId = item._links.self.href.split("/").pop();
          const isFav = favorites.includes(artistId);

          return (
            <Card
              key={item._links.self.href}
              className="flex-shrink-0 border rounded"
              style={{
                width: "230px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
              onClick={() => handleArtistClick(item._links.self.href)}
            >
              {user && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(artistId);
                  }}
                  className="position-absolute top-0 end-0 bg-primary rounded-circle p-1 d-flex align-items-center justify-content-center"
                  style={{ margin: "10px", zIndex: 10 }}
                >
                  {isFav ? (
                    <FaStar
                      size={20}
                      color="yellow"
                      style={{ stroke: "white", strokeWidth: 1 }}
                    />
                  ) : (
                    <FaRegStar
                      size={20}
                      color="white"
                      style={{ stroke: "white", strokeWidth: 1 }}
                    />
                  )}
                </div>
              )}

              <Card.Img
                variant="top"
                src={item._links.thumbnail?.href || fallBackImage}
                alt={item.title}
                className="rounded-top"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallBackImage;
                }}
              />
              <Card.Body className="bg-primary text-white p-2 rounded-bottom d-flex flex-column">
                <Card.Title
                  className="text-start fw-bold fs-5 mb-0 text-wrap"
                  style={{ color: "white" }}
                >
                  {item.title}
                </Card.Title>
              </Card.Body>
            </Card>
          );
        })}
      </div>

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
    </div>
  );
};

export default ArtistCarousel;
