import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "../components/Layout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import GuidePage from "../pages/Guide";
import ContactPage from "../pages/Contact";
import Favorites from "../pages/favorites";
import Profile from "../pages/profile";
import History from "../pages/history";
import PlaceDetail from "../pages/PlaceDetail";

const router = createBrowserRouter([
    {
        path: "/", 
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            { path: "login", element: <Login /> },
            { path: "register", element: <Register /> },
            { path: "guide", element: <GuidePage /> },
            { path: "contact", element: <ContactPage /> },
            { path: "favorites", element: <Favorites /> },
            { path: "profile", element: <Profile /> },
            { path: "history", element: <History /> },
            { path: "place/:id", element: <PlaceDetail /> }
        ]
    },
]);
    
export default function Routers() {
    return <RouterProvider router={router} />;
};