import React, { useState, useEffect } from "react";
import {
  Card,
  Nav,
  Row,
  Col,
  Modal,
  Image,
  Spinner,
  ToastContainer,
} from "react-bootstrap";
import { FaStar, FaRegStar } from "react-icons/fa";
import axios from "axios";
import ToastComponent from "../Toast/Toast";
import "./Description.css";

const baseUrl = import.meta.env.VITE_API_BACKEND_URI;

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

const Description: React.FC<DescriptionProps> = ({
  artistId,
  onArtistSelect,
}) => {
  const [activeTab, setActiveTab] = useState("artistInfo");
  const [modalShow, setModalShow] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [geneData, setGeneData] = useState<any>(null);
  const [artistInfo, setArtistInfo] = useState<ArtistInfo | null>(null);
  const [artworks, setArtworks] = useState<Artworks | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<
    { id: number; message: string; type: "success" | "danger" }[]
  >([]);

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
          axios.get(`${baseUrl}/api/artists/${artistId}`),
          axios.get(`${baseUrl}/api/artists/artwork/${artistId}`),
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

  const addToast = (message: string, type: "success" | "danger") => {
    setToasts((prev) => {
      const next = [...prev, { id: Date.now(), message, type }];
      return next.slice(-3);
    });
  };

  const toggleFavorite = async () => {
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
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  const handleArtworkClick = async (artwork: Artwork) => {
    try {
      setModalData({ artwork });
      const response = await axios.get(
        `${baseUrl}/api/artists/genes/${artwork.id}`
      );
      setGeneData(response.data);
      setModalShow(true);
    } catch (error) {
      console.error("Error fetching gene data:", error);
    }
  };

  const isFavorite = favorites.includes(artistId);

  function ArtworkModal(props: any) {
    return (
      <Modal
        {...props}
        size="xl"
        scrollable
        backdrop="static"
        keyboard={true}
        style={{ height: "90vh", margin: "0 auto" }}
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-3">
            <Image
              src={modalData?.artwork?._links?.thumbnail?.href}
              alt={modalData?.artwork?.title}
              className="rounded object-fit-cover"
              style={{ width: "50px", height: "50px" }}
            />
            <div className="d-flex flex-column fs-6 fw-normal">
              <div>{modalData?.artwork?.title}</div>
              <div>{modalData?.artwork?.date}</div>
            </div>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          className="overflow-auto"
          style={{ height: "calc(100vh - 120px)" }}
        >
          <Row className="g-4 artwork-modal-row">
            {geneData?._embedded?.genes.map((gene: any, index: number) => (
              <Col
                key={index}
                xs={12}
                sm={10}
                md={6}
                lg={3}
                className="d-flex justify-content-center justify-content-lg-start"
              >
                <Card
                  className="h-100 text-center w-100"
                  style={{ maxWidth: "20rem" }}
                >
                  <Card.Img
                    variant="top"
                    src={gene._links.thumbnail.href}
                    alt={gene.name}
                    className="rounded"
                    style={{ height: "250px", objectFit: "cover" }}
                  />
                  <Card.Body className="p-3">
                    <Card.Title className="text-truncate mb-0 fs-6">
                      {gene.name}
                    </Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <div
      className="w-100 mx-auto mt-4 text-center"
      style={{ maxWidth: "1280px" }}
    >
      <div className="d-flex justify-content-center mt-2">
        <Nav
          variant="pills"
          activeKey={activeTab}
          onSelect={(key) => setActiveTab(key || "artistInfo")}
          className="w-100"
        >
          <Nav.Item className="w-50">
            <Nav.Link eventKey="artistInfo" className="text-center w-100">
              Artist Info
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="w-50">
            <Nav.Link eventKey="artworks" className="text-center w-100">
              Artworks
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>

      {loading || !artistInfo || !artworks ? (
        <div className="text-center my-4">
          <Spinner animation="border" role="status" variant="primary" />
        </div>
      ) : (
        <>
          <div className="text-center mt-3 d-flex justify-content-center align-items-center gap-2">
            <div className="fs-3 fw-medium">{artistInfo.name}</div>
            {user && (
              <div
                onClick={toggleFavorite}
                className="d-flex align-items-center justify-content-center p-1 rounded-circle"
                style={{ cursor: "pointer" }}
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

          {activeTab === "artistInfo" ? (
            <div>
              <div className="text-center fs-6">
                {artistInfo.nationality}, {artistInfo.birthday} -{" "}
                {artistInfo.deathday}
              </div>
              <div className="mt-3 text-start text-break fs-6">
                {artistInfo.biography}
              </div>
            </div>
          ) : artworks._embedded.artworks.length === 0 ? (
            <div className="w-100 d-flex justify-content-center mt-4">
              <div
                className="w-100 p-3"
                style={{
                  maxWidth: "3000px",
                  backgroundColor: "#f8d7da",
                  border: "1px solid #f5c2c7",
                  color: "#842029",
                  borderRadius: "0.375rem",
                  textAlign: "left",
                }}
              >
                No artworks.
              </div>
            </div>
          ) : (
            <Row className="g-4 p-3">
              {artworks._embedded.artworks.map((artwork) => (
                <Col
                  key={artwork.id}
                  xs={12}
                  sm={12}
                  md={6}
                  lg={3}
                  className="d-flex justify-content-center mb-4"
                >
                  <Card className="w-100" style={{ maxWidth: "22rem" }}>
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
                      className="hover-blue-footer"
                      onClick={() => handleArtworkClick(artwork)}
                    >
                      View categories
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </>
      )}

      <ArtworkModal show={modalShow} onHide={() => setModalShow(false)} />

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

export default Description;
