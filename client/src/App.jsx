import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Breads, { BreadDetail } from './pages/Breads';
import Restaurants from './pages/Restaurants';
import RecipeLab from './pages/RecipeLab';
import MenuStudio from './pages/MenuStudio';
import OurStory from './pages/OurStory';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="breads" element={<Breads />} />
        <Route path="breads/:slug" element={<BreadDetail />} />
        <Route path="restaurants" element={<Restaurants />} />
        <Route path="recipe-lab" element={<RecipeLab />} />
        <Route path="menu-studio" element={<MenuStudio />} />
        <Route path="our-story" element={<OurStory />} />
      </Route>
    </Routes>
  );
}
