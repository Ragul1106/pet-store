
import React from "react";
import { AiFillStar } from "react-icons/ai";
import { FaFacebookF, FaTwitter, FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { FiUser } from "react-icons/fi";

const sampleReviews = [
  {
    id: "r1",
    name: "Ajith Kumar Ak",
    date: "31/01/2025",
    rating: 5,
    text: "Very very good\nVery very good experience doctors\nConsolation",
    likes: 0,
    dislikes: 0,
  },
  {
    id: "r2",
    name: "p.",
    date: "24/06/2024",
    rating: 5,
    text: "The doctors are knowledgeable, compassionate,\n take the time to listen to my concerns.",
    likes: 0,
    dislikes: 0,
  },
  {
    id: "r3",
    name: "p.",
    date: "24/06/2024",
    rating: 5,
    text: "The doctors are knowledgeable,\nand really take the time to listen to my concerns.",
    likes: 0,
    dislikes: 0,
  },
  {
    id: "r4",
    name: "Prem Singh",
    date: "12/04/2024",
    rating: 5,
    text: "Talking to the doctor, was like talking to a well wisher, very good at diagnosing the issue.",
    likes: 0,
    dislikes: 0,
  },
  {
    id: "r5",
    name: "priya",
    date: "31/05/2024",
    rating: 5,
    text: "fine\ngood doctor",
    likes: 0,
    dislikes: 0,
  },
  {
    id: "r6",
    name: "Aby Varghese",
    date: "05/06/2024",
    rating: 5,
    text: "Very Friendly\nWas able to find issue very quickly",
    likes: 0,
    dislikes: 0,
  },
];

export default function CustomerReviews({ reviews = sampleReviews }) {
  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-lg font-medium mb-4">Customer Reviews</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="bg-white border rounded-md shadow-sm overflow-hidden"
              aria-labelledby={`rev-${r.id}-title`}
            >
              <div className="p-3 bg-gray-100">
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0">
      <div className="w-9 h-9 rounded-full bg-white border flex items-center justify-center text-gray-600">
        {/* avatar */}
        <FiUser className="w-5 h-5" />
      </div>
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex flex-col">
        <p id={`rev-${r.id}-title`} className="text-sm font-semibold text-gray-800 leading-tight">
          {r.name}
        </p>
        <p className="text-xs text-gray-500">{r.date}</p>

        {/* Rating stars in a row but placed below */}
        <div className="flex items-center gap-0.5 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <AiFillStar
              key={i}
              className={`w-4 h-4 ${i < (r.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}
              aria-hidden="true"
            />
          ))}
        </div>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line mt-2">
                  {r.text}
                </p>

      </div>
    </div>
  </div>
</div>


              <div className="py-2 px-6 bg-gray-100">
                

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700 flex items-center gap-2 text-xs"
                      aria-label="share to facebook"
                    >
                      <FaFacebookF />
                    </button>
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700 flex items-center gap-2 text-xs"
                      aria-label="share to twitter"
                    >
                      <FaTwitter />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <FaThumbsUp className="w-4 h-4 text-gray-600" />
                      <span className="text-xs">{r.likes ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <FaThumbsDown className="w-4 h-4 text-gray-600" />
                      <span className="text-xs">{r.dislikes ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
