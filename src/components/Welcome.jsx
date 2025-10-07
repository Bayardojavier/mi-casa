import React from "react";
import { motion } from "framer-motion";
import "./Welcome.css";

const Welcome = ({ onEnter }) => {
  return (
    <div className="welcome-container">
      <motion.h1
        className="falling-text"
        initial={{ y: -200, scale: 3, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 12 }}
      >
        Bienvenido
      </motion.h1>

      <motion.h1
        className="falling-text"
        initial={{ y: -200, scale: 3, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.5 }}
      >
        Mi Casa App
      </motion.h1>

      <motion.button
        className="enter-button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onEnter}
      >
        Entrar
      </motion.button>
    </div>
  );
};

export default Welcome;
