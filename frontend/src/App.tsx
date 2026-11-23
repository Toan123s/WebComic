import LatestComicsPage from './pages/latest/LatestComicsPage';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ComicDetailPage from './pages/comic/ComicDetailPage';
import ReaderPage from './pages/reader/ReaderPage';
import ReadingHistoryPage from './pages/history/ReadingHistoryPage';
import ProfilePage from './pages/profile/ProfilePage';
function App() {
  const path = window.location.pathname;

  if (path === '/register') {
    return <RegisterPage />;
  }

  if (path === '/login') {
    return <LoginPage />;
  }

  if (path === '/history') {
    return <ReadingHistoryPage />;
  }

  if (path === '/comic/the-last-crimson-moon/chapter-25') {
    return <ReaderPage />;
  }

  if (path === '/comic/the-last-crimson-moon') {
    return <ComicDetailPage />;
  }
  if (path === '/latest') {
    return <LatestComicsPage />;
  }
  if (path === '/profile') {
    return <ProfilePage />;
  }

  return <HomePage />;
}

export default App;
