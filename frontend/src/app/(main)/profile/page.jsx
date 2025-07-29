'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import apiClient from '../../../lib/apiClient';
import UserProfileForm from '../../../components/profile/UserProfileForm';
import DriverApplicationForm from '../../../components/profile/DriverApplicationForm';
import DocumentUploadForm from '../../../components/profile/DocumentUploadForm';
import DocumentsList from '../../../components/profile/DocumentsList';
import Spinner from '../../../components/ui/Spinner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import DriverLocationSimulator from '../../../components/drivers/DriverLocationSimulator';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [driverProfile, setDriverProfile] = useState(null);
  const [isLoadingDriverProfile, setIsLoadingDriverProfile] = useState(true);
  const [refreshDocumentsTrigger, setRefreshDocumentsTrigger] = useState(0); // To trigger re-fetch

  const fetchDriverProfile = useCallback(async () => {
    if (!user) return; // No user, no driver profile
    setIsLoadingDriverProfile(true);
    try {
      const response = await apiClient.get('/drivers/profile');
      setDriverProfile(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setDriverProfile(null); // User is not a driver or application not found
      } else {
        console.error('Failed to fetch driver profile:', error);
        // Optionally set an error state to display to user
      }
    } finally {
      setIsLoadingDriverProfile(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) { // Ensure auth state is resolved before fetching driver profile
        fetchDriverProfile();
    }
  }, [authLoading, fetchDriverProfile]);

  const handleApplicationSuccess = () => {
    // After successful application, refetch driver profile (it might now exist with 'pending_approval' status)
    fetchDriverProfile();
  };

  const handleUploadSuccess = () => {
    setRefreshDocumentsTrigger(prev => prev + 1); // Increment to trigger useEffect in DocumentsList
  };

  if (authLoading || isLoadingDriverProfile) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spinner size="lg" />
      </div>
    );
  }

  const isDriver = driverProfile && (driverProfile.driver_status === 'approved' || driverProfile.driver_status === 'pending_approval' || driverProfile.driver_status === 'pending_documents');
  // Consider 'pending_approval' also a state where they can upload documents or see their status.

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">پروفایل کاربری و مدیریت رانندگی</h1>
      </div>

      {/* User Profile Information */}
      <UserProfileForm />

      {/* Driver Section */}
      <div id="driver-section" className="pt-4"> {/* Added pt-4 for scroll-to-top spacing */}
        <Card>
          <CardHeader>
            <CardTitle>بخش رانندگان</CardTitle>
            <CardDescription>
              {isDriver
                ? `وضعیت رانندگی شما: ${driverProfile?.driver_status_fa || driverProfile?.driver_status || 'نامشخص'}`
                : 'در صورت تمایل می‌توانید به عنوان راننده به ما بپیوندید.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!driverProfile && !isLoadingDriverProfile && (
              <DriverApplicationForm onApplicationSuccess={handleApplicationSuccess} />
            )}

            {driverProfile && ( // Show this section if driver profile exists (applied, pending, or approved)
              <div className="space-y-6">
                {/* Display driver specific info if needed, like vehicle details */}
                {driverProfile.vehicle_details && (
                    <div className="p-4 border rounded-md bg-gray-50">
                        <h4 className="font-semibold text-lg mb-2">اطلاعات خودرو:</h4>
                        <p>مدل: {driverProfile.vehicle_details.model || '-'}</p>
                        <p>پلاک: {driverProfile.vehicle_details.plate_number || '-'}</p>
                    </div>
                )}
                <DocumentUploadForm onUploadSuccess={handleUploadSuccess} />
                <DocumentsList refreshTrigger={refreshDocumentsTrigger} />

                {/* Location Simulator for Testing */}
                <div className="mt-6">
                  <DriverLocationSimulator />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
