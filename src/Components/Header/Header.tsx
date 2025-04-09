import React, { useState, useEffect } from "react";
import {
  Navbar,
  Container,
  Nav,
  Dropdown,
  Image,
  ToastContainer,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { FaUserCircle } from "react-icons/fa";
import ToastComponent from "../Toast/Toast";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Header.css"; // 👈 Import the custom CSS (create this file)

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any | null>(null);
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [showDeleteToast, setShowDeleteToast] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowLogoutToast(true);

    setTimeout(() => {
      navigate("/login");
      window.location.reload();
    }, 2000);
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete("http://localhost:5001/api/auth/delete-account", {
        withCredentials: true,
      });
      Cookies.remove("token");
      localStorage.removeItem("user");
      setUser(null);
      setShowDeleteToast(true);
      setTimeout(() => {
        navigate("/login");
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("Error deleting account:", err);
    }
  };

  const gravatarUrl = user?.profileImageUrl || "";
  const defaultAvatar = <FaUserCircle size={24} className="me-2" />;

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <Navbar expand="lg" className="bg-light fixed-top">
        <Container fluid>
          <Navbar.Brand href="#">Artist Search</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav className="ms-auto">
              <Nav.Item>
                <Nav.Link
                  onClick={() => navigate("/search")}
                  className={isActive("/search") ? "custom-active-link" : ""}
                >
                  Search
                </Nav.Link>
              </Nav.Item>
              {user ? (
                <>
                  <Nav.Item>
                    <Nav.Link
                      onClick={() => navigate("/favorites")}
                      className={
                        isActive("/favorites") ? "custom-active-link" : ""
                      }
                    >
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
                      <Dropdown.Item onClick={handleDeleteAccount}>
                        Delete Account
                      </Dropdown.Item>
                      <Dropdown.Item onClick={handleLogout}>
                        Log Out
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </>
              ) : (
                <>
                  <Nav.Item>
                    <Nav.Link
                      onClick={() => navigate("/login")}
                      className={isActive("/login") ? "custom-active-link" : ""}
                    >
                      Log in
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      onClick={() => navigate("/register")}
                      className={
                        isActive("/register") ? "custom-active-link" : ""
                      }
                    >
                      Register
                    </Nav.Link>
                  </Nav.Item>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ marginTop: "70px" }}
        stacked
      >
        <ToastComponent
          message={
            showDeleteToast ? "Account deleted!" : "Logged out successfully!"
          }
          show={showLogoutToast || showDeleteToast}
          onClose={() => {
            setShowLogoutToast(false);
            setShowDeleteToast(false);
          }}
          type={showDeleteToast ? "danger" : "success"}
        />
      </ToastContainer>
    </>
  );
};

export default Header;
