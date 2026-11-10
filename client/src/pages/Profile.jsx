import { useEffect, useRef, useState } from "react";
import {
  User,
  Mail,
  Phone,
  CalendarDays,
  Ruler,
  Weight,
  Target,
  Lock,
  Save,
  ShieldCheck,
  UserRound,
  Activity,
  AlertCircle,
  CheckCircle2,
  Camera,
  Upload,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Profile = () => {
  const { user, updateProfile, changePassword, uploadProfilePicture } =
    useAuth();

  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    bio: "",
    height: "",
    currentWeight: "",
    targetWeight: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  const [imageMessage, setImageMessage] = useState({
    type: "",
    text: "",
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileMessage, setProfileMessage] = useState({
    type: "",
    text: "",
  });

  const [passwordMessage, setPasswordMessage] = useState({
    type: "",
    text: "",
  });

  // Populate profile information
  useEffect(() => {
    if (!user) return;

    setProfileData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      dateOfBirth: user.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().slice(0, 10)
        : "",
      gender: user.gender || "",
      bio: user.bio || "",
      height: user.profile?.height ?? "",
      currentWeight: user.profile?.currentWeight ?? "",
      targetWeight: user.profile?.targetWeight ?? "",
    });
  }, [user]);

  // Create and clean up image preview URL
  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);

    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  // Get initials
  const getInitials = () => {
    if (!user?.name) return "U";

    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // Get server image URL
  const getProfileImageUrl = () => {
    if (!user?.profilePicture) return "";

    if (user.profilePicture.startsWith("http")) {
      return user.profilePicture;
    }

    const baseURL = api.defaults.baseURL || "http://localhost:5000/api";

    const serverURL = baseURL.replace(/\/api\/?$/, "");

    return `${serverURL}${user.profilePicture}`;
  };

  // Handle profile picture selection
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageMessage({ type: "", text: "" });

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setImageMessage({
        type: "error",
        text: "Only JPG, PNG and WEBP images are allowed.",
      });

      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setImageMessage({
        type: "error",
        text: "Image size must not exceed 2 MB.",
      });

      e.target.value = "";
      return;
    }

    setImageFile(file);
    setImageMessage({
      type: "",
      text: "",
    });
  };

  // Upload profile picture
  const handleImageUpload = async () => {
    if (!imageFile) {
      setImageMessage({
        type: "error",
        text: "Please select an image first.",
      });
      return;
    }

    setUploadLoading(true);
    setImageMessage({ type: "", text: "" });

    try {
      await uploadProfilePicture(imageFile);

      setImageFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setImageMessage({
        type: "success",
        text: "Profile picture updated successfully.",
      });
    } catch (error) {
      setImageMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to upload profile picture. Please try again.",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // Cancel selected image
  const handleRemoveSelectedImage = () => {
    setImageFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setImageMessage({
      type: "",
      text: "",
    });
  };

  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    setProfileLoading(true);
    setProfileMessage({ type: "", text: "" });

    try {
      const payload = {
        ...profileData,
        height: profileData.height === "" ? null : Number(profileData.height),
        currentWeight:
          profileData.currentWeight === ""
            ? null
            : Number(profileData.currentWeight),
        targetWeight:
          profileData.targetWeight === ""
            ? null
            : Number(profileData.targetWeight),
        dateOfBirth: profileData.dateOfBirth || null,
      };

      await updateProfile(payload);

      setProfileMessage({
        type: "success",
        text: "Your profile has been updated successfully.",
      });
    } catch (error) {
      setProfileMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to update your profile. Please try again.",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // Change password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setPasswordMessage({ type: "", text: "" });

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "Your new password must contain at least 8 characters.",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "New password and confirm password do not match.",
      });
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordMessage({
        type: "success",
        text: "Your password has been changed successfully.",
      });
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to change your password. Please try again.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const inputClass = "gt-input w-full";
  const labelClass = "gt-label mb-2 block";
  const sectionClass = "gt-card p-5 sm:p-7";

  // Reusable success/error message
  const renderMessage = (message) => {
    if (!message.text) return null;

    const isSuccess = message.type === "success";

    return (
      <div
        className={`mb-5 flex items-start gap-3 rounded-xl border p-3 text-sm ${
          isSuccess
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
            : "border-red-500/30 bg-red-500/10 text-red-500"
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
        ) : (
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
        )}

        <span>{message.text}</span>
      </div>
    );
  };

  const displayedImage = previewUrl || getProfileImageUrl();

  return (
    <div className="gt-page min-h-screen">
      <div className="gt-container space-y-7">
        {/* Page Header */}
        <div>
          <h1 className="gt-page-title">Profile Settings</h1>

          <p className="gt-description mt-2">
            Manage your personal information, fitness details and account
            security.
          </p>
        </div>

        {/* Profile Overview */}
        <section className="gt-card flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-7">
          {/* Profile Picture */}
          <div className="relative w-fit shrink-0">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-500/30 bg-emerald-500/15 text-2xl font-bold text-emerald-500">
              {displayedImage ? (
                <img
                  src={displayedImage}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials()
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLoading}
              className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--gt-surface)] bg-emerald-600 text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-50"
              title="Change profile picture"
            >
              <Camera size={16} />
            </button>
          </div>

          {/* User Information */}
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-[var(--gt-text-primary)]">
              {user?.name || "GymTrack User"}
            </h2>

            <p className="mt-1 text-sm text-[var(--gt-text-secondary)]">
              {user?.email}
            </p>

            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-500">
              <ShieldCheck size={15} />
              Account Information
            </div>
          </div>

          {/* Upload Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLoading}
              className="gt-button-secondary flex items-center gap-2"
            >
              <Camera size={16} />
              Choose Photo
            </button>

            {imageFile && (
              <>
                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={uploadLoading}
                  className="gt-button-primary flex items-center gap-2"
                >
                  <Upload size={16} />
                  {uploadLoading ? "Uploading..." : "Upload"}
                </button>

                <button
                  type="button"
                  onClick={handleRemoveSelectedImage}
                  disabled={uploadLoading}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--gt-border)] text-[var(--gt-text-secondary)] transition hover:border-red-500 hover:text-red-500 disabled:opacity-50"
                  title="Cancel selected image"
                >
                  <X size={17} />
                </button>
              </>
            )}
          </div>
        </section>

        {/* Image Upload Information */}
        {renderMessage(imageMessage)}

        {imageFile && (
          <p className="-mt-5 text-xs text-[var(--gt-text-muted)]">
            Selected: {imageFile.name} (
            {(imageFile.size / (1024 * 1024)).toFixed(2)} MB)
          </p>
        )}

        {/* Personal and Fitness Information */}
        <form onSubmit={handleProfileSubmit} className="space-y-7">
          {/* Personal Information */}
          <section className={sectionClass}>
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
                <UserRound size={21} />
              </div>

              <div>
                <h2 className="gt-section-title">Personal Information</h2>
                <p className="gt-description mt-1">
                  Update your basic account information.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Full Name</label>

                <div className="relative">
                  <User
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gt-text-muted)]"
                  />

                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className={`${inputClass} gt-input-icon`}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Email Address</label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gt-text-muted)]"
                  />

                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className={`${inputClass} gt-input-icon`}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Phone Number</label>

                <div className="relative">
                  <Phone
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gt-text-muted)]"
                  />

                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className={`${inputClass} gt-input-icon`}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Date of Birth</label>

                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gt-text-muted)]"
                  />

                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profileData.dateOfBirth}
                    onChange={handleProfileChange}
                    className={`${inputClass} gt-input-icon`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Gender</label>

                <select
                  name="gender"
                  value={profileData.gender}
                  onChange={handleProfileChange}
                  className={inputClass}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Bio</label>

                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  className={`${inputClass} min-h-24 resize-y`}
                  placeholder="Write a short introduction about yourself..."
                  maxLength={250}
                />

                <p className="mt-1 text-right text-xs text-[var(--gt-text-muted)]">
                  {profileData.bio.length}/250 characters
                </p>
              </div>
            </div>
          </section>

          {/* Fitness Information */}
          <section className={sectionClass}>
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
                <Activity size={21} />
              </div>

              <div>
                <h2 className="gt-section-title">Fitness Information</h2>
                <p className="gt-description mt-1">
                  Keep your body measurements and fitness goals updated.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <label className={labelClass}>Height (cm)</label>

                <div className="relative">
                  <Ruler
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gt-text-muted)]"
                  />

                  <input
                    type="number"
                    name="height"
                    value={profileData.height}
                    onChange={handleProfileChange}
                    className={`${inputClass} gt-input-icon`}
                    placeholder="e.g. 180"
                    min="1"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Current Weight (kg)</label>

                <div className="relative">
                  <Weight
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gt-text-muted)]"
                  />

                  <input
                    type="number"
                    name="currentWeight"
                    value={profileData.currentWeight}
                    onChange={handleProfileChange}
                    className={`${inputClass} gt-input-icon`}
                    placeholder="e.g. 60"
                    min="1"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Target Weight (kg)</label>

                <div className="relative">
                  <Target
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gt-text-muted)]"
                  />

                  <input
                    type="number"
                    name="targetWeight"
                    value={profileData.targetWeight}
                    onChange={handleProfileChange}
                    className={`${inputClass} gt-input-icon`}
                    placeholder="e.g. 70"
                    min="1"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          </section>

          {renderMessage(profileMessage)}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profileLoading}
              className="gt-button-primary flex items-center justify-center gap-2"
            >
              <Save size={17} />
              {profileLoading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>

        {/* Change Password */}
        <section className={sectionClass}>
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
              <Lock size={21} />
            </div>

            <div>
              <h2 className="gt-section-title">Change Password</h2>
              <p className="gt-description mt-1">
                Update your password to keep your account secure.
              </p>
            </div>
          </div>

          {renderMessage(passwordMessage)}

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass}>Current Password</label>

                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={inputClass}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>New Password</label>

                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={inputClass}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Confirm New Password</label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={inputClass}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="gt-button-secondary flex items-center justify-center gap-2"
              >
                <Lock size={17} />
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Profile;
