'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, User, Mail, Calendar, Shield, Save, Edit } from 'lucide-react';
import Link from 'next/link';
import { UserProfile } from '@/types';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const { user, getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Profile data is managed by ProtectedRoute and AuthContext

  useEffect(() => {
    if (user) {
      // Use the user data from auth context instead of fetching
      setProfile(user);
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setLoading(false);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (formData.new_password && formData.new_password !== formData.confirm_password) {
      toast({
        title: 'Password Mismatch',
        description: 'New password and confirmation do not match',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const updateData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
      };

      if (formData.new_password) {
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }

      // For now, just simulate the update since the backend endpoint needs to be created
      toast({
        title: 'Feature Coming Soon',
        description:
          'Profile update functionality will be available soon. Your changes have been noted.',
        variant: 'default',
      });
      setEditing(false);
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: '',
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Unknown';

    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Unknown';
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600">Manage your account information and preferences</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Profile Overview */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-12 w-12 text-white" />
                    </div>
                    <CardTitle className="text-xl">
                      {profile.first_name || profile.last_name
                        ? `${profile.first_name} ${profile.last_name}`.trim()
                        : profile.username}
                    </CardTitle>
                    <CardDescription className="flex items-center justify-center gap-2">
                      <Mail className="h-4 w-4" />
                      {profile.email}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(profile.date_joined)}</span>
                    </div>
                    {(profile.is_staff || profile.is_superuser) && (
                      <div className="flex items-center gap-2 text-sm text-purple-600">
                        <Shield className="h-4 w-4" />
                        <span>{profile.is_superuser ? 'Super Admin' : 'Staff Member'}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Profile Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>
                        Update your personal information and account settings
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setEditing(!editing)}
                      disabled={saving}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {editing ? 'Cancel' : 'Edit'}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                          id="first_name"
                          value={formData.first_name}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, first_name: e.target.value }))
                          }
                          disabled={!editing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          value={formData.last_name}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, last_name: e.target.value }))
                          }
                          disabled={!editing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!editing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={profile.username}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">Username cannot be changed</p>
                    </div>

                    {editing && (
                      <>
                        <hr className="my-6" />
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Change Password</h3>
                          <p className="text-sm text-gray-600">
                            Leave blank to keep current password
                          </p>

                          <div className="space-y-2">
                            <Label htmlFor="current_password">Current Password</Label>
                            <Input
                              id="current_password"
                              type="password"
                              value={formData.current_password}
                              onChange={e =>
                                setFormData(prev => ({ ...prev, current_password: e.target.value }))
                              }
                              placeholder="Enter current password"
                            />
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="new_password">New Password</Label>
                              <Input
                                id="new_password"
                                type="password"
                                value={formData.new_password}
                                onChange={e =>
                                  setFormData(prev => ({ ...prev, new_password: e.target.value }))
                                }
                                placeholder="Enter new password"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirm_password">Confirm Password</Label>
                              <Input
                                id="confirm_password"
                                type="password"
                                value={formData.confirm_password}
                                onChange={e =>
                                  setFormData(prev => ({
                                    ...prev,
                                    confirm_password: e.target.value,
                                  }))
                                }
                                placeholder="Confirm new password"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {editing && (
                      <div className="flex justify-end">
                        <Button onClick={handleUpdateProfile} disabled={saving}>
                          <Save className="mr-2 h-4 w-4" />
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
