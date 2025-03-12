import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../redux/slices/userSlice";
import { Eye, EyeOff, Trash, Upload } from "lucide-react";

const EditProfile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.user);

  const [userData, setUserData] = useState({
    profilePicture: "",
    username: user?.username || "",
    email: user?.email || "",
    oldPassword: "",
    newPassword: "",
    contact: user?.contact || "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateInput = (name, value) => {
    let error = "";
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) error = "Invalid email format!";
    }
    if (name === "oldPassword" || name === "newPassword") {
      if (value.length < 6) error = "Password must be at least 6 characters!";
    }
    if (name === "contact") {
      const phoneRegex = /^[0-9]{10,}$/;
      if (!phoneRegex.test(value)) error = "Invalid phone number!";
    }
    setErrors((prev) => ({ ...prev, [name]: error }));

    if (name === "newPassword" && value === userData.oldPassword) {
      error = "New password cannot be the same as old password!";
    }
  };

  const [previewImage, setPreviewImage] = useState(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData((prev) => ({ ...prev, profilePicture: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(userData).forEach((key) => {
      formData.append(key, userData[key]);
    });
    dispatch(updateProfile(formData));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateInput(name, value);
  };

  const isFormValid =
    Object.values(errors).every((error) => error === "") &&
    Object.values(userData).every((field) => field !== "");

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
        Edit Profile
      </h2>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {loading && <p className="text-gray-500 text-center">Updating...</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        {/* Foto Profil */}
        <div className="flex flex-col items-center gap-3">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Preview"
              className="w-24 h-24 rounded-full object-cover shadow-md"
            />
          ) : (
            <div className="w-24 h-24 flex items-center justify-center bg-gray-200 rounded-full shadow-md">
              <span className="text-gray-500 text-sm">No Image</span>
            </div>
          )}

          <label
            htmlFor="avatar"
            className="flex items-center gap-2 border border-blue-600 text-blue-600 px-4 py-2 rounded-md cursor-pointer hover:bg-blue-600 hover:text-white transition"
          >
            <Upload size={18} />
            Upload Avatar
          </label>
          <input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {userData.profilePicture && (
            <button
              onClick={() => {
                setUserData((prev) => ({ ...prev, profilePicture: "" }));
                setPreviewImage(null);
              }}
              className=" text-red-500 hover:bg-red-100 p-2 rounded-full"
            >
              <Trash size={20} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block font-medium text-gray-900">Username</label>
            <input
              type="text"
              name="username"
              value={userData.username}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full"
              placeholder="New Username"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium text-gray-900">Email</label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full"
              placeholder="New Email"
              onBlur={handleBlur}
            />
            {touched.email && errors.email && (
              <p className="text-red-500">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Old Password */}
          <div className="relative min-h-[65px]">
            <label className="block font-medium text-gray-900">
              Old Password
            </label>
            <input
              type={showOldPassword ? "text" : "password"}
              name="oldPassword"
              value={userData.oldPassword}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full pr-10 dark:text-slate-950"
              onBlur={handleBlur}
            />
            {touched.oldPassword && errors.oldPassword && (
              <p className="text-red-500 text-sm absolute left-0 top-full whitespace-nowrap">
                {errors.oldPassword}
              </p>
            )}
            <button
              type="button"
              className="absolute inset-y-0 right-3 top-5 flex items-center dark:bg-transparent text-gray-700"
              onClick={() => setShowOldPassword(!showOldPassword)}
              onBlur={handleBlur}
            >
              {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <label className="block font-medium text-gray-900">
              New Password
            </label>
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              value={userData.newPassword}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full pr-10 dark:text-slate-950"
              onBlur={handleBlur}
            />
            {touched.newPassword && errors.newPassword && (
              <p className="text-red-500 text-sm absolute left-0 top-full whitespace-nowrap">
                {errors.newPassword}
              </p>
            )}
            <button
              type="button"
              className="absolute inset-y-0 right-3 top-5 flex items-center dark:bg-transparent text-gray-700"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Kontak */}
        <div>
          <label className="block font-medium mt-5 text-gray-900">
            {" "}
            Add+ Contact
          </label>
          <input
            type="text"
            name="contact"
            value={userData.contact}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
            placeholder="Enter your phone number"
            onBlur={handleBlur}
          />
          {touched.contact && errors.contact && (
            <p className="text-red-500">{errors.contact}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`bg-blue-600 text-white px-4 py-2 rounded ${
            !isFormValid ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!isFormValid}
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
