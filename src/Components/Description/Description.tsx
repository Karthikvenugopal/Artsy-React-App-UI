import React, { useState } from "react";
import Nav from "react-bootstrap/Nav";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";
import Spinner from "react-bootstrap/Spinner";
import axios from "axios";

interface ArtistInfo {
  name: string;
  nationality: string;
  birthday: string;
  deathday: string;
  biography: string;
}

interface ArtworkLinks {
  self: {
    href: string;
  };
  next: {
    href: string;
  };
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
  _links: ArtworkLinks;
}

interface DescriptionProps {
  artistInfo: ArtistInfo | null;
  artworks: Artworks | null;
}

const Description: React.FC<DescriptionProps> = ({ artistInfo, artworks }) => {
  const [activeTab, setActiveTab] = useState<string>("artistInfo");
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [modalData, setModalData] = useState<any>(null);
  const [geneData, setGeneData] = useState<any>(null);

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

      {!artistInfo || !artworks ? (
        <div className="text-center my-3">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : activeTab === "artistInfo" ? (
        <div className="p-3">
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>
            {artistInfo.name}
          </div>
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
                  className="text-muted text-center bg-transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).classList.remove(
                      "bg-transparent",
                      "text-muted"
                    );
                    (e.target as HTMLElement).classList.add(
                      "bg-primary",
                      "text-white"
                    );
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).classList.remove(
                      "bg-primary",
                      "text-white"
                    );
                    (e.target as HTMLElement).classList.add(
                      "bg-transparent",
                      "text-black"
                    );
                  }}
                  onClick={async () => {
                    const fetchGene = await axios.get(
                      "http://localhost:8787/genes/" + artwork.id
                    );
                    setGeneData(fetchGene.data);
                    setModalShow(true);
                    setModalData({ artwork });
                  }}
                >
                  View categories
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
