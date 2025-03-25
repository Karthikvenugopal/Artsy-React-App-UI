import React, { useState } from "react";
import { Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../Context/AuthContext"; // Import AuthContext for global state

const Login: React.FC = () => {
  const { login } = useAuth(); // Use the login function from AuthContext
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

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validate a specific field
  const validateField = (field: string) => {
    let newErrors = { ...errors };

    if (field === "email") {
      if (!email.trim()) newErrors.email = "Email is required.";
      else if (!emailRegex.test(email))
        newErrors.email = "Invalid email format.";
      else newErrors.email = "";
    }
    if (field === "password") {
      newErrors.password = password.trim() ? "" : "Password is required.";
    }

    setErrors(newErrors);
  };

  // Handle blur (user leaves a field)
  const handleBlur = (field: string) => {
    setTouched((prev) => {
      const updatedTouched = { ...prev, [field]: true };
      validateField(field); // Validate immediately
      return updatedTouched;
    });
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);

    if (touched[field as keyof typeof touched]) {
      validateField(field); // Validate in real-time only if the field was already touched
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Mark all fields as touched before validating
    setTouched({ email: true, password: true });
    validateField("email");
    validateField("password");

    // Check if there are validation errors
    if (errors.email || errors.password) return;

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/login",
        { email, password }
      );

      console.log("✅ Login successful:", response.data);

      // Store user and token in global state
      login(response.data.user, response.data.token);

      setLoading(false);
      navigate("/search"); // Redirect to dashboard after successful login
    } catch (err: any) {
      setLoading(false);
      console.error(
        "❌ Login failed:",
        err.response?.data?.message || err.message
      );
      setErrors({
        ...errors,
        general:
          err.response?.data?.message ||
          "Invalid credentials. Please try again.",
      });
    }
  };

  return (
    <div>
      <Card className="mx-auto" style={{ width: "22rem", marginTop: "5rem" }}>
        <Card.Body>
          <Card.Title className="mb-3 text-start fs-2">Login</Card.Title>

          {errors.general && <Alert variant="danger">{errors.general}</Alert>}

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
