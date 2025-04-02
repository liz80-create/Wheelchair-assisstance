// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaList, FaStar, FaArrowRight, FaWheelchair } from 'react-icons/fa';

const HomePage = () => {
  return (
    <div className="text-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <header className="mb-16 animate-fade-in-down">
          <h1 className="text-4xl md:text-6xl font-bold text-brand-blue mb-4 mt-8">
            Welcome to <span className="text-brand-green">AccessiWheels</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Discover restaurants, cafes, shops, and venues with the accessibility features you need. 
            Verified by the community, for the community.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/places"
              className="inline-block bg-brand-green hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 shadow-md hover:shadow-lg"
            >
              Explore Places
            </Link>
            <Link
              to="/register"
              className="inline-block bg-brand-blue hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 shadow-md hover:shadow-lg"
            >
              Join Now
            </Link>
          </div>
        </header>

        <section className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
          {/* Feature Box 1 */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow transform hover:-translate-y-1 duration-300">
            <div className="bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <FaSearch className="text-3xl text-brand-green" />
            </div>
            <h2 className="text-xl font-semibold mb-3">Find Accessible Places</h2>
            <p className="text-gray-600">
              Easily search for locations based on specific accessibility requirements like ramps, accessible restrooms, and more.
            </p>
          </div>
          {/* Feature Box 2 */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow transform hover:-translate-y-1 duration-300">
            <div className="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <FaList className="text-3xl text-brand-blue" />
            </div>
            <h2 className="text-xl font-semibold mb-3">Detailed Information</h2>
            <p className="text-gray-600">
              Get comprehensive details provided by businesses and verified through user reviews and ratings.
            </p>
          </div>
          {/* Feature Box 3 */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow transform hover:-translate-y-1 duration-300">
            <div className="bg-yellow-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <FaStar className="text-3xl text-yellow-500" />
            </div>
            <h2 className="text-xl font-semibold mb-3">Community Verified</h2>
            <p className="text-gray-600">
              Read real reviews from wheelchair users and contribute your own experiences to help others.
            </p>
          </div>
        </section>

        <section className="bg-brand-blue bg-opacity-10 p-8 rounded-2xl mb-16">
          <h2 className="text-3xl font-bold text-brand-blue mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-brand-blue border-2 border-brand-blue mb-4">1</div>
              <h3 className="text-lg font-semibold mb-2">Create an Account</h3>
              <p className="text-gray-600 text-center">Sign up as an accessibility seeker or a place owner</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-brand-blue border-2 border-brand-blue mb-4">2</div>
              <h3 className="text-lg font-semibold mb-2">Set Your Needs</h3>
              <p className="text-gray-600 text-center">Tell us which accessibility features matter most to you</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-brand-blue border-2 border-brand-blue mb-4">3</div>
              <h3 className="text-lg font-semibold mb-2">Get Recommendations</h3>
              <p className="text-gray-600 text-center">Discover places that match your specific requirements</p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 md:pr-8 mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-brand-blue mb-3">Are You a Business Owner?</h2>
              <p className="text-gray-600 mb-4">
                Register your venue on AccessiWheels to showcase your accessibility features and reach more customers who need them.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center text-brand-blue hover:text-blue-700 font-semibold"
              >
                List Your Business <FaArrowRight className="ml-2" />
              </Link>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="rounded-full bg-blue-100 p-6">
                <FaWheelchair className="text-6xl text-brand-blue" />
              </div>
            </div>
          </div>
        </section>

        <footer className="text-sm text-gray-600 mt-16">
          <p>&copy; {new Date().getFullYear()} AccessiWheels. Making the world more accessible, one place at a time.</p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;