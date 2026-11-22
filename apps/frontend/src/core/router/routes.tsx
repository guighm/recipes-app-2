import PrivateRoute from "@/features/auth/components/PrivateRoute";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import AccountPage from "@/features/account/pages/AccountPage";
import CreateRecipePage from "@/features/recipes/pages/CreateRecipePage";
import HomePage from "@/features/recipes/pages/HomePage";
import RecipeDetailPage from "@/features/recipes/pages/RecipeDetailPage";
import { createBrowserRouter } from "react-router";
import MainLayout from "../layouts/MainLayout";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import NotFoundPage from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      // Layout das rotas autenticadas: o <PrivateRoute> protege o layout
      // inteiro de uma vez (Header/Footer entram junto com a guarda).
      {
        element: (
          <PrivateRoute>
            <AuthenticatedLayout />
          </PrivateRoute>
        ),
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/account', element: <AccountPage /> },
          { path: '/recipe/new', element: <CreateRecipePage /> },
        ],
      },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/recipe/:id', element: <RecipeDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);