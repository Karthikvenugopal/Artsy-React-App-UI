import React, { useEffect, useState } from "react";
import { Card, Spinner, ToastContainer } from "react-bootstrap";
import { FaStar, FaRegStar } from "react-icons/fa";
import axios from "axios";
import fallBackImage from "../../assets/images/artsy_logo.svg";
import "./SimilarArtistsCarousel.css";
import ToastComponent from "../Toast/Toast";

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
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toasts, setToasts] = useState<
    { id: number; message: string; type: "success" | "danger" }[]
  >([]);

  const user = React.useMemo(() => {
    return JSON.parse(localStorage.getItem("user") || "null");
  }, []);

  useEffect(() => {
    const syncFavorites = () => {
      const storedFavs = JSON.parse(localStorage.getItem("favorites") || "[]");
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
          `${baseUrl}/api/artists/similar/${artistId}`
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
    const newArtistId = parts[parts.length - 1];
    onArtistSelect(newArtistId);
  };

  if (!user) return null;

  return (
    <div className="mt-4">
      {loading ? (
        <div className="text-center my-3">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : similarArtists.length > 0 ? (
        <div className="custom-carousel-container">
          <h3 className="text-start mb-3">Similar Artists</h3>
          <div className="custom-carousel">
            {similarArtists.map((artist) => {
              const artistId = artist._links.self.href.split("/").pop();
              const isFav = favorites.includes(artistId);

              return (
                <Card
                  key={artist._links.self.href}
                  className="flex-shrink-0 position-relative text-center"
                  style={{ width: "230px" }}
                  onClick={() => handleArtistClick(artist._links.self.href)}
                >
                  {user && (
                    <div
                      className="position-absolute top-0 end-0 m-2 bg-primary rounded-circle d-flex align-items-center justify-content-center"
                      style={{ padding: "6px", cursor: "pointer", zIndex: 10 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(artistId);
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
                    src={artist._links.thumbnail?.href || fallBackImage}
                    alt={artist.title}
                    className="rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallBackImage;
                    }}
                  />

                  <Card.Body className="bg-primary text-white p-2 rounded-bottom d-flex flex-column">
                    <Card.Title className="text-start fw-bold fs-5">
                      {artist.name}
                    </Card.Title>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        </div>
      ) : null}

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
