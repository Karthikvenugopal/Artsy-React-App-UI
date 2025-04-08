import React, { useState, useEffect } from "react";
import { Card, Nav, Row, Col, Modal, Image, Spinner } from "react-bootstrap";
import { FaStar, FaRegStar } from "react-icons/fa";
import axios from "axios";

interface ArtistInfo {
  name: string;
  nationality: string;
  birthday: string;
  deathday: string;
  biography: string;
}

interface Artwork {
  id: string;
  title: string;
  date: string;
  _links: {
    thumbnail: {
      href: string;
    };
  };
}

interface Artworks {
  _embedded: {
    artworks: Artwork[];
  };
}

interface DescriptionProps {
  artistId: string;
  onArtistSelect: (artistId: string) => void;
}

interface Favorite {
  artistId: string;
  addedAt: string;
}

const Description: React.FC<DescriptionProps> = ({
  artistId,
  onArtistSelect,
}) => {
  const [activeTab, setActiveTab] = useState<string>("artistInfo");
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [modalData, setModalData] = useState<any>(null);
  const [geneData, setGeneData] = useState<any>(null);
  const [artistInfo, setArtistInfo] = useState<ArtistInfo | null>(null);
  const [artworks, setArtworks] = useState<Artworks | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [infoRes, artworksRes] = await Promise.all([
          axios.get(`http://localhost:5001/api/artists/${artistId}`),
          axios.get(`http://localhost:5001/api/artists/artwork/${artistId}`),
        ]);

        setArtistInfo(infoRes.data);
        setArtworks(artworksRes.data);
      } catch (error) {
        console.error("Error fetching artist data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (artistId) {
      fetchData();
    }
  }, [artistId]);

  const handleArtworkClick = async (artwork: Artwork) => {
    try {
      setModalData({ artwork });
      const response = await axios.get(
        `http://localhost:5001/api/artists/genes/${artwork.id}`
      );
      setGeneData(response.data);
      setModalShow(true);
    } catch (error) {
      console.error("Error fetching gene data:", error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5001/api/artists/favorites",
        { artistId },
        { withCredentials: true }
      );
      const updatedFavorites = res.data.favorites.map((f: any) => f.artistId);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      window.dispatchEvent(new Event("favoritesUpdated"));
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  const isFavorite = favorites.includes(artistId);

  function MyVerticallyCenteredModal(props: any) {
    return (
      <Modal
        {...props}
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
      >
        <Modal.Header closeButton>
          <Modal.Title
            id="contained-modal-title-vcenter"
            style={{ display: "flex", alignItems: "center", gap: "1rem" }}
          >
            <Image
              src={modalData?.artwork?._links?.thumbnail?.href}
              alt={modalData?.artwork?.title}
              style={{
                maxWidth: "50px",
                height: "50px",
                objectFit: "cover",
                borderRadius: "5px",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: "bold", fontSize: "1.25rem" }}>
                {modalData?.artwork?.title}
              </span>
              <span style={{ fontSize: "1rem", color: "gray" }}>
                {modalData?.artwork?.date}
              </span>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {geneData?._embedded?.genes.map((gene: any, index: number) => (
              <Card key={index} style={{ width: "250px", textAlign: "center" }}>
                <Card.Img
                  variant="top"
                  src={gene._links.thumbnail.href}
                  alt={gene.name}
                  style={{ borderRadius: "5px" }}
                />
                <Card.Body>
                  <Card.Title style={{ fontSize: "1rem" }}>
                    {gene.name}
                  </Card.Title>
                </Card.Body>
              </Card>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <div>
      <Nav
        variant="pills"
        activeKey={activeTab}
        onSelect={(key) => setActiveTab(key || "artistInfo")}
        className="d-flex flex-nowrap"
        style={{
          fontSize: "1.25rem",
          width: "80%",
          margin: "0 auto",
        }}
      >
        <Nav.Item style={{ width: "50%" }}>
          <Nav.Link eventKey="artistInfo" style={{ textAlign: "center" }}>
            Artist Info
          </Nav.Link>
        </Nav.Item>
        <Nav.Item style={{ width: "50%" }}>
          <Nav.Link eventKey="artworks" style={{ textAlign: "center" }}>
            Artworks
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Name + Favorite Star */}
      {artistInfo?.name && (
        <div className="text-center mx-auto mt-3 d-flex justify-content-center align-items-center gap-2">
          <h2 className="mb-0">{artistInfo.name}</h2>
          {user && (
            <div
              onClick={toggleFavorite}
              style={{
                cursor: "pointer",
                borderRadius: "50%",
                padding: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isFavorite ? (
                <FaStar
                  size={26}
                  color="yellow"
                  style={{ stroke: "gray", strokeWidth: 1.5 }}
                />
              ) : (
                <FaRegStar
                  size={26}
                  color="gray"
                  style={{ stroke: "gray", strokeWidth: 1.5 }}
                />
              )}
            </div>
          )}
        </div>
      )}

      {loading || !artistInfo || !artworks ? (
        <div className="text-center my-3">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : activeTab === "artistInfo" ? (
        <div className="p-3">
          <div style={{ fontSize: "1.25rem" }}>
            {artistInfo.nationality}, {artistInfo.birthday} -{" "}
            {artistInfo.deathday}
          </div>
          <div style={{ marginTop: "1rem", fontSize: "1.25rem" }}>
            {artistInfo.biography}
          </div>
        </div>
      ) : (
        <Row className="g-4 p-3">
          {artworks._embedded.artworks.map((artwork) => (
            <Col key={artwork.id} xs={12} sm={6} md={4} lg={3}>
              <Card>
                <Card.Img
                  variant="top"
                  src={artwork._links.thumbnail.href}
                  alt={artwork.title}
                />
                <Card.Body>
                  <Card.Title>
                    {artwork.title}, {artwork.date}
                  </Card.Title>
                </Card.Body>
                <Card.Footer
                  style={{ cursor: "pointer" }}
                  onClick={() => handleArtworkClick(artwork)}
                >
                  <small className="text-muted">View categories</small>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
    </div>
  );
};

export default Description;
