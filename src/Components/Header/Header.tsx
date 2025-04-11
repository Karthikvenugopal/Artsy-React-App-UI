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
import "./Header.css";

const baseUrl = import.meta.env.VITE_API_BACKEND_URI;

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
      navigate("/search");
      window.location.reload();
    }, 2000);
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`${baseUrl}/api/auth/delete-account`, {
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
      <Navbar expand="lg" className="bg-light">
        <Container fluid>
          <Navbar.Brand href="#">Artist Search</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <div className="d-lg-none w-100">
              <Nav className="flex-column mobile-nav">
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
                    <Nav.Item className="nav-username-mobile">
                      <Dropdown>
                        <Dropdown.Toggle variant="light" className="w-100">
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
                        <Dropdown.Menu
                          className="text-start dropdown-no-push"
                          style={{ right: "0", left: "auto" }}
                        >
                          <Dropdown.Item
                            onClick={handleDeleteAccount}
                            className="text-danger"
                          >
                            Delete Account
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item
                            onClick={handleLogout}
                            className="text-primary"
                          >
                            Log Out
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </Nav.Item>
                  </>
                ) : (
                  <>
                    <Nav.Item>
                      <Nav.Link
                        onClick={() => navigate("/login")}
                        className={
                          isActive("/login") ? "custom-active-link" : ""
                        }
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
            </div>

            <div className="d-none d-lg-flex ms-auto align-items-center desktop-nav">
              <Nav>
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
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="light"
                        className="d-flex align-items-center"
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
                      <Dropdown.Menu
                        className="text-start dropdown-no-push"
                        style={{ right: "0", left: "auto" }}
                      >
                        <Dropdown.Item
                          onClick={handleDeleteAccount}
                          className="text-danger"
                        >
                          Delete Account
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item
                          onClick={handleLogout}
                          className="text-primary"
                        >
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
                        className={
                          isActive("/login") ? "custom-active-link" : ""
                        }
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
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ marginTop: "70px" }}
      >
        <ToastComponent
          message={showDeleteToast ? "Account deleted" : "Logged out"}
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
