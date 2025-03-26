import React, { useState } from "react";
import { Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

interface AuthResponse {
  message: string;
  user?: any;
  token?: string;
}

const Register: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
  }>({});
  const [touched, setTouched] = useState<{
    fullName: boolean;
    email: boolean;
    password: boolean;
  }>({
    fullName: false,
    email: false,
    password: false,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ✅ Validate a specific field
  const validateField = (field: string, value: string) => {
    let newErrors = { ...errors };

    if (field === "fullName") {
      newErrors.fullName =
        value.trim().length >= 3
          ? ""
          : "Full Name must be at least 3 characters.";
    }
    if (field === "email") {
      if (!value.trim()) newErrors.email = "Email is required.";
      else if (!emailRegex.test(value))
        newErrors.email = "Invalid email format.";
      else newErrors.email = "";
    }
    if (field === "password") {
      newErrors.password =
        value.trim().length >= 6
          ? ""
          : "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
  };

  // ✅ Handle blur (when a field loses focus)
  const handleBlur = (field: string) => {
    setTouched((prev) => {
      const updatedTouched = { ...prev, [field]: true };
      validateField(
        field,
        field === "fullName" ? fullName : field === "email" ? email : password
      );
      return updatedTouched;
    });
  };

  // ✅ Handle input change & validate dynamically
  const handleInputChange = (field: string, value: string) => {
    if (field === "fullName") setFullName(value);
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);

    if (touched[field as keyof typeof touched]) {
      validateField(field, value);
    }
  };

  // ✅ Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const registerResponse = await axios.post<AuthResponse>(
        "http://localhost:5001/api/auth/register",
        {
          fullname: fullName,
          email,
          password,
        }
      );

      if (!registerResponse.data?.token) throw new Error("Token not received");

      // ✅ Store user and token in localStorage & cookies
      Cookies.set("token", registerResponse.data.token, { expires: 1 });
      localStorage.setItem("user", JSON.stringify(registerResponse.data.user));

      setLoading(false);
      navigate("/favorites"); // Redirect to favorites
      window.location.reload(); // Force header update
    } catch (err: any) {
      setLoading(false);
      setErrors({
        email: err.response?.data?.message || "Something went wrong.",
      });
    }
  };

  return (
    <div>
      <Card className="mx-auto" style={{ width: "22rem", marginTop: "5rem" }}>
        <Card.Body>
          <Card.Title className="mb-3 text-start fs-2">Register</Card.Title>

          {errors.email && <Alert variant="danger">{errors.email}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formFullName" className="mb-3 text-start">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                onBlur={() => handleBlur("fullName")}
                isInvalid={!!errors.fullName}
                required
              />
              {errors.fullName && (
                <div className="text-danger mt-1">{errors.fullName}</div>
              )}
            </Form.Group>

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
                isInvalid={!!errors.password}
                required
              />
              {errors.password && (
                <div className="text-danger mt-1">{errors.password}</div>
              )}
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Register"}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <div className="mt-2 text-center">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
};

export default Register;
