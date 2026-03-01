import React from "react";
import { Link } from "react-router";

const NotFound = () => {
  const styles = {
    wrapper: {
      minHeight: "80vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "20px",
    },
    box: {
      maxWidth: "500px",
      width: "100%",
    },
    code: {
      fontSize: "clamp(70px, 10vw, 120px)",
      margin: 0,
      opacity: 0.8, // inherits color from theme
    },
    title: {
      marginTop: "10px",
    },
    text: {
      margin: "15px 0 25px",
      opacity: 0.7,
      lineHeight: 1.5,
    },
    button: {
      textDecoration: "none",
      padding: "10px 22px",
      borderRadius: "6px",
      border: "1px solid currentColor", // adapts to theme
      color: "inherit",
      transition: "0.2s ease",
      display: "inline-block",
      fontWeight: 500,
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.box}>
        <h1 style={styles.code}>404</h1>
        <h2 style={styles.title}>Page Not Found</h2>
        <p style={styles.text}>
          Sorry, the page you are looking for doesn’t exist or may have been moved.
        </p>

        <Link
          to="/"
          style={styles.button}
          onMouseOver={(e) => (e.target.style.opacity = "0.75")}
          onMouseOut={(e) => (e.target.style.opacity = "1")}
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
