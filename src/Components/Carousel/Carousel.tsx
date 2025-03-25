import React, { useEffect } from "react";
import { Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import fallBackImage from "../../assets/images/artsy_logo.svg";
import "./Carousel.css";
import Description from "../Description/Description";
import axios from "axios";

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

const ArtistCarousel: React.FC<CarouselProps> = ({ items }) => {
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);
  const [descriptionData, setDescriptionData] =
    React.useState<ArtistInfo | null>(null);
  const [artworksData, setArtworksData] = React.useState<Artworks | null>(null);

  useEffect(() => {
    // Reset all state when items change
    setSelectedItem(null);
    setDescriptionData(null);
    setArtworksData(null);
  }, [items]);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedItem) {
        setDescriptionData(null);
        setArtworksData(null);
        console.log(selectedItem);
        const [descr, artworks] = await Promise.all([
          axios.get(`http://localhost:5001/api/artists/${selectedItem}`),
          axios.get(
            `http://localhost:5001/api/artists/artwork/${selectedItem}`
          ),
        ]);
        console.log(descr.data);
        console.log(artworks.data);
        setDescriptionData(descr.data);
        setArtworksData(artworks.data);
      }
    };
    fetchData();
  }, [selectedItem]);

  return (
    <div>
      <div className="custom-carousel-container">
        <div className="custom-carousel">
          {items.map((item) => {
            const parts = item._links.self.href.split("/");
            const id = parts[parts.length - 1];

            return (
              <Card
                key={id}
                style={{
                  width: "230px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                }}
                onClick={() => setSelectedItem(id)}
              >
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
