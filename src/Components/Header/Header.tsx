import React from "react";
import { Navbar, Container, Nav, Dropdown, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext"; // Import AuthContext
import { FaUserCircle } from "react-icons/fa"; // Default fallback icon

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Extract gravatar URL or fallback icon
  const gravatarUrl = user?.profileImageUrl || "";
  const defaultAvatar = <FaUserCircle size={24} className="me-2" />;

  return (
    <Navbar expand="lg" className="bg-light fixed-top">
      <Container fluid>
        <Navbar.Brand href="#">Artist Search</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          {/* Consolidated navigation to the right side */}
          <Nav className="ms-auto">
            <Nav.Item>
              <Nav.Link onClick={() => navigate("/search")}>Search</Nav.Link>
            </Nav.Item>
            {user ? (
              <>
                <Nav.Item>
                  <Nav.Link onClick={() => navigate("/favorites")}>
                    Favorites
                  </Nav.Link>
                </Nav.Item>
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="light"
                    className="d-flex align-items-center border-0 bg-transparent"
                  >
                    {gravatarUrl ? (
                      <Image
                        src={gravatarUrl}
                        roundedCircle
                        width={24}
                        height={24}
                        className="me-2"
                      />
                    ) : (
                      defaultAvatar
                    )}
                    {user.fullname}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => navigate("/delete-account")}>
                      Delete Account
                    </Dropdown.Item>
                    <Dropdown.Item onClick={logout}>Log Out</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Nav.Item>
                  <Nav.Link onClick={() => navigate("/login")}>Log in</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link onClick={() => navigate("/register")}>
                    Register
                  </Nav.Link>
                </Nav.Item>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
