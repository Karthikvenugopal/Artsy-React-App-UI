import React, { useEffect, useState } from "react";
import { Card, Spinner, ToastContainer } from "react-bootstrap";
import { FaStar, FaRegStar } from "react-icons/fa";
import axios from "axios";
import ToastComponent from "../Toast/Toast";
import fallBackImage from "../../assets/images/artsy_logo.svg";
import "./SimilarArtistsCarousel.css";

const baseUrl = import.meta.env.VITE_API_BACKEND_URI;

interface SimilarArtistsCarouselProps {
  artistId: string;
  onArtistSelect: (artistId: string) => void;
}

const SimilarArtistsCarousel: React.FC<SimilarArtistsCarouselProps> = ({
  artistId,
  onArtistSelect,
}) => {
  const [similarArtists, setSimilarArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetchingNewArtist, setIsFetchingNewArtist] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toasts, setToasts] = useState<
    { id: number; message: string; type: "success" | "danger" }[]
  >([]);
  console.log("loading", loading);

  const user = React.useMemo(() => {
    return JSON.parse(localStorage.getItem("user") || "null");
  }, []);

  // In SimilarArtistsCarousel.tsx
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
    const fetchSimilarArtists = async () => {
      if (!artistId || !user) return;
      try {
        setLoading(true);
        const response = await axios.get(
          `${baseUrl}/api/artists/similar/${artistId}&size=100`
        );
        setSimilarArtists(response.data._embedded?.artists || []);
      } catch (error) {
        console.error("Error fetching similar artists:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSimilarArtists();
  }, [artistId, user]);

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
      console.error("Failed to toggle favorite:", err);
    }
  };

  const handleArtistClick = async (href: string) => {
    const parts = href.split("/");
    const newArtistId = parts[parts.length - 1];
    setIsFetchingNewArtist(true);
    try {
      await axios.get(`${baseUrl}/api/artists/${newArtistId}`);
      onArtistSelect(newArtistId);
    } catch (error) {
      console.error("Error fetching artist data before navigation", error);
    } finally {
      setIsFetchingNewArtist(false);
    }
  };

  if (!user) return null;

  return (
    <div className="custom-similar-carousel-container mt-4">
      <h3 className="text-start mb-3">Similar Artists</h3>
      <div className="custom-similar-carousel">
        {similarArtists.map((artist) => {
          const id = artist._links.self.href.split("/").pop() as string;
          const isFav = favorites.includes(id);

          return (
            <Card
              key={artist._links.self.href}
              className="custom-similar-card"
              onClick={() => handleArtistClick(artist._links.self.href)}
            >
              {user && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(id);
                  }}
                  className="custom-similar-fav-btn position-absolute top-0 end-0"
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
                src={artist._links.thumbnail?.href || fallBackImage}
                alt={artist.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallBackImage;
                }}
                className="custom-similar-card-img"
              />
              <Card.Body className="custom-similar-card-body">
                <Card.Title className="custom-similar-card-title">
                  {artist.name}
                </Card.Title>
              </Card.Body>
            </Card>
          );
        })}
      </div>

      {isFetchingNewArtist && (
        <div className="text-center my-3">
          <Spinner animation="border" variant="primary" />
        </div>
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
    </div>
  );
};

export default SimilarArtistsCarousel;
