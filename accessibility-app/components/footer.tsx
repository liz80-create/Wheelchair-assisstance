import Link from "next/link"
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-800 bg-black">
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-purple-400" />
              <span className="font-bold text-xl">AccessPlace</span>
            </div>
            <p className="text-sm text-gray-400">Making the world more accessible, one place at a time.</p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/places" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Find Places
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-purple-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/accessibility-guide" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Accessibility Guide
                </Link>
              </li>
              <li>
                <Link href="/for-businesses" className="text-gray-400 hover:text-purple-400 transition-colors">
                  For Businesses
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-purple-400 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-gray-400">
                <Mail className="h-4 w-4 text-purple-400" />
                <span>info@accessplace.com</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Phone className="h-4 w-4 text-purple-400" />
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} AccessPlace. All rights reserved.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <Link href="/privacy" className="hover:text-purple-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-purple-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/accessibility" className="hover:text-purple-400 transition-colors">
              Accessibility Statement
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

