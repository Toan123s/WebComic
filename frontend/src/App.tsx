import LatestComicsPage from './pages/latest/LatestComicsPage';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ComicDetailPage from './pages/comic/ComicDetailPage';
import ReaderPage from './pages/reader/ReaderPage';
import ReadingHistoryPage from './pages/history/ReadingHistoryPage';
import ProfilePage from './pages/profile/ProfilePage';
import AIStudioPage from './pages/creator/AIStudioPage';
import ComicsManagementPage from './pages/creator/ComicsManagementPage';
import CreatorProfilePage from './pages/profile/CreatorProfilePage';
import CreatorDashboardPage from './pages/creator/CreatorDashboardPage';
import ChapterManagementPage from './pages/creator/ChapterManagementPage';


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
  if (path === '/studio/ai-assistant') {
    return <AIStudioPage />;
  }
  if (path === '/studio') {
    return <CreatorDashboardPage />;
  }
  if (path === '/studio/comics') {
    return <ComicsManagementPage />;
  }
  if (path === '/studio/chapters') {
    return <ChapterManagementPage />;
  }
  if (path === '/studio/profile') return <CreatorProfilePage />;
  return <HomePage />;
}

export default App;
