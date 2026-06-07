import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Post from './pages/Post';
import AdminLogin from './pages/AdminLogin';
import AdminEditor from './pages/AdminEditor';
import Search from './pages/Search';
import About from './pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/post/:slug" element={<Post />} />
          <Route path="/search" element={<Search />} />
          <Route path="/about" element={<About />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/editor" element={<AdminEditor />} />
      </Routes>
    </BrowserRouter>
  );
}
