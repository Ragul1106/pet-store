import React, { useEffect, useState } from "react";
import api from "../lib/api";

export default function CustomerReviews({ productId }) {
  // form states
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // stats + reviews
  const [counts, setCounts] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [reviews, setReviews] = useState([]); // full reviews array (sorted newest first)

  // pagination for review list
  const PAGE_SIZE = 5;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // fetch product detail and compute review stats + list
  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const res = await api.get(`/pet-product/${productId}/`);
        if (cancelled) return;
        const data = res.data || {};
        const reviewsArr = Array.isArray(data.reviews) ? data.reviews : [];

        // sort newest first by created (fallback to as-is if created missing)
        const sorted = reviewsArr.slice().sort((a, b) => {
          const ta = a.created ? new Date(a.created).getTime() : 0;
          const tb = b.created ? new Date(b.created).getTime() : 0;
          return tb - ta;
        });

        // compute counts
        const byStar = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        for (const r of sorted) {
          const s = Number(r.rating) || 0;
          if (s >= 1 && s <= 5) byStar[s] = (byStar[s] || 0) + 1;
        }
        const total = Object.values(byStar).reduce((a, b) => a + b, 0);

        // fallback: if serializer provided rating_count and reviews empty, use that
        if (total === 0 && typeof data.rating_count === "number" && data.rating_count > 0) {
          byStar[5] = data.rating_count;
        }

        setCounts(byStar);
        setTotalReviews(total || data.rating_count || 0);
        setReviews(sorted);
        setVisibleCount(PAGE_SIZE);
      } catch (err) {
        console.error("Failed to load product reviews for stats", err);
        setCounts({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
        setTotalReviews(0);
        setReviews([]);
      } finally {
        if (!cancelled) setLoadingStats(false);
      }
    };

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // basic validation
    if (!rating) {
      setMessage("Please select a rating.");
      return;
    }

    try {
      await api.post(`/pet-product/${productId}/reviews/`, {
        name,
        email,
        rating,
        review,
      });
      setMessage("Review submitted successfully!");
      setRating(0);
      setReview("");
      setName("");
      setEmail("");

      // optimistic refetch of reviews/stats
      api.get(`/pet-product/${productId}/`).then((res) => {
        const data = res.data || {};
        const reviewsArr = Array.isArray(data.reviews) ? data.reviews : [];
        const sorted = reviewsArr.slice().sort((a, b) => {
          const ta = a.created ? new Date(a.created).getTime() : 0;
          const tb = b.created ? new Date(b.created).getTime() : 0;
          return tb - ta;
        });
        // compute counts
        const byStar = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        for (const r of sorted) {
          const s = Number(r.rating) || 0;
          if (s >= 1 && s <= 5) byStar[s] = (byStar[s] || 0) + 1;
        }
        setCounts(byStar);
        setTotalReviews(Object.values(byStar).reduce((a, b) => a + b, 0) || data.rating_count || 0);
        setReviews(sorted);
        setVisibleCount(PAGE_SIZE);
      }).catch(() => { /* ignore */ });

    } catch (err) {
      console.error("Submit failed", err);
      setMessage("Failed to submit review");
    }
  };

  // helper: render N filled stars + empty stars
  const StarsRow = ({ count, size = "text-2xl" }) => (
    <div className="flex items-center gap-2" aria-hidden>
      {[...Array(count)].map((_, i) => (
        <span key={`f-${i}`} className={`${size} text-yellow-400`}>★</span>
      ))}
      {[...Array(5 - count)].map((_, i) => (
        <span key={`e-${i}`} className={`${size} text-gray-300`}>★</span>
      ))}
    </div>
  );

  const percentFor = (star) => {
    if (!totalReviews) return 0;
    return Math.round((counts[star] / totalReviews) * 100);
  };

  // format created date nicely
//   const formatDate = (iso) => {
//     try {
//       const d = new Date(iso);
//       // e.g. "Sep 26, 2025"
//       return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
//     } catch {
//       return iso || "";
//     }
//   };

  
//   const visibleReviews = reviews.slice(0, visibleCount);

  return (
    <div className="mt-12 bg-white border rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* LEFT: stats */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Customer Reviews</h2>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-2xl">★</span>
              ))}
            </div>
            <div className="text-gray-500 text-sm">
              {loadingStats ? "Loading..." : `${totalReviews} review${totalReviews !== 1 ? "s" : ""}`}
            </div>
          </div>

          {/* rows: 5 -> 1 */}
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-4 my-3">
              <div className="w-36">
                <StarsRow count={star} size="text-xl" />
              </div>

              <div className="flex-1 h-3 bg-gray-200 rounded overflow-hidden">
                <div
                  className="h-3 bg-yellow-400 rounded"
                  style={{ width: `${percentFor(star)}%` }}
                />
              </div>

              <div className="w-12 text-right text-sm text-gray-600">
                {loadingStats ? "—" : counts[star]}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: form */}
        <div>
          <h3 className="text-base font-semibold mb-3">Write a review</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Your Rating *</label>
              <div className="flex gap-2 items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="text-3xl focus:outline-none"
                    aria-label={`${star} stars`}
                  >
                    <span className={star <= (hover || rating) ? "text-yellow-400" : "text-gray-300"}>
                      ★
                    </span>
                  </button>
                ))}
                <div className="text-sm text-gray-500 ml-2">{rating ? `${rating} / 5` : ""}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Your Review *</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                required
                rows="4"
                className="w-full border rounded p-2 text-sm"
                placeholder="Share your experience..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Your Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border rounded p-2 text-sm"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Your Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border rounded p-2 text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <button
                type="submit"
                className="px-6 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                Submit
              </button>
            </div>

            {message && <p className="mt-2 text-sm text-green-600 font-medium">{message}</p>}
          </form>
        </div>
      </div>

      
      {/* <div className="mt-8 border-t" /> */}

      
      {/* <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">All reviews</h3>

        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500">There are no reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-6">
            {visibleReviews.map((r) => (
              <div key={r.id} className="bg-gray-50 rounded p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-sm">{r.name}</div>
                      <div className="text-xs text-gray-400">{formatDate(r.created)}</div>
                    </div>
                    <div className="mt-2 flex items-center gap-1" aria-hidden>
                      {[...Array(5)].map((_, i) => {
                        const s = i + 1;
                        return (
                          <span key={i} className={s <= (r.rating || 0) ? "text-yellow-400" : "text-gray-300"}>
                            ★
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  
                  <div className="text-sm text-gray-600 font-medium">{r.rating} / 5</div>
                </div>

                <div className="mt-3 text-sm text-gray-700 whitespace-pre-line">
                  {r.review || <span className="text-gray-400 italic">No review text</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        
        {visibleCount < reviews.length && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setVisibleCount((v) => Math.min(reviews.length, v + PAGE_SIZE))}
              className="px-4 py-2 rounded border text-sm bg-white hover:bg-gray-50"
            >
              Load more
            </button>
          </div>
        )}
      </div> */}
    </div>
  );
}
















