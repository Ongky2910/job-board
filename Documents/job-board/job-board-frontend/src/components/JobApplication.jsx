import { useState } from "react";
import { useUser } from "../context/UserContext"; // Pastikan import useUser dari context

export default function ApplyJobModal({ job, isOpen, onClose }) {
  const { user, setUser } = useUser(); // Ambil user dari context untuk memperbarui data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resume, setResume] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Applying for job:", job); // Log job data
    console.log("User data:", { name, email, resume }); // Log input data
  
    // Menambahkan pekerjaan yang diajukan ke daftar pekerjaan yang dilamar
    addAppliedJob(job); // Menggunakan fungsi addAppliedJob dari context untuk menambah pekerjaan yang dilamar
  
    setSuccessMessage("Application submitted successfully!");
    setTimeout(() => {
      setSuccessMessage("");
      onClose();
    }, 2000);
  };
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Apply for {job.title}</h2>
        {successMessage ? (
          <p className="text-green-600">{successMessage}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Your Name"
              className="border p-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              className="border p-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="file"
              className="border p-2 rounded"
              onChange={(e) => setResume(e.target.files[0])}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Submit Application
            </button>
          </form>
        )}
        <button
          onClick={onClose}
          className="mt-4 text-red-600 hover:underline"
        >
          Close
        </button>
      </div>
    </div>
  );
}
