import { Route, Routes } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Restaurants } from './pages/Restaurants';
import { RestaurantDetails } from './pages/RestaurantDetails';
import { Breads } from './pages/Breads';
import { BreadDetails } from './pages/BreadDetails';
import { MenuStudio } from './pages/MenuStudio';
import { RecipeLab } from './pages/RecipeLab';
import { RecipeDetails } from './pages/RecipeDetails';
import { OurStory } from './pages/OurStory';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { Favorites } from './pages/Favorites';
import { AdminDashboard } from './pages/AdminDashboard';
import { Search } from './pages/Search';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="restaurants" element={<Restaurants />} />
        <Route path="restaurants/:slug" element={<RestaurantDetails />} />
        <Route path="breads" element={<Breads />} />
        <Route path="breads/:slug" element={<BreadDetails />} />
        <Route path="menu-studio" element={<MenuStudio />} />
        <Route path="recipe-lab" element={<RecipeLab />} />
        <Route path="recipes/:slug" element={<RecipeDetails />} />
        <Route path="our-story" element={<OurStory />} />
        <Route path="search" element={<Search />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
