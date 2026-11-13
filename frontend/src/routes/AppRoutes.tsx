import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ReaderLayout } from '../layouts/ReaderLayout'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { BookmarksPage } from '../pages/reader/BookmarksPage'
import { ComicDetailPage } from '../pages/reader/ComicDetailPage'
import { FollowingPage } from '../pages/reader/FollowingPage'
import { HomePage } from '../pages/reader/HomePage'
import { ReadChapterPage } from '../pages/reader/ReadChapterPage'
import { ReaderProfilePage } from '../pages/reader/ReaderProfilePage'
import { ReadingHistoryPage } from '../pages/reader/ReadingHistoryPage'
import { SearchPage } from '../pages/reader/SearchPage'

function RequireReaderAccount() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  return isAuthenticated ? <Outlet /> : <Navigate replace state={{ from: location }} to="/login" />
}

function RouteTable() {
  return (
    <Routes>
      <Route element={<ReaderLayout />}>
        <Route element={<HomePage />} index />
        <Route element={<SearchPage />} path="search" />
        <Route element={<SearchPage />} path="updates" />
        <Route element={<ComicDetailPage />} path="comics/:comicId" />
        <Route element={<ReadChapterPage />} path="read/:chapterId" />
        <Route element={<FollowingPage />} path="reader/following" />
        <Route element={<RequireReaderAccount />}>
          <Route element={<BookmarksPage />} path="reader/bookmarks" />
          <Route element={<ReadingHistoryPage />} path="reader/history" />
          <Route element={<ReaderProfilePage />} path="reader/profile" />
        </Route>
        <Route element={<Navigate replace to="/" />} path="*" />
      </Route>
      <Route element={<LoginPage />} path="/login" />
      <Route element={<RegisterPage />} path="/register" />
    </Routes>
  )
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <RouteTable />
    </BrowserRouter>
  )
}
