import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import axios from "axios";

axios.defaults.baseURL = process.env.REACT_APP_AXIOS_BASE_URL;
axios.defaults.headers = {
  accept: "application/json",
  "Content-Type": "application/json",
  authorization: `Basic ${process.env.REACT_APP_BASIC_AUTH_PAYMONGO}`,
};

const theme = createTheme({
  fontFamily: "Poppins, sans-serif",
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <App />
    </MantineProvider>
  </React.StrictMode>
);
