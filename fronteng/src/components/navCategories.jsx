import { Link } from "react-router-dom";

export default function CategoryNavbar() {
  return (
    <div className="bg-blue-700 text-white px-6 py-2 flex gap-6 text-sm font-medium">
      <div className="group relative">
        <Link to="/dogs">Dog ▾</Link>
        <div className="absolute hidden group-hover:block bg-white text-black shadow-lg mt-2 rounded">
          <Link to="/dogs/food" className="block px-4 py-2 hover:bg-gray-100">Food</Link>
          <Link to="/dogs/toys" className="block px-4 py-2 hover:bg-gray-100">Toys</Link>
          <Link to="/dogs/training" className="block px-4 py-2 hover:bg-gray-100">Training</Link>
        </div>
      </div>

      <div className="group relative">
        <Link to="/cats">Cat ▾</Link>
        <div className="absolute hidden group-hover:block bg-white text-black shadow-lg mt-2 rounded">
          <Link to="/cats/food" className="block px-4 py-2 hover:bg-gray-100">Food</Link>
          <Link to="/cats/toys" className="block px-4 py-2 hover:bg-gray-100">Toys</Link>
        </div>
      </div>

      <div className="group relative">
        <Link to="/small-pets">Small pets ▾</Link>
        <div className="absolute hidden group-hover:block bg-white text-black shadow-lg mt-2 rounded">
          <Link to="/small-pets/hamsters" className="block px-4 py-2 hover:bg-gray-100">Hamsters</Link>
          <Link to="/small-pets/guinea-pigs" className="block px-4 py-2 hover:bg-gray-100">Guinea Pigs</Link>
        </div>
      </div>

      <Link to="/pet-services" className="hover:text-yellow-300">Pet Service ▾</Link>
      <Link to="/brands" className="hover:text-yellow-300">Shop by Brand ▾</Link>
      <Link to="/breeds" className="hover:text-yellow-300">Shop by Breed ▾</Link>
      <Link to="/consult-vet" className="hover:text-yellow-300">Consult a Vet</Link>
    </div>
  );
}
