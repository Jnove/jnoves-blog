import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Post from './pages/Post';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminEditor from './pages/AdminEditor';
import AdminDashboard from './pages/AdminDashboard';
import AdminAbout from './pages/AdminAbout';
import Search from './pages/Search';
import Archive from './pages/Archive';
import About from './pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/post/:slug" element={<Post />} />
          <Route path="/search" element={<Search />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/editor" element={<AdminRoute><AdminEditor /></AdminRoute>} />
          <Route path="/admin/about" element={<AdminRoute><AdminAbout /></AdminRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}