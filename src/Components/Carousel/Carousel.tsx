import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import fallBackImage from "../../assets/images/artsy_logo.svg";
import "./Carousel.css";
import Description from "../Description/Description";

interface CarouselItem {
  type: string;
  title: string;
  description: string | null;
  og_type: string;
  _links: {
    self: { href: string };
    permalink: { href: string };
    thumbnail: { href: string };
  };
}

interface CarouselProps {
  items: CarouselItem[];
}

interface ArtworkLinks {
  thumbnail: {
    href: string;
  };
}

interface Artworks {
  _links: ArtworkLinks;
  title: string;
}

interface ArtistInfo {
  name: string;
  nationality: string;
  birthday: string;
  deathday: string;
  biography: string;
}

interface Favorite {
  artistId: string;
  addedAt: string;
}

const ArtistCarousel: React.FC<CarouselProps> = ({ items }) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [descriptionData, setDescriptionData] = useState<ArtistInfo | null>(
    null
  );
  const [artworksData, setArtworksData] = useState<Artworks | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when items change
    setSelectedItem(null);
    setDescriptionData(null);
    setArtworksData(null);
  }, [items]);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedItem) {
        setDescriptionData(null);
        setArtworksData(null);

        const [descr, artworks] = await Promise.all([
          axios.get(`http://localhost:5001/api/artists/${selectedItem}`),
          axios.get(
            `http://localhost:5001/api/artists/artwork/${selectedItem}`
          ),
        ]);

        setDescriptionData(descr.data);
        setArtworksData(artworks.data);
      }
    };
    fetchData();
  }, [selectedItem]);

  useEffect(() => {
    // Fetch user ID and favorites from local storage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user._id) {
      setUserId(user._id);
      fetchFavorites(user._id);
    }
  }, []);

  const fetchFavorites = async (userId: string) => {
    try {
      const response = await axios.get(
        "http://localhost:5001/api/artists/favorites",
        {
          params: { userId },
        }
      );
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const toggleFavorite = async (artistId: string) => {
    if (!userId) return;

    try {
      const response = await axios.post(
        "http://localhost:5001/api/artists/favorites",
        {
          userId,
          artistId,
        }
      );

      setFavorites(response.data.favorites);
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  return (
    <div>
      <div className="custom-carousel-container">
        <div className="custom-carousel">
          {items.map((item) => {
            const parts = item._links.self.href.split("/");
            const id = parts[parts.length - 1];
            const isFavorite = favorites.some((fav) => fav.artistId === id);

            return (
              <Card
                key={id}
                style={{
                  width: "230px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                }}
                onClick={() => setSelectedItem(id)}
              >
                {userId && (
                  <FaStar
                    size={24}
                    color={isFavorite ? "yellow" : "white"}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      cursor: "pointer",
                      background: "#0d6efd",
                      borderRadius: "50%",
                      padding: "5px",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(id);
                    }}
                  />
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

      {selectedItem && (
        <Description artistInfo={descriptionData} artworks={artworksData} />
      )}
    </div>
  );
};

export default ArtistCarousel;
