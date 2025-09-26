import React from "react";
import { Link } from "react-router-dom";

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav className="text-xl text-gray-600 my-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 sm:space-x-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center">
            {item.to ? (
              <Link
                to={item.to}
                className={`font-medium ${
                  idx === items.length - 1
                    ? "text-gray-500 cursor-default pointer-events-none"
                    : "text-black hover:font-bold"
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-500">{item.label}</span>
            )}
            {idx < items.length - 1 && (
              <span className="mx-2 text-gray-400">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
