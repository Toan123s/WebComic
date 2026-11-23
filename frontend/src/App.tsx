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
import RolePermissionsPage from './pages/admin/RolePermissionsPage';
import AdminComicsManagementPage from './pages/admin/AdminComicsManagementPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminGenresPage from './pages/admin/AdminGenresPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminModerationPage from './pages/admin/AdminModerationPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminStatisticsPage from './pages/admin/AdminStatisticsPage';
import AdminActivityLogPage from './pages/admin/AdminActivityLogPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
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
  if (path === '/admin') return <AdminDashboardPage />;
  if (path === '/admin/moderation') {
    return <AdminModerationPage />;
  }
  if (path === '/admin/settings') {
    return <AdminSettingsPage />;
  }
  if (path === '/admin/profile') {
    return <AdminProfilePage />;
  }
  if (path === '/admin/reports') return <AdminReportsPage />;
  if (path === '/admin/roles') {
    return <RolePermissionsPage />;
  }
  if (path === '/admin/comics') {
    return <AdminComicsManagementPage />;
  }
  if (path === '/admin/genres') {
    return <AdminGenresPage />;
  }
  if (path === '/admin/users') {
    return <AdminUsersPage />;
  }
  if (path === '/admin/activity-logs') {
    return <AdminActivityLogPage />;
  }
  if (path === '/admin/statistics') {
    return <AdminStatisticsPage />;
  }
  if (path === '/studio/profile') return <CreatorProfilePage />;
  return <HomePage />;
}

export default App;
