import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Star } from "lucide-react";

const companies = [
  {
    id: 1,
    name: "Tech Corp",
    description: "Tech Corp is a leading software company specializing in web development.",
    website: "https://techcorp.com",
    reviews: [
      { user: "John Doe", rating: 5, comment: "Great company to work with!" },
      { user: "Jane Smith", rating: 4, comment: "Good work culture." },
    ],
  },
  {
    id: 2,
    name: "InnovateX",
    description: "InnovateX is an AI-driven startup based in Jakarta.",
    website: "https://innovatex.com",
    reviews: [
      { user: "Alice Brown", rating: 4, comment: "Exciting projects!" },
    ],
  },
];

export default function CompanyDetail() {
    const { companyName } = useParams();
    const company = companies.find((c) => c.name.toLowerCase() === companyName.toLowerCase());     
  const [reviews, setReviews] = useState(company ? company.reviews : []);

  if (!company) return <p className="text-center text-gray-500">Company not found.</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-blue-600">{company.name}</h1>
      <p className="text-gray-700 mt-2">{company.description}</p>
      <a href={company.website} target="_blank" className="text-blue-500 underline mt-2 block">
        Visit Website
      </a>

      <h2 className="mt-6 text-2xl font-semibold">Reviews</h2>
      <div className="mt-2">
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          reviews.map((review, index) => (
            <div key={index} className="p-4 border-b">
              <p className="font-semibold">{review.user}</p>
              <div className="flex items-center text-yellow-500">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={16} />
                ))}
              </div>
              <p className="text-gray-600">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
