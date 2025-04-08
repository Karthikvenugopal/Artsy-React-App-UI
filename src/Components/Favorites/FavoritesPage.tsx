import React, { useEffect, useState } from "react";
import { Card, Container, Row, Col, Spinner, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Favorite {
  artistId: string;
  addedAt: string;
}

interface ArtistInfo {
  id: string;
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

  if (seconds < 60) return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
};

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [artists, setArtists] = useState<ArtistInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveUpdate, setLiveUpdate] = useState(0);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [hasFetched, setHasFetched] = useState(false); // full reload only

  // Update timer every 30s
  useEffect(() => {
    const interval = setInterval(
      () => setLiveUpdate((prev) => prev + 1),
      30000
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "http://localhost:5001/api/artists/favorites",
          {
            withCredentials: true,
          }
        );

        const favorites: Favorite[] = res.data.favorites;

        // sort by addedAt descending
        favorites.sort(
          (a, b) =>
            new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );

        const results = await Promise.all(
          favorites.map((f) =>
            axios
              .get(`http://localhost:5001/api/artists/${f.artistId}`)
              .then((res) => ({
                id: f.artistId,
                name: res.data.name,
                birthday: res.data.birthday,
                deathday: res.data.deathday,
                nationality: res.data.nationality,
                thumbnail: `https://www.artsy.net/images/${f.artistId}.jpg`, // fallback if no thumbnail
                addedAt: f.addedAt,
              }))
          )
        );

        setArtists(results);
        localStorage.setItem("cached_favorites", JSON.stringify(results));
        setHasFetched(true);
      } catch (err) {
        console.error("Error fetching favorites page:", err);
      } finally {
        setLoading(false);
      }
    };

    const cached = localStorage.getItem("cached_favorites");
    if (cached) {
      setArtists(JSON.parse(cached));
      setLoading(false);
    } else {
      fetchFavorites();
    }
  }, []);

  const handleRemove = async (artistId: string) => {
    try {
      await axios.post(
        "http://localhost:5001/api/artists/favorites",
        { artistId },
        { withCredentials: true }
      );
      const updated = artists.filter((a) => a.id !== artistId);
      setArtists(updated);
      localStorage.setItem("cached_favorites", JSON.stringify(updated));
      window.dispatchEvent(new Event("favoritesUpdated"));
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    }
  };

  const handleCardClick = (artistId: string) => {
    localStorage.setItem("selectedArtistId", artistId);
    navigate("/search");
  };

  if (!user) {
    return <p className="text-center mt-5">Please log in to view favorites.</p>;
  }

  return (
    <Container className="mt-5 pt-5">
      <h2 className="mb-4">Your Favorite Artists</h2>
      {loading && !hasFetched ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : artists.length === 0 ? (
        <p className="text-muted">No favorite artists.</p>
      ) : (
        <Row className="g-4">
          {artists.map((artist) => (
            <Col key={artist.id} xs={12} sm={6} md={4} lg={3}>
              <Card
                style={{
                  position: "relative",
                  cursor: "pointer",
                  overflow: "hidden",
                  color: "white",
                  border: "none",
                }}
                onClick={() => handleCardClick(artist.id)}
              >
                {/* Blurred background */}
                <div
                  style={{
                    backgroundImage: `url(${artist.thumbnail})`,
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
                    padding: "1rem",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    borderRadius: "0.5rem",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Card.Title className="fw-bold">{artist.name}</Card.Title>
                  <div>{artist.nationality}</div>
                  <div>
                    {artist.birthday} - {artist.deathday}
                  </div>
                  <div className="mt-2 text-info">
                    {getRelativeTime(artist.addedAt)}
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    className="mt-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(artist.id);
                    }}
                  >
                    Remove
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default FavoritesPage;
