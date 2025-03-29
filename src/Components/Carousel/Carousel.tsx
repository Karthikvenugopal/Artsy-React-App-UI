import React from "react";
import { Card } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import fallBackImage from "../../assets/images/artsy_logo.svg";
import "./Carousel.css";

interface CarouselProps {
  items: any[];
  onArtistSelect: (artistId: string) => void;
}

const ArtistCarousel: React.FC<CarouselProps> = ({ items, onArtistSelect }) => {
  const handleArtistClick = (href: string) => {
    const parts = href.split("/");
    const artistId = parts[parts.length - 1];
    onArtistSelect(artistId);
  };

  return (
    <div className="custom-carousel-container">
      <div className="custom-carousel">
        {items.map((item) => (
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
            <div
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
              }}
            >
              <FaStar size={20} color="white" />
            </div>

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
        ))}
      </div>
    </div>
  );
};

export default ArtistCarousel;
