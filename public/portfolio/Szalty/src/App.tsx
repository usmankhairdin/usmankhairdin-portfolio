
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Index from "./pages/Index";
import Discover from "./pages/Discover";
import Post from "./pages/Post";
import PostDetail from "./pages/PostDetail";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Achievements from "./pages/Achievements";
import Settings from "./pages/Settings";
import NotificationsSettings from "./pages/settings/Notifications";
import PrivacySettings from "./pages/settings/Privacy";
import AccountSettings from "./pages/settings/Account";
import UnitsSettings from "./pages/settings/Units";
import ConnectedAppsSettings from "./pages/settings/ConnectedApps";
import AppearanceSettings from "./pages/settings/Appearance";
import BillingSettings from "./pages/settings/Billing";
import SecuritySettings from "./pages/settings/Security";
import HelpSettings from "./pages/settings/Help";
import AboutSettings from "./pages/settings/About";
import PremiumAnalytics from "./pages/PremiumAnalytics";
import PostLikes from "./pages/PostLikes";
import PostComments from "./pages/PostComments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter 
        basename="/portfolio/szalty_app"
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/post" element={<Post />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/premium-analytics" element={<PremiumAnalytics />} />
            <Route path="/post/:id/likes" element={<PostLikes />} />
            <Route path="/post/:id/comments" element={<PostComments />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/notifications" element={<NotificationsSettings />} />
            <Route path="/settings/privacy" element={<PrivacySettings />} />
            <Route path="/settings/account" element={<AccountSettings />} />
            <Route path="/settings/units" element={<UnitsSettings />} />
            <Route path="/settings/connected-apps" element={<ConnectedAppsSettings />} />
            <Route path="/settings/appearance" element={<AppearanceSettings />} />
            <Route path="/settings/billing" element={<BillingSettings />} />
            <Route path="/settings/security" element={<SecuritySettings />} />
            <Route path="/settings/help" element={<HelpSettings />} />
            <Route path="/settings/about" element={<AboutSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
