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
import { Loader2, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, isLoading } = useAuth() // Get login function and loading state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("") // Clear previous errors

    if (!username || !password) {
      setError("Please enter both username and password")
      return
    }

    try {
      await login(username, password)
      // AuthProvider handles redirection on success
    } catch (err: any) {
        // Handle errors returned from the API Client / AuthProvider
         let errorMessage = "Login failed. Please check credentials."; // Default
         if (err.response && err.response.data) {
             const errorData = err.response.data;
             if (errorData.detail) {
                 errorMessage = errorData.detail;
             } else if (typeof errorData === 'object') {
                // Handle potential validation errors (though less likely for login)
                errorMessage = Object.entries(errorData).map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`).join('; ');
             }
         } else if (err.message && !err.message.includes('status 401')) { // Don't show generic message for 401
             errorMessage = err.message;
         }
        setError(errorMessage);
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-8 relative">
      {/* Cyberpunk Grid Background - Kept as is */}
      <div className="absolute inset-0 cyber-grid opacity-10"></div>

      <Card className="w-full max-w-md bg-gray-900/70 backdrop-blur-md border-gray-800 card-3d"> {/* Style kept */}
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-white">Login</CardTitle>
          <CardDescription className="text-gray-400">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-900/50 border-red-800 text-red-300"> {/* Style kept */}
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                disabled={isLoading} // Disable input while loading
                className="bg-gray-800 border-gray-700 text-white focus:border-purple-500 focus:ring-purple-500" // Style kept
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                {/* Forgot password link kept */}
                <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={isLoading} // Disable input while loading
                className="bg-gray-800 border-gray-700 text-white focus:border-purple-500 focus:ring-purple-500" // Style kept
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 btn-animated" // Style kept
              disabled={isLoading} // Disable button while loading
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium"> {/* Style kept */}
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}