import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../redux/userSlice";

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

  const [previewImage, setPreviewImage] = useState(null);

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
    formData.append("profilePicture", userData.profilePicture);
    formData.append("username", userData.username);
    formData.append("email", userData.email);
    formData.append("oldPassword", userData.oldPassword);
    formData.append("newPassword", userData.newPassword);
    formData.append("contact", userData.contact);

    dispatch(updateProfile(formData));
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

      {error && <p className="text-red-500">{error}</p>}
      {loading && <p className="text-gray-500">Updating...</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Foto Profil */}
        <div>
          <label className="block font-medium">Profile Picture</label>
          {previewImage && <img src={previewImage} alt="Preview" className="w-24 h-24 rounded-full my-2" />}
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        {/* Nama */}
        <div>
          <label className="block font-medium">Username</label>
          <input type="text" name="username" value={userData.username} onChange={handleChange} className="border w-full p-2 rounded" />
        </div>

        {/* Email */}
        <div>
          <label className="block font-medium">Email</label>
          <input type="email" name="email" value={userData.email} onChange={handleChange} className="border w-full p-2 rounded" />
        </div>

        {/* Password */}
        <div>
          <label className="block font-medium">Old Password</label>
          <input type="password" name="oldPassword" value={userData.oldPassword} onChange={handleChange} className="border w-full p-2 rounded" />
        </div>
        <div>
          <label className="block font-medium">New Password</label>
          <input type="password" name="newPassword" value={userData.newPassword} onChange={handleChange} className="border w-full p-2 rounded" />
        </div>

        {/* Kontak */}
        <div>
          <label className="block font-medium">Contact</label>
          <input type="text" name="contact" value={userData.contact} onChange={handleChange} className="border w-full p-2 rounded" />
        </div>

        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full" disabled={loading}>
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
