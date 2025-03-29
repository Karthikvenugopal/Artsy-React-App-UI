import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import artsyLogo from "../../assets/images/artsy_logo.svg";
import "./Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white mt-5 p-3 text-center fixed-bottom">
      <Container>
        <Row>
          <Col md="12">
            <div>
              Powered by{" "}
              <a href="https://www.artsy.net/" className="artsy-link">
                <img className="artsy-logo" src={artsyLogo} alt="Artsy Logo" />
              </a>{" "}
              <a href="https://www.artsy.net/" className="artsy-link">
                Artsy
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
