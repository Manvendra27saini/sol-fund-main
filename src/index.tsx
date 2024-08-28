import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import WalletConnetProvider from "./WalletProvider";
import { BrowserRouter as Router } from "react-router-dom";
import AppProvider from "./Context";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import theme from "./theme";
import "@fontsource/montserrat"; // Defaults to weight 400
import "@fontsource/montserrat/400.css"; // Specify weight
import "@fontsource/montserrat/400-italic.css"; // Specify weight and style
import { Toaster } from "react-hot-toast";

import "@fontsource/montserrat/200.css";
import "@fontsource/montserrat/300.css";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";

import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <Router>
      <WalletConnetProvider>
        <Provider store={store}>
          <AppProvider>
            <Toaster />
            <ChakraProvider theme={theme}>
              <App />
            </ChakraProvider>
          </AppProvider>
        </Provider>
      </WalletConnetProvider>
    </Router>
  </React.StrictMode>
);
