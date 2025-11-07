import WebLandingPage from '@/components/web-landing-page';

export default function WebIndexPage() {
  // Always show the landing page/dashboard first for web
  // Users can navigate to authenticated pages (chat, prediction, profile) from the navbar
  return <WebLandingPage />;
}
