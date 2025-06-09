import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useTheme } from "../lib/ThemeContext";
import { useAuth } from "../lib/AuthProvider";
import Layout from '../components/Layout';

const UserProfile = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for editable profile fields
  const [profileData, setProfileData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
  });

  // State for password change
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordChangeMessage, setPasswordChangeMessage] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authUser) {
        navigate("/login");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("first_name, middle_name, last_name")
          .eq("id", authUser.id)
          .single();

        if (error) throw error;

        setProfileData({
          firstName: data.first_name || "",
          middleName: data.middle_name || "",
          lastName: data.last_name || "",
        });
      } catch (error) {
        console.error("Error fetching user profile:", error.message);
        setError("Failed to load user profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate, authUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setPasswordChangeMessage("");

    try {
      const { error } = await supabase
        .from("users")
        .update({
          first_name: profileData.firstName,
          middle_name: profileData.middleName,
          last_name: profileData.lastName,
        })
        .eq("id", authUser?.id);

      if (error) throw error;
      setError("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error.message);
      setError("Error updating profile: " + error.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordChangeMessage("");
    setError("");

    const { newPassword, confirmNewPassword } = passwordData;

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeMessage("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordChangeMessage("Password must be at least 6 characters long.");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordChangeMessage("Password changed successfully!");
      setPasswordData({
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordChangeMessage("Error changing password: " + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/4"></div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className={`mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'}`}>
              <svg className={`w-8 h-8 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                User Profile
              </h2>
              <p className={`mt-2 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information Section */}
        <div className={`mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center space-x-3 mb-6">
            <svg className={`w-6 h-6 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Personal Information
            </h3>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="firstName" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md shadow-sm transition-colors duration-200 py-3 px-4 text-base ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500 hover:border-gray-500' 
                      : 'border-gray-300 focus:border-indigo-500 hover:border-gray-400'
                  } focus:ring-indigo-500`}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md shadow-sm transition-colors duration-200 py-3 px-4 text-base ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500 hover:border-gray-500' 
                      : 'border-gray-300 focus:border-indigo-500 hover:border-gray-400'
                  } focus:ring-indigo-500`}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="middleName" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Middle Name
                </label>
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  value={profileData.middleName}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md shadow-sm transition-colors duration-200 py-3 px-4 text-base ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500 hover:border-gray-500' 
                      : 'border-gray-300 focus:border-indigo-500 hover:border-gray-400'
                  } focus:ring-indigo-500`}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className={`inline-flex items-center px-6 py-3 text-base font-medium rounded-md shadow-sm transition-colors duration-200 ${
                  isDarkMode
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Password Change Section */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center space-x-3 mb-6">
            <svg className={`w-6 h-6 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Change Password
            </h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="newPassword" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`block w-full rounded-md shadow-sm transition-colors duration-200 py-3 px-4 text-base ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500 hover:border-gray-500' 
                      : 'border-gray-300 focus:border-indigo-500 hover:border-gray-400'
                  } focus:ring-indigo-500`}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmNewPassword" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordChange}
                  className={`block w-full rounded-md shadow-sm transition-colors duration-200 py-3 px-4 text-base ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500 hover:border-gray-500' 
                      : 'border-gray-300 focus:border-indigo-500 hover:border-gray-400'
                  } focus:ring-indigo-500`}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className={`inline-flex items-center px-6 py-3 text-base font-medium rounded-md shadow-sm transition-colors duration-200 ${
                  isDarkMode
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Change Password
              </button>
            </div>
          </form>
        </div>

        {/* Messages */}
        {error && (
          <div className={`mt-6 p-4 rounded-lg shadow-md transition-all duration-200 ${
            error.includes("successfully")
              ? isDarkMode
                ? 'bg-green-800 text-green-200 border border-green-700'
                : 'bg-green-50 text-green-800 border border-green-200'
              : isDarkMode
                ? 'bg-red-800 text-red-200 border border-red-700'
                : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center space-x-3">
              {error.includes("successfully") ? (
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}
        {passwordChangeMessage && (
          <div className={`mt-6 p-4 rounded-lg shadow-md transition-all duration-200 ${
            passwordChangeMessage.includes("successfully")
              ? isDarkMode
                ? 'bg-green-800 text-green-200 border border-green-700'
                : 'bg-green-50 text-green-800 border border-green-200'
              : isDarkMode
                ? 'bg-red-800 text-red-200 border border-red-700'
                : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center space-x-3">
              {passwordChangeMessage.includes("successfully") ? (
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="font-medium">{passwordChangeMessage}</span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserProfile;