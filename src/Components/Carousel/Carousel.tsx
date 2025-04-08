import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { FaStar, FaRegStar } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import fallBackImage from "../../assets/images/artsy_logo.svg";
import "./Carousel.css";
import axios from "axios";

interface CarouselProps {
  items: any[];
  onArtistSelect: (artistId: string) => void;
}

const ArtistCarousel: React.FC<CarouselProps> = ({ items, onArtistSelect }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
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

  const toggleFavorite = async (artistId: string) => {
    try {
      const res = await axios.post(
        "http://localhost:5001/api/artists/favorites",
        { artistId },
        { withCredentials: true }
      );
      const updatedFavorites = res.data.favorites.map((f: any) => f.artistId);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      window.dispatchEvent(new Event("favoritesUpdated"));
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
              style={{
                width: "230px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
              onClick={() => handleArtistClick(item._links.self.href)}
            >
              {/* Favorite Star */}
              {user && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(artistId);
                  }}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "blue",
                    borderRadius: "50%",
                    padding: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 10,
                  }}
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
                style={{ borderRadius: "5px" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallBackImage;
                }}
              />
              <Card.Body
                style={{
                  backgroundColor: "#0d6efd",
                  color: "white",
                  padding: "0.5rem",
                  borderRadius: "0 0 5px 5px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Card.Title
                  className="text-start fw-bold"
                  style={{
                    fontSize: "20px",
                    color: "white",
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {item.title}
                </Card.Title>
              </Card.Body>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ArtistCarousel;
