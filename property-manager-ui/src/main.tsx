import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { store } from "@/app/store";
import { queryClient } from "@/app/queryClient";
import AppRouter from "@/routes/AppRouter";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <AppRouter />
                </BrowserRouter>
            </QueryClientProvider>
        </Provider>
    </React.StrictMode>
);

