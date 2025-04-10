import React, { useState, useEffect } from "react";
import { Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
const baseUrl = import.meta.env.VITE_API_BACKEND_URI;

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>(
    {
      email: false,
      password: false,
    }
  );
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (localUser) {
      navigate("/search");
    }
  }, [navigate]);

  const validateField = (field: string) => {
    let newErrors = { ...errors };

    if (field === "email") {
      if (!email.trim()) {
        newErrors.email = "Email is required.";
      } else if (!emailRegex.test(email)) {
        newErrors.email = "Email must be valid.";
      } else {
        newErrors.email = "";
      }
    }

    if (field === "password") {
      newErrors.password = password.trim() ? "" : "Password is required.";
    }

    setErrors(newErrors);
  };

  const isFormValid = () => {
    return emailRegex.test(email) && password.trim().length > 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => {
      const updatedTouched = { ...prev, [field]: true };
      validateField(field);
      return updatedTouched;
    });
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);

    if (touched[field as keyof typeof touched]) {
      validateField(field);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${baseUrl}/api/auth/login`, {
        email,
        password,
      });

      Cookies.set("token", response.data.token, { expires: 1 });
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setLoading(false);
      navigate("/search");
      window.location.reload();
    } catch (err: any) {
      setLoading(false);
      setErrors({
        ...errors,
        email: "", // clear field-specific errors
        password: "", // clear field-specific errors
        general: "Password or email incorrect.",
      });
    }
  };

  return (
    <div>
      <Card className="mx-auto" style={{ width: "22rem", marginTop: "5rem" }}>
        <Card.Body>
          <Card.Title className="mb-3 text-start fs-2">Login</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formEmail" className="mb-3 text-start">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                isInvalid={!!errors.email}
                required
              />
              {errors.email && (
                <div className="text-danger mt-1">{errors.email}</div>
              )}
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-3 text-start">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                isInvalid={!!errors.password || !!errors.general}
                required
              />
              {errors.password && (
                <div className="text-danger mt-1">{errors.password}</div>
              )}
              {errors.general && (
                <div className="text-danger mt-1">{errors.general}</div>
              )}
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={loading || !isFormValid()}
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Login"}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <div className="mt-2 text-center">
        Don't have an account yet? <Link to="/register">Register</Link>
      </div>
    </div>
  );
};

export default Login;
