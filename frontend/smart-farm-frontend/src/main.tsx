import React from "react";
import ReactDOM from "react-dom/client";
import { ApolloProvider } from "@apollo/client";
import { BrowserRouter } from "react-router-dom";
import { apolloClient } from "@/lib/apollo-client";
import { ThemeModeProvider } from "@/theme/ThemeModeContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import { I18nProvider } from "@/i18n/I18nProvider";
import "@/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nProvider>
    <ThemeModeProvider>
      <ApolloProvider client={apolloClient}>
        <BrowserRouter>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <App />
          </GoogleOAuthProvider>
        </BrowserRouter>
      </ApolloProvider>
    </ThemeModeProvider>
    </I18nProvider>
  </React.StrictMode>,
);
