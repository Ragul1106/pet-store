import React from "react";
import { Link } from "react-router-dom";

function buildImageUrl(imgPath) {
  if (!imgPath) return null;

  // already absolute
  if (/^https?:\/\//i.test(imgPath)) return imgPath;

  // starts with slash -> treat as relative to backend origin
  if (imgPath.startsWith("/")) {
    const apiBase = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api/").replace(/\/api\/?$/, "");
    return `${apiBase}${imgPath}`;
  }

  // relative path (e.g. "mega_menu_brands/foo.jpg") -> assume under /media/
  const apiBase = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api/").replace(/\/api\/?$/, "");
  return `${apiBase}/media/${imgPath}`;
}

export default function MegaMenu({ menu = null, sections = [], activeKey, centerX = null, narrowKeys = [] }) {
  const sectionsData = menu?.sections || sections || [];
  const isNarrow = narrowKeys.includes(activeKey);

  // ---------- SHOP BY BRAND (FULL-WIDTH GRID OF LOGOS) ----------
  if (activeKey === "shop-by-brand") {
    const brands = menu?.brands || [];

    return (
      <div className="w-full bg-white border-t py-6" role="region" aria-label="Shop by Brand menu">
        <div className="mx-auto px-2">
          {/* <h3 className="text-base font-semibold text-gray-800 mb-4">Shop by Brand</h3> */}

          {brands.length ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 items-center">
              {brands.map((b, i) => {
                const imgUrl = buildImageUrl(b.image);
                return (
                  <div key={i} className="flex items-center justify-center p-4">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={b.name}
                        className="h-32 w-auto object-contain" // taller logos, width auto
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-xs text-gray-500">{b.name}</div>
                    )}
                  </div>


                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-6">No brands available</div>
          )}
        </div>
      </div>
    );
  }

  // ---------- SHOP BY BREED (LEFT IMAGE, TWO LISTS, RIGHT IMAGE) ----------
  if (activeKey === "shop-by-breed") {
    const dogSection = sectionsData.find((s) => /dog/i.test(s.title || "")) || sectionsData[0];
    const catSection = sectionsData.find((s) => /cat/i.test(s.title || "")) || sectionsData[1] || sectionsData[0];

    const leftImageUrl = buildImageUrl(menu?.left_image);
    const rightImageUrl = buildImageUrl(menu?.right_image);

    return (
      <div className="w-full bg-white border-t py-6" role="region" aria-label="Shop by Breed menu">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-6">
            {/* Left image (hidden on small screens) */}
            <div className="hidden lg:flex lg:w-56 lg:shrink-0 items-center justify-center">
              {leftImageUrl ? (
                <img
                  src={leftImageUrl}
                  alt={menu?.title ? `${menu.title} dog` : "Dog"}
                  className="w-56 max-h-64 object-contain"
                  loading="lazy"
                />
              ) : null}
            </div>

            {/* Middle breed lists */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                {dogSection?.title && (
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    {dogSection.path ? (
                      <Link to={dogSection.path} className="hover:underline">
                        {dogSection.title}
                      </Link>
                    ) : (
                      dogSection.title
                    )}
                  </h3>
                )}
                <ul className="text-sm text-gray-600 space-y-1">
                  {Array.isArray(dogSection?.categories) ? dogSection.categories.map((c, i) => <li key={i}>{c}</li>) : null}
                </ul>
              </div>

              <div>
                {catSection?.title && (
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    {catSection.path ? (
                      <Link to={catSection.path} className="hover:underline">
                        {catSection.title}
                      </Link>
                    ) : (
                      catSection.title
                    )}
                  </h3>
                )}
                <ul className="text-sm text-gray-600 space-y-1">
                  {Array.isArray(catSection?.categories) ? catSection.categories.map((c, i) => <li key={i}>{c}</li>) : null}
                </ul>
              </div>
            </div>

            {/* Right image (hidden on small screens) */}
            <div className="hidden lg:flex lg:w-56 lg:shrink-0 items-center justify-center">
              {rightImageUrl ? (
                <img
                  src={rightImageUrl}
                  alt={menu?.title ? `${menu.title} cat` : "Cat"}
                  className="w-56 max-h-64 object-contain"
                  loading="lazy"
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- NARROW menus (small-pets, pet-service, etc.) ----------
  if (isNarrow) {
    const narrowWidthClass = activeKey === "pet-service" ? "max-w-2xl" : "max-w-md";
    const innerGridForNarrow = activeKey === "pet-service" ? "grid grid-cols-1 sm:grid-cols-2 gap-6" : "grid grid-cols-1 gap-3";

    return (
      <div className="w-full bg-white border-t py-6" role="region" aria-label={`${activeKey} menu`}>
        <div className="relative">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative min-h-[1px]">
              <div
                style={{
                  position: "absolute",
                  top: -25, // slightly lifted into the nav row
                  left: centerX != null ? `${centerX}px` : "50%",
                  transform: "translateX(-50%)",
                  zIndex: 40,
                }}
                className={`w-full sm:w-auto ${narrowWidthClass}`}
              >
                <div className="bg-white shadow-md border rounded-md px-6 py-4 mx-auto">
                  <div className={innerGridForNarrow + " text-center"}>
                    {sectionsData.map((sec, idx) => (
                      <div key={idx} className="mb-2">
                        {sec.title && (
                          <h3 className="text-sm font-semibold text-gray-800 mb-2">
                            {sec.path ? <Link to={sec.path} className="hover:underline">{sec.title}</Link> : <span>{sec.title}</span>}
                          </h3>
                        )}

                        {Array.isArray(sec.categories) && sec.categories.length ? (
                          <ul className="text-xs text-gray-600 space-y-1">
                            {sec.categories.map((cat, i) => <li key={i}>{cat}</li>)}
                          </ul>
                        ) : (
                          <div className="text-xs text-gray-400">No items</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* reserve vertical space so subsequent content doesn't jump */}
              <div style={{ height: activeKey === "pet-service" ? 220 : 140 }} aria-hidden />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- DEFAULT full-width mega menu ----------
  return (
    <div className="w-full bg-white shadow-md border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {sectionsData.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              {sec.title && (
                <h3 className="text-sm md:text-base font-semibold text-gray-800">
                  {sec.path ? <Link to={sec.path} className="hover:underline">{sec.title}</Link> : <span>{sec.title}</span>}
                </h3>
              )}
              {Array.isArray(sec.categories) && sec.categories.length ? (
                <ul className="text-xs md:text-sm text-gray-600 space-y-1">
                  {sec.categories.map((cat, i) => <li key={i} className="whitespace-nowrap">{cat}</li>)}
                </ul>
              ) : (
                <div className="text-xs text-gray-400">No items</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
