import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ComicDetailPage from './pages/comic/ComicDetailPage';
import ReaderPage from './pages/reader/ReaderPage';

function App() {
  const path = window.location.pathname;

  if (path === '/register') {
    return <RegisterPage />;
  }

  if (path === '/login') {
    return <LoginPage />;
  }

  if (path === '/comic/the-last-crimson-moon/chapter-25') {
    return <ReaderPage />;
  }

  if (path === '/comic/the-last-crimson-moon') {
    return <ComicDetailPage />;
  }

  return <HomePage />;
}

export default App;