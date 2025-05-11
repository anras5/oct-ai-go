import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import App from "./App.jsx";

// Extend the theme if needed
const theme = extendTheme({
  colors: {
    brand: {
      50: "#e6f6ff",
      100: "#bae3ff",
      500: "#3182ce",
      600: "#2b6cb0",
      700: "#2c5282",
    },
  },
  fonts: {
    body: "Inter, system-ui, sans-serif",
    heading: "Inter, system-ui, sans-serif",
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
);
