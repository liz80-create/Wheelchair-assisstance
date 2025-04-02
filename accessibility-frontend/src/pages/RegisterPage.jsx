// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Alert from '../components/Alert'; // Assuming Alert component exists

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        password2: '',
        user_type: 'seeker', // Default to seeker
    });
    const [error, setError] = useState(null); // Can be an object { field: message, form: message }
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    // Helper to display field-specific errors
    const fieldError = (fieldName) => error?.[fieldName] ? <p className="text-red-500 text-xs mt-1">{error[fieldName]}</p> : null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        setSuccess('');
        setIsLoading(true);

        // Frontend check for match is still useful for immediate feedback
        if (formData.password !== formData.password2) {
            setError({ password2: "Passwords do not match." }); // Set error directly for password2 field
            setIsLoading(false);
            return;
        }

        // Send the ENTIRE formData, including password2, to the backend.
        // The backend serializer needs password2 for its own validation.

        try {
            // Pass the full formData object to the register function in AuthContext
            await register(formData);

            setSuccess('Registration successful! Redirecting to login...');
            // Clear form fields on success maybe? Or just redirect.
            setFormData({ // Optional: Clear form
                username: '', email: '', first_name: '', last_name: '',
                password: '', password2: '', user_type: 'seeker',
            });
             setTimeout(() => {
                 navigate('/login');
             }, 2000); // Redirect after 2 seconds

        } catch (err) {
            // Handle specific errors from backend if available
            if (err.response?.data && typeof err.response.data === 'object') {
                 const backendErrors = err.response.data;
                 console.log("DEBUG: Backend validation errors received:", JSON.stringify(backendErrors)); // Keep for debugging
                 let errorMessages = {};
                 for (const field in backendErrors) {
                    // Ensure the value is an array before joining (DRF usually returns arrays for field errors)
                    if (Array.isArray(backendErrors[field])) {
                        errorMessages[field] = backendErrors[field].join(' ');
                    } else {
                        // If not an array (e.g., 'detail' field or non_field_errors), convert to string
                         errorMessages[field] = String(backendErrors[field]);
                    }
                 }

                 // Specifically map backend's password match error (if any) to password2 field for display
                 // Check if the error message associated with 'password2' or 'non_field_errors' indicates a mismatch
                 const mismatchError = "Password fields didn't match."; // Or whatever the backend sends
                 if(errorMessages.password2 === mismatchError || errorMessages.non_field_errors === mismatchError) {
                    errorMessages.password2 = mismatchError; // Ensure it's on password2
                    delete errorMessages.non_field_errors; // Clean up generic one if present
                 }

                 setError(errorMessages); // Set field-specific errors for display
             } else {
                // Handle generic errors (network, non-JSON 500 response, etc.)
                 setError({ form: 'Registration failed. An unexpected error occurred. Please check your network or try again later.' });
             }
            console.error("Registration submit error object:", err.response?.data || err);
        } finally {
            setIsLoading(false);
        }
    };


    // Reusable input field classes (adjust as needed)
    const inputFieldClasses = "appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue focus:z-10 sm:text-sm shadow-sm";

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full space-y-8 bg-white p-8 md:p-10 rounded-xl shadow-lg border border-gray-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your AccessiWheels account
                    </h2>
                </div>
                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    {/* Display generic form error if exists */}
                    {error?.form && <Alert message={error.form} type="error" />}
                    {success && <Alert message={success} type="success" />}

                    {/* User Type Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">I am registering as:</label>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="user_type"
                                    value="seeker"
                                    checked={formData.user_type === 'seeker'}
                                    onChange={handleChange}
                                    className="focus:ring-brand-blue h-4 w-4 text-brand-blue border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700">Accessibility Seeker</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="user_type"
                                    value="provider"
                                    checked={formData.user_type === 'provider'}
                                    onChange={handleChange}
                                    className="focus:ring-brand-blue h-4 w-4 text-brand-blue border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700">Place Owner / Manager</span>
                            </label>
                        </div>
                        {fieldError('user_type')} {/* Display potential user_type errors */}
                    </div>


                    {/* Form Fields Grid */}
                    <div className="rounded-md grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="sr-only">Username</label>
                            <input id="username" name="username" type="text" required placeholder="Username*" className={inputFieldClasses} value={formData.username} onChange={handleChange} />
                            {fieldError('username')}
                        </div>
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input id="email" name="email" type="email" autoComplete="email" required placeholder="Email Address*" className={inputFieldClasses} value={formData.email} onChange={handleChange} />
                            {fieldError('email')}
                        </div>
                        {/* First Name */}
                        <div>
                            <label htmlFor="first_name" className="sr-only">First Name</label>
                            <input id="first_name" name="first_name" type="text" required placeholder="First Name*" className={inputFieldClasses} value={formData.first_name} onChange={handleChange} />
                            {fieldError('first_name')}
                        </div>
                        {/* Last Name */}
                        <div>
                            <label htmlFor="last_name" className="sr-only">Last Name</label>
                            <input id="last_name" name="last_name" type="text" required placeholder="Last Name*" className={inputFieldClasses} value={formData.last_name} onChange={handleChange} />
                            {fieldError('last_name')}
                        </div>
                        {/* Password */}
                        <div>
                            <label htmlFor="password"className="sr-only">Password</label>
                            <input id="password" name="password" type="password" required placeholder="Password*" className={inputFieldClasses} value={formData.password} onChange={handleChange} />
                            {fieldError('password')}
                        </div>
                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="password2" className="sr-only">Confirm Password</label>
                            <input id="password2" name="password2" type="password" required placeholder="Confirm Password*" className={inputFieldClasses} value={formData.password2} onChange={handleChange} />
                            {fieldError('password2')} {/* Error specifically for mismatch or if backend sends one */}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Registering...' : 'Create Account'}
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center mt-4">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-brand-blue hover:text-blue-700">
                        Sign in
                        </Link>
                    </p>
                    </div>
            </div>
            {/* Ensure the <style jsx> block was removed from here */}
        </div>
    );
};

export default RegisterPage;