// import React, { useState } from "react";
// import api from "../api";

// export default function CustomerReviews({ productId }) {
//   const [rating, setRating] = useState(0);
//   const [hover, setHover] = useState(0);
//   const [review, setReview] = useState("");
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [message, setMessage] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await api.post(`/pet-product/${productId}/reviews/`, {
//         name,
//         email,
//         rating,
//         review,
//       });
//       setMessage("Review submitted successfully!");
//       setRating(0);
//       setReview("");
//       setName("");
//       setEmail("");
//     } catch (err) {
//       console.error("Submit failed", err);
//       setMessage("Failed to submit review");
//     }
//   };

//   // helper: render a row showing N filled stars and (5-N) empty stars
//   // helper: render a row showing N filled stars and (5-N) empty stars
// const StarsRow = ({ count, size = "text-sm" }) => {
//   return (
//     <div className="flex items-center gap-2">
//       <div className="flex items-center" aria-hidden>
//         {[...Array(count)].map((_, i) => (
//           <span key={`f-${i}`} className={`${size} text-yellow-400`}>★</span>
//         ))}
//         {[...Array(5 - count)].map((_, i) => (
//           <span key={`e-${i}`} className={`${size} text-gray-300`}>★</span>
//         ))}
//       </div>
//     </div>
//   );
// };

//   return (
//     <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 bg-white border rounded-lg p-6">
//       {/* Left: Ratings summary */}
//       <div>
//         <h2 className="text-lg font-semibold mb-3">Customer Reviews</h2>

//         <div className="flex items-center gap-2 mb-2">
//           {[...Array(5)].map((_, i) => (
//             <span key={i} className="text-yellow-400 text-2xl">★</span>
//           ))}
//           <span className="text-gray-500 text-sm">0 reviews</span>
//         </div>

//         {/* rating rows: 5 -> 1 */}
//         {[5, 4, 3, 2, 1].map((star) => (
//           <div key={star} className="flex items-center gap-4 mt-3">
//             {/* stars display: e.g. ★★★★☆ */}
//             <div className="w-36">
//               <StarsRow count={star} size="text-2xl" />

//             </div>

//             {/* progress bar (currently placeholder width 0%) */}
//             <div className="flex-1 h-2 bg-gray-200 rounded">
//               <div
//                 className="h-2 bg-yellow-400 rounded"
//                 style={{ width: "0%" }} // wire this to real data later
//               />
//             </div>

//             {/* optional count / percent (kept subtle) */}
//             <div className="w-12 text-right text-sm text-gray-500">
//               0%
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Right: Form */}
//       <div>
//         <h2 className="text-base font-semibold mb-4">
//           Be the first to review this product
//         </h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Rating stars */}
//           <div>
//             <label className="block text-sm font-medium mb-1">Your Rating *</label>
//             <div className="flex gap-1">
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <button
//                   type="button"
//                   key={star}
//                   onClick={() => setRating(star)}
//                   onMouseEnter={() => setHover(star)}
//                   onMouseLeave={() => setHover(0)}
//                   className="text-2xl focus:outline-none"
//                 >
//                   <span
//                     className={
//                       star <= (hover || rating) ? "text-yellow-400" : "text-gray-300"
//                     }
//                   >
//                     ★
//                   </span>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Review */}
//           <div>
//             <label className="block text-sm font-medium mb-1">Your Review *</label>
//             <textarea
//               value={review}
//               onChange={(e) => setReview(e.target.value)}
//               required
//               rows="4"
//               className="w-full border rounded p-2 text-sm"
//             />
//           </div>

//           {/* Name */}
//           <div>
//             <label className="block text-sm font-medium mb-1">Your Name *</label>
//             <input
//               type="text"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//               className="w-full border rounded p-2 text-sm"
//             />
//           </div>

//           {/* Email */}
//           <div>
//             <label className="block text-sm font-medium mb-1">Your Email *</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className="w-full border rounded p-2 text-sm"
//             />
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             className="px-6 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
//           >
//             Submit
//           </button>
//         </form>

//         {message && (
//           <p className="mt-3 text-sm text-green-600 font-medium">{message}</p>
//         )}
//       </div>
//     </div>
//   );
// }
