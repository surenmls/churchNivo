import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import ChurchAdminLayout from './layouts/ChurchAdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/public/HomePage';
import ChurchesPage from './pages/public/ChurchesPage';
import ChurchesMapPage from './pages/public/ChurchesMapPage';
import SearchPage from './pages/public/SearchPage';
import EventsPage from './pages/public/EventsPage';
import MediaPage from './pages/public/MediaPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage from './pages/public/LoginPage';
import MemberSubscribePage, { UnsubscribePage } from './pages/public/MemberSubscribePage';

import ChurchLayout, {
  ChurchHomePage,
  ChurchAboutPage,
  ChurchEventsPage,
  ChurchMediaPage,
  ChurchGalleryPage,
  ChurchGalleryAlbumPage,
  ChurchContactPage,
} from './pages/church/ChurchPages';
import ChurchBlogPage from './pages/church/ChurchBlogPage';

import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminChurchesPage from './pages/admin/AdminChurchesPage';
import AdminPromotionsPage from './pages/admin/AdminPromotionsPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';
import AdminGalleryPage from './pages/admin/AdminGalleryPage';
import AdminInboxPage from './pages/admin/AdminInboxPage';
import AdminChurchWizardPage from './pages/admin/AdminChurchWizardPage';

import ChurchAdminLoginPage from './pages/church-admin/ChurchAdminLoginPage';
import ChurchAdminDashboardPage from './pages/church-admin/ChurchAdminDashboardPage';
import ChurchAdminEventsPage from './pages/church-admin/ChurchAdminEventsPage';
import ChurchAdminMediaPage from './pages/church-admin/ChurchAdminMediaPage';
import ChurchAdminSettingsPage from './pages/church-admin/ChurchAdminSettingsPage';
import ChurchAdminPastorsPage from './pages/church-admin/ChurchAdminPastorsPage';
import ChurchAdminAnnouncementsPage from './pages/church-admin/ChurchAdminAnnouncementsPage';
import ChurchAdminGalleryPage from './pages/church-admin/ChurchAdminGalleryPage';
import ChurchAdminMembersPage from './pages/church-admin/ChurchAdminMembersPage';
import ChurchAdminNotificationsPage from './pages/church-admin/ChurchAdminNotificationsPage';
import ChurchAdminContactPage from './pages/church-admin/ChurchAdminContactPage';
import ChurchAdminBlogPage from './pages/church-admin/ChurchAdminBlogPage';
import ChurchAdminOnboardingPage from './pages/church-admin/ChurchAdminOnboardingPage';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="churches" element={<ChurchesPage />} />
        <Route path="churches/map" element={<ChurchesMapPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>

      {/* Church Routes */}
      <Route path="church/:slug" element={<ChurchLayout />}>
        <Route index element={<ChurchHomePage />} />
        <Route path="about" element={<ChurchAboutPage />} />
        <Route path="events" element={<ChurchEventsPage />} />
        <Route path="media" element={<ChurchMediaPage />} />
        <Route path="gallery" element={<ChurchGalleryPage />} />
        <Route path="gallery/:albumSlug" element={<ChurchGalleryAlbumPage />} />
        <Route path="blog" element={<ChurchBlogPage />} />
        <Route path="subscribe" element={<MemberSubscribePage />} />
        <Route path="contact" element={<ChurchContactPage />} />
      </Route>

      <Route path="unsubscribe/:token" element={<UnsubscribePage />} />

      {/* Admin Routes */}
      <Route path="admin/login" element={<AdminLoginPage />} />
      <Route
        element={
          <ProtectedRoute allowedRoles={['super_admin']} loginPath="/admin/login">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="admin/inbox" element={<AdminInboxPage />} />
        <Route path="admin/churches" element={<AdminChurchesPage />} />
        <Route path="admin/churches/new" element={<AdminChurchWizardPage />} />
        <Route path="admin/promotions" element={<AdminPromotionsPage />} />
        <Route path="admin/events" element={<AdminEventsPage />} />
        <Route path="admin/announcements" element={<AdminAnnouncementsPage />} />
        <Route path="admin/gallery" element={<AdminGalleryPage />} />
      </Route>

      {/* Church Admin Routes */}
      <Route path="church-admin/login" element={<ChurchAdminLoginPage />} />
      <Route
        path="church-admin/onboarding"
        element={
          <ProtectedRoute allowedRoles={['church_admin']} loginPath="/church-admin/login">
            <ChurchAdminOnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute allowedRoles={['church_admin']} loginPath="/church-admin/login">
            <ChurchAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="church-admin/dashboard" element={<ChurchAdminDashboardPage />} />
        <Route path="church-admin/events" element={<ChurchAdminEventsPage />} />
        <Route path="church-admin/media" element={<ChurchAdminMediaPage />} />
        <Route path="church-admin/pastors" element={<ChurchAdminPastorsPage />} />
        <Route path="church-admin/announcements" element={<ChurchAdminAnnouncementsPage />} />
        <Route path="church-admin/gallery" element={<ChurchAdminGalleryPage />} />
        <Route path="church-admin/blog" element={<ChurchAdminBlogPage />} />
        <Route path="church-admin/members" element={<ChurchAdminMembersPage />} />
        <Route path="church-admin/contact" element={<ChurchAdminContactPage />} />
        <Route path="church-admin/notifications" element={<ChurchAdminNotificationsPage />} />
        <Route path="church-admin/settings" element={<ChurchAdminSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
