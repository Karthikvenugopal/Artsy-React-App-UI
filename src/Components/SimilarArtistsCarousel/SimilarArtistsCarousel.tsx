import React, { useEffect, useState } from "react";
import { Card, Spinner } from "react-bootstrap";
import { FaStar, FaRegStar } from "react-icons/fa";
import axios from "axios";
import fallBackImage from "../../assets/images/artsy_logo.svg";
import "./SimilarArtistsCarousel.css";

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
          `http://localhost:5001/api/artists/similar/${artistId}`
        );
        setSimilarArtists(response.data._embedded?.artists || []);
      } catch (error) {
        console.error("Error fetching similar artists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarArtists();
  }, [artistId]); // ✅ only depends on artistId now

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
      ) : (
        similarArtists.length > 0 && (
          <div className="custom-carousel-container">
            <h3 className="text-start mb-3">Similar Artists</h3>
            <div className="custom-carousel">
              {similarArtists.map((artist) => {
                const artistId = artist._links.self.href.split("/").pop();
                const isFav = favorites.includes(artistId);

                return (
                  <Card
                    key={artist._links.self.href}
                    style={{
                      width: "230px",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                    }}
                    onClick={() => handleArtistClick(artist._links.self.href)}
                  >
                    {/* Favorite star */}
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

                    <Card.Img
                      variant="top"
                      src={artist._links.thumbnail?.href || fallBackImage}
                      alt={artist.title}
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
                        {artist.name}
                      </Card.Title>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default SimilarArtistsCarousel;
