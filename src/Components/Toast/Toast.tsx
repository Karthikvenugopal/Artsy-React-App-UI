import React from "react";
import { Toast } from "react-bootstrap";

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  type: "success" | "danger";
}

const ToastComponent: React.FC<ToastProps> = ({
  message,
  show,
  onClose,
  type,
}) => {
  const toastStyles = {
    success: {
      backgroundColor: "#d4edda",
      border: "1px solid #c3e6cb",
      color: "#155724",
    },
    danger: {
      backgroundColor: "#f8d7da",
      border: "1px solid #f5c6cb",
      color: "#721c24",
    },
  };

  return (
    <Toast
      show={show}
      onClose={onClose}
      delay={3000}
      autohide
      closeButton={true}
      style={{
        ...toastStyles[type],
        maxWidth: "300px",
        width: "100%",
      }}
    >
      <Toast.Body
        style={{
          color: toastStyles[type].color,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{message}</span>
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          style={{
            filter:
              type === "success"
                ? "invert(24%) sepia(94%) saturate(1204%) hue-rotate(106deg) brightness(93%) contrast(97%)"
                : "invert(18%) sepia(51%) saturate(2583%) hue-rotate(341deg) brightness(92%) contrast(84%)",
          }}
          aria-label="Close"
        />
      </Toast.Body>
    </Toast>
  );
};

export default ToastComponent;
