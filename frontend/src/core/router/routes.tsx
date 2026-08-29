import PrivateRoute from "@/features/auth/components/PrivateRoute";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import CreateRecipePage from "@/features/recipes/pages/CreateRecipePage";
import HomePage from "@/features/recipes/pages/HomePage";
import RecipeDetailPage from "@/features/recipes/pages/RecipeDetailPage";
import { createBrowserRouter } from "react-router";
import MainLayout from "../layouts/MainLayout";
import NotFoundPage from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: '/', element:
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
      },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        path: '/recipe',
        children: [
          {
            path: "new",
            element: (
              <PrivateRoute>
                <CreateRecipePage />
              </PrivateRoute>
            )
          },
          {
            path: ":id",
            element: <RecipeDetailPage />
          }
        ]
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);