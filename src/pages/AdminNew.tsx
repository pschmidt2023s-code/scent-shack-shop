import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';
import { SalesAnalytics } from '@/components/admin/SalesAnalytics';
import { LoyaltySettings } from '@/components/admin/LoyaltySettings';
import { BundleManagement } from '@/components/admin/BundleManagement';
import { AutoReorderManagement } from '@/components/admin/AutoReorderManagement';
import { StockNotificationManagement } from '@/components/admin/StockNotificationManagement';
import { PerformanceMetrics } from '@/components/admin/PerformanceMetrics';
import { ReferralManagement } from '@/components/admin/ReferralManagement';
import { VideoManagement } from '@/components/admin/VideoManagement';
import { lazy, Suspense } from 'react';
import { TabContentLoader } from '@/components/LoadingStates';

const ProductManagement = lazy(() => import('@/components/admin/ProductManagement'));
const CouponManagement = lazy(() => import('@/components/admin/CouponManagement'));
const UserManagement = lazy(() => import('@/components/admin/UserManagement'));
const ReturnManagement = lazy(() => import('@/components/admin/ReturnManagement'));
const PartnerManagement = lazy(() => import('@/components/admin/PartnerManagement'));
const NewsletterManagement = lazy(() => import('@/components/admin/NewsletterManagement'));
const PaybackManagement = lazy(() => import('@/components/admin/PaybackManagement'));
const AdminChatInterface = lazy(() => import('@/components/admin/AdminChatInterface'));
const ContestManagement = lazy(() =>
  import('@/components/admin/ContestManagement').then((module) => ({
    default: module.ContestManagement,
  }))
);

const CustomerSegmentation = lazy(() =>
  import('@/components/admin/CustomerSegmentation').then((module) => ({
    default: module.CustomerSegmentation,
  }))
);
const MarketingCampaigns = lazy(() =>
  import('@/components/admin/MarketingCampaigns').then((module) => ({
    default: module.MarketingCampaigns,
  }))
);
const PredictiveInventory = lazy(() =>
  import('@/components/admin/PredictiveInventory').then((module) => ({
    default: module.PredictiveInventory,
  }))
);

export default function AdminNew() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AdminDashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <SalesAnalytics />
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <PerformanceMetrics />
        </TabsContent>

        {/* Products */}
        <TabsContent value="products" className="space-y-6">
          <Suspense fallback={<TabContentLoader />}>
            <ProductManagement />
          </Suspense>
        </TabsContent>

        {/* Bundles */}
        <TabsContent value="bundles" className="space-y-6">
          <BundleManagement />
        </TabsContent>

        {/* Coupons */}
        <TabsContent value="coupons" className="space-y-6">
          <Suspense fallback={<TabContentLoader />}>
            <CouponManagement />
          </Suspense>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="space-y-6">
          <Suspense fallback={<TabContentLoader />}>
            <UserManagement />
          </Suspense>
        </TabsContent>

        {/* Loyalty */}
        <TabsContent value="loyalty" className="space-y-6">
          <LoyaltySettings />
        </TabsContent>

        {/* Referral */}
        <TabsContent value="referral" className="space-y-6">
          <ReferralManagement />
        </TabsContent>

        {/* Newsletter */}
        <TabsContent value="newsletter" className="space-y-6">
          <Suspense fallback={<TabContentLoader />}>
            <NewsletterManagement />
          </Suspense>
        </TabsContent>

        {/* Contest */}
        <TabsContent value="contest" className="space-y-6">
          <Suspense fallback={<TabContentLoader />}>
            <ContestManagement />
          </Suspense>
        </TabsContent>

        {/* Chat */}
        <TabsContent value="chat" className="space-y-6">
          <Suspense fallback={<TabContentLoader />}>
            <AdminChatInterface />
          </Suspense>
        </TabsContent>

        {/* Returns */}
        <TabsContent value="returns" className="space-y-6">
          <Suspense fallback={<TabContentLoader />}>
            <ReturnManagement />
          </Suspense>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <StockNotificationManagement />
        </TabsContent>

        {/* Partners */}
        <TabsContent value="partners" className="space-y-6">
          <Suspense fallback={<TabContentLoader />}>
            <PartnerManagement />
          </Suspense>
        </TabsContent>

        {/* Payback */}
        <TabsContent value="payback" className="space-y-6">
          <Suspense fallback={<TabContentLoader />}>
            <PaybackManagement />
          </Suspense>
        </TabsContent>

        {/* Auto-Reorder */}
        <TabsContent value="auto-reorder" className="space-y-6">
          <AutoReorderManagement />
        </TabsContent>

        {/* Orders (legacy) */}
        <TabsContent value="orders" className="space-y-6">
          <SalesAnalytics />
        </TabsContent>

        {/* Segmentation */}
        <TabsContent value="segmentation" className="space-y-6">
          <Suspense fallback={<TabContentLoader />}>
            <CustomerSegmentation />
          </Suspense>
        </TabsContent>

        {/* Campaigns */}
        <TabsContent value="campaigns" className="space-y-6">
          <Suspense fallback={<TabContentLoader />}>
            <MarketingCampaigns />
          </Suspense>
        </TabsContent>

        {/* Predictive Inventory */}
        <TabsContent value="predictive" className="space-y-6">
          <Suspense fallback={<TabContentLoader />}>
            <PredictiveInventory />
          </Suspense>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6">
          <VideoManagement />
        </TabsContent>
      </Tabs>
    </AdminDashboardLayout>
  );
}
