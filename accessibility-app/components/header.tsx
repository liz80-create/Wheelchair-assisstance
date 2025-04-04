"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider"
import { MapPin, Menu, User, LogOut, Home, Search, Building, ChevronDown } from "lucide-react"

export default function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isActive = (path: string) => {
    return pathname === path
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-md border-b border-gray-800" : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-gray-900 border-gray-800">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                  onClick={() => setIsOpen(false)}
                >
                  <MapPin className="h-6 w-6 text-purple-400" />
                  <span className="font-bold">AccessPlace</span>
                </Link>
                <Link
                  href="/"
                  className={`flex items-center gap-2 ${isActive("/") ? "text-purple-400" : ""}`}
                  onClick={() => setIsOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  Home
                </Link>
                <Link
                  href="/places"
                  className={`flex items-center gap-2 ${isActive("/places") ? "text-purple-400" : ""}`}
                  onClick={() => setIsOpen(false)}
                >
                  <Search className="h-5 w-5" />
                  Find Places
                </Link>
                {user?.user_type === "provider" && (
                  <Link
                    href="/places/add"
                    className={`flex items-center gap-2 ${isActive("/places/add") ? "text-purple-400" : ""}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Building className="h-5 w-5" />
                    Add Place
                  </Link>
                )}
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className={`flex items-center gap-2 ${isActive("/dashboard") ? "text-purple-400" : ""}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setIsOpen(false)
                      }}
                      className="flex items-center gap-2 text-red-400"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className={`flex items-center gap-2 ${isActive("/login") ? "text-purple-400" : ""}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className={`flex items-center gap-2 ${isActive("/register") ? "text-purple-400" : ""}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      Register
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-purple-400" />
            <span className="font-bold text-xl hidden sm:inline-block">AccessPlace</span>
          </Link>
          <nav className="hidden md:flex gap-6 ml-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-purple-400 ${
                isActive("/") ? "text-purple-400" : ""
              }`}
            >
              Home
            </Link>
            <Link
              href="/places"
              className={`text-sm font-medium transition-colors hover:text-purple-400 ${
                isActive("/places") ? "text-purple-400" : ""
              }`}
            >
              Find Places
            </Link>
            {user?.user_type === "provider" && (
              <Link
                href="/places/add"
                className={`text-sm font-medium transition-colors hover:text-purple-400 ${
                  isActive("/places/add") ? "text-purple-400" : ""
                }`}
              >
                Add Place
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 flex items-center gap-2 hover:bg-gray-800">
                  <div className="h-8 w-8 rounded-full bg-purple-900 flex items-center justify-center">
                    <User className="h-4 w-4 text-purple-300" />
                  </div>
                  <span className="hidden sm:inline-block">{user.first_name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="hover:bg-gray-800 cursor-pointer">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="hover:bg-gray-800 cursor-pointer">
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                {user.user_type === "seeker" && (
                  <DropdownMenuItem asChild>
                    <Link href="/recommendations" className="hover:bg-gray-800 cursor-pointer">
                      My Recommendations
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem onClick={logout} className="text-red-400 hover:bg-gray-800 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hover:bg-gray-800 hover:text-purple-400">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 btn-animated">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

