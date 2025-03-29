import React, { useState, useEffect } from "react";
import { Card, Nav, Row, Col, Modal, Image, Spinner } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
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
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [artistInfo, setArtistInfo] = useState<ArtistInfo | null>(null);
  const [artworks, setArtworks] = useState<Artworks | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
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
        { params: { userId } }
      );
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!userId) return;

    try {
      const response = await axios.post(
        "http://localhost:5001/api/artists/favorites",
        { userId, artistId }
      );
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  const isFavorite = favorites.some((fav) => fav.artistId === artistId);

  function MyVerticallyCenteredModal(props: any) {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
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
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            {geneData?._embedded?.genes.map((gene: any, index: number) => (
              <Card
                key={index}
                style={{
                  width: "200px",
                  textAlign: "center",
                }}
              >
                <Card.Img
                  variant="top"
                  src={gene._links.thumbnail.href}
                  alt={gene.name}
                  style={{
                    borderRadius: "5px",
                  }}
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
          <Nav.Link
            eventKey="artistInfo"
            style={{
              padding: "0.75rem 1rem",
              textAlign: "center",
              width: "100%",
            }}
          >
            Artist Info
          </Nav.Link>
        </Nav.Item>
        <Nav.Item style={{ width: "50%" }}>
          <Nav.Link
            eventKey="artworks"
            style={{
              padding: "0.75rem 1rem",
              textAlign: "center",
              width: "100%",
            }}
          >
            Artworks
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Show favorite button next to title, but only when title exists */}
      {artistInfo?.name && (
        <div
          style={{
            alignItems: "center",
            gap: "10px",
            marginTop: "15px",
          }}
          className="text-center mx-auto"
        >
          <h2>
            {artistInfo.name}&nbsp;
            {userId && (
              <FaStar
                size={30}
                color={isFavorite ? "yellow" : "gray"}
                style={{ cursor: "pointer" }}
                onClick={toggleFavorite}
                className="mb-1"
              />
            )}
          </h2>
        </div>
      )}

      {!artistInfo || !artworks ? (
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
                <Card.Footer>
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
