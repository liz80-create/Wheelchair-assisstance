"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider" // Import useAuth
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, AlertCircle } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password2: "",
    user_type: "seeker", // Default to seeker
  })
  const [error, setError] = useState("")
  const { register, isLoading } = useAuth() // Get register function and loading state

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUserTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, user_type: value }))
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("") // Clear previous error

    // Basic validation (keep existing)
    if (
      !formData.username ||
      !formData.email ||
      !formData.first_name ||
      !formData.last_name ||
      !formData.password ||
      !formData.password2
    ) {
      setError("All fields are required")
      return
    }

    if (formData.password !== formData.password2) {
      setError("Passwords do not match")
      return
    }

    // Password validation (optional but good) - you could add client-side checks too
     if (formData.password.length < 8) {
         setError("Password must be at least 8 characters long");
         return;
     }

    try {
      // Pass the whole formData, AuthProvider extracts required fields
      await register(formData)
      // AuthProvider handles redirection after successful registration and login
    } catch (err: any) {
       // Handle errors returned from the API Client / AuthProvider
       let errorMessage = "Registration failed. Please try again.";
        if (err.response && err.response.data) {
            const errors = err.response.data;
            // Combine validation errors into a single string
             const messages = Object.entries(errors)
               // Ensure messages is an array before joining
               .map(([field, fieldMessages]) => `${field}: ${Array.isArray(fieldMessages) ? fieldMessages.join(', ') : fieldMessages}`)
               .join(' | ');
            if (messages) errorMessage = messages;
            else if (errors.detail) errorMessage = errors.detail; // Handle non_field_errors etc.
        } else if (err.message) {
            errorMessage = err.message;
        }
        setError(errorMessage);
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-8">
      <Card className="w-full max-w-md"> {/* Style kept */}
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive"> {/* Style kept */}
                <AlertCircle className="h-4 w-4" />
                {/* Split errors for better readability if needed */}
                <AlertDescription>{error.split('|').map((e, i) => <div key={i}>{e.trim()}</div>)}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  type="text"
                  placeholder="John"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  type="text"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password (min 8 chars)"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password2">Confirm Password</Label>
              <Input
                id="password2"
                name="password2"
                type="password"
                placeholder="Confirm your password"
                value={formData.password2}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>I am a:</Label>
              <RadioGroup
                value={formData.user_type}
                onValueChange={handleUserTypeChange} // Use the specific handler
                className="flex flex-col space-y-1"
                disabled={isLoading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="seeker" id="seeker" disabled={isLoading}/>
                  <Label htmlFor="seeker" className="font-normal">
                    Person looking for accessible places
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="provider" id="provider" disabled={isLoading}/>
                  <Label htmlFor="provider" className="font-normal">
                    Business owner or place provider
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-green-600 hover:text-green-700 font-medium"> {/* Style kept */}
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}