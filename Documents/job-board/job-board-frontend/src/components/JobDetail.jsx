import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookmarkCheck } from "lucide-react";
import { Link } from 'react-router-dom';
import { RiStarFill } from 'react-icons/ri';

const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Tech Corp",
    location: "Remote",
    type: "Full-time",
    description: "We are looking for a skilled Frontend Developer to join our team!",
  },
  {
    id: 2,
    title: "Backend Engineer",
    company: "InnovateX",
    location: "Jakarta, Indonesia",
    type: "Part-time",
    description: "InnovateX is hiring a Backend Engineer with Node.js experience.",
  },
  {
    id: 3,
    title: "UI/UX Designer",
    company: "Creative Hub",
    location: "Bali, Indonesia",
    type: "Contract",
    description: "Join our team as a UI/UX Designer and work on exciting projects!",
  },
];

const companies = [
  {
    name: "Tech Corp",
    reviews: [
      { user: "John", rating: 5, comment: "Great company!" },
      { user: "Alice", rating: 4, comment: "Good environment" },
    ],
  },
  {
    name: "InnovateX",
    reviews: [
      { user: "Mike", rating: 3, comment: "Okay company" },
      { user: "Sarah", rating: 4, comment: "Enjoyed working here" },
    ],
  },
  {
    name: "Creative Hub",
    reviews: [
      { user: "Paul", rating: 5, comment: "Fantastic place to work!" },
    ],
  },
];

export default function JobDetail() {
  const { id } = useParams();
  const job = jobs.find((job) => job.id === parseInt(id));
  const company = companies.find((c) => c.name === job?.company);
  const [searchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(false); // Track if job is applied
  const [notification, setNotification] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get("apply") === "true") {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  // Load saved jobs from localStorage
  useEffect(() => {
    const storedJobs = JSON.parse(localStorage.getItem("savedJobs")) || [];
    setSavedJobs(storedJobs);
    setIsSaved(storedJobs.some((saved) => saved.id === job?.id));

    // Check if job is already applied
    const appliedJobs = JSON.parse(localStorage.getItem("appliedJobs")) || [];
    setIsApplied(appliedJobs.some((applied) => applied.id === job?.id));
  }, [job]);

  const saveJob = () => {
    let updatedJobs = [...savedJobs];

    if (isSaved) {
      updatedJobs = savedJobs.filter((saved) => saved.id !== job.id);
      setNotification({ message: "Job removed from saved jobs.", type: "error" });
      setIsSaved(false); // Remove from saved jobs
    } else {
      updatedJobs.push(job);
      setNotification({ message: "Job saved successfully!", type: "success" });
      setIsSaved(true);
    }

    setSavedJobs(updatedJobs);
    localStorage.setItem("savedJobs", JSON.stringify(updatedJobs));

    // Hide notification after 2 seconds
    setTimeout(() => setNotification({ message: "", type: "" }), 2000);
  };

  const applyJob = () => {
    const appliedJobs = JSON.parse(localStorage.getItem("appliedJobs")) || [];

    // Check if the job is already applied
    const isJobAlreadyApplied = appliedJobs.some((appliedJob) => appliedJob.id === job.id);

    if (isJobAlreadyApplied) {
      // If job already applied, show error notification and redirect to jobs page
      setNotification({ message: "You have already applied for this job!", type: "error" });

      // Hide notification after 2 seconds
      setTimeout(() => setNotification({ message: "", type: "" }), 2000);

      // Redirect to the jobs list after 2 seconds
      setTimeout(() => navigate("/jobs"), 2000);
      return; // Stop further execution if job is already applied
    }

    // Add dateApplied for job being applied
    const jobWithDate = {
      ...job,
      dateApplied: new Date().toLocaleDateString(),
    };

    appliedJobs.push(jobWithDate);

    // Update localStorage with applied jobs
    localStorage.setItem("appliedJobs", JSON.stringify(appliedJobs));

    // Update applied state
    setIsApplied(true);

    setNotification({ message: "You have successfully applied for this job!", type: "success" });

    // Hide notification after 2 seconds
    setTimeout(() => setNotification({ message: "", type: "" }), 2000);
  };

  // Pastikan job ditemukan sebelum mencari company
  if (!job) return <p className="text-center text-gray-500">Job not found.</p>;

  // Pastikan company ditemukan sebelum melanjutkan
  if (!company) return <p className="text-center text-gray-500">Company not found.</p>;

  // Calculate average rating from reviews
  const averageRating = company.reviews.reduce((acc, review) => acc + review.rating, 0) / company.reviews.length;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      {/* Job Title & Bookmark */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">{job.title}</h1>
        {isSaved && (
          <button onClick={saveJob} className="text-green-500">
            <BookmarkCheck size={24} />
          </button>
        )}
      </div>

      {/* Company Name - Wrapped in Link to CompanyDetail Page */}
      <p className="text-gray-700">
        <Link to={`/company/${job.company}`} className="text-blue-600 hover:underline">
          {job.company}
        </Link>
      </p>

      {/* Company Rating and Reviews Section */}
      <div className="mt-6 bg-gray-100 p-4 rounded-lg">
        <h3 className="text-xl font-semibold">Company Rating & Reviews</h3>
        <div className="flex items-center text-yellow-500">
          {/* Rating Stars */}
          {[...Array(Math.round(averageRating))].map((_, index) => (
            <RiStarFill key={index} size={20} />
          ))}
        </div>
        <p className="text-gray-500 mt-2">{company.reviews.length} reviews</p>

        {/* Show first few reviews */}
        <div className="mt-4">
          <h4 className="font-semibold">What people are saying:</h4>
          {company.reviews.slice(0, 3).map((review, index) => (
            <div key={index} className="border-b py-2">
              <p className="text-sm font-semibold">{review.user}</p>
              <div className="flex items-center text-yellow-500">
                {[...Array(review.rating)].map((_, i) => (
                  <RiStarFill key={i} size={16} />
                ))}
              </div>
              <p className="text-gray-600 text-sm">{review.comment}</p>
            </div>
          ))}
          {company.reviews.length > 3 && (
            <p className="text-blue-600 cursor-pointer mt-2">See all reviews</p>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-500">{job.location} • {job.type}</p>
      <p className="mt-4">{job.description}</p>

      {/* Notification */}
      {notification.message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`mt-4 px-4 py-2 rounded ${
            notification.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {notification.message}
        </motion.div>
      )}

      {/* Apply & Save Job Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Apply Now
        </button>

        {!isSaved && !isApplied && (
          <button
            onClick={saveJob}
            className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400 transition"
          >
            Save Job
          </button>
        )}

        {/* Disable Apply Now button if already applied */}
        {isApplied && (
          <button
            disabled
            className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
          >
            Already Applied
          </button>
        )}
      </div>

      {/* Apply Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          onClick={() => setIsModalOpen(false)} // Close modal on outside click
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-lg shadow-lg w-96"
            onClick={(e) => e.stopPropagation()} // Prevent modal close on click inside
          >
            <h2 className="text-xl font-bold text-center mb-4">Apply for {job.title}</h2>
            <p className="text-center mb-4">{job.description}</p>
            <button
              onClick={applyJob}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-700"
            >
              Apply Now
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
