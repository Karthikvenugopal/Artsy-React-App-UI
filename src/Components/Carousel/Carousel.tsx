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
  currentArtistId?: string;
}

const ArtistCarousel: React.FC<CarouselProps> = ({
  items,
  onArtistSelect,
  currentArtistId,
}) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toasts, setToasts] = useState<
    { id: number; message: string; type: "success" | "danger" }[]
  >([]);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const syncFavorites = () => {
      const storedFavs = JSON.parse(
        sessionStorage.getItem("favorites") || "[]"
      );
      setFavorites(storedFavs);
    };

    syncFavorites();
    window.addEventListener("favoritesUpdated", syncFavorites);
    return () => window.removeEventListener("favoritesUpdated", syncFavorites);
  }, []);

  useEffect(() => {
    const favs = JSON.parse(sessionStorage.getItem("favorites") || "[]");
    setFavorites(favs);
  }, [currentArtistId]);

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
      sessionStorage.setItem("favorites", JSON.stringify(updatedFavorites));
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
    <div className="custom-artist-carousel-container">
      <div className="custom-artist-carousel">
        {items.map((item) => {
          const artistId = item._links.self.href.split("/").pop() as string;
          const isFav = favorites.includes(artistId);
          const isSelected = currentArtistId === artistId;

          return (
            <Card
              key={item._links.self.href}
              className={`custom-artist-card ${isSelected ? "selected" : ""}`}
              onClick={() => handleArtistClick(item._links.self.href)}
            >
              {user && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(artistId);
                  }}
                  className="custom-artist-fav-btn position-absolute top-0 end-0"
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
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallBackImage;
                }}
                className="custom-artist-card-img rounded-top"
              />
              <Card.Body className="custom-artist-card-body">
                <Card.Title className="custom-artist-card-title">
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
