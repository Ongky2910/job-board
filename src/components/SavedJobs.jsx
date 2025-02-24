import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    const storedJobs = JSON.parse(localStorage.getItem("savedJobs")) || [];
    setSavedJobs(storedJobs);
  }, []);

  const removeJob = (id) => {
    const updatedJobs = savedJobs.filter((job) => job.id !== id);
    setSavedJobs(updatedJobs);
    localStorage.setItem("savedJobs", JSON.stringify(updatedJobs));
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-xl">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Saved Jobs</h1>

      {savedJobs.length === 0 ? (
        <p className="text-gray-500 text-lg text-center">No saved jobs yet.</p>
      ) : (
        savedJobs.map((job) => (
          <div key={job.id} className="border-b p-4 rounded-lg shadow-md bg-gray-50 hover:bg-gray-100 transition">
            <div className="flex justify-between items-center">
              {/* Klik di bagian ini akan menuju ke JobDetail */}
              <Link to={`/job/${job.id}`} className="flex-1 cursor-pointer">
                <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition">
                  {job.title}
                </h2>
                <p className="text-gray-600">{job.company}</p>
                <p className="text-sm text-gray-500">{job.location} • {job.type}</p>
              </Link>

              {/* Tombol Apply Now */}
              <Link to={`/job/${job.id}?apply=true`}>
                <button className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition">
                  Apply Now
                </button>
              </Link>

              {/* Tombol Hapus */}
              <button
                onClick={() => removeJob(job.id)}
                className="text-red-500 hover:text-red-600 transition ml-3"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
