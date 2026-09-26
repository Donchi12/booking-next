"use client"
import Image from "next/image"
import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="container mx-auto flex justify-between items-center py-4 px-4">
        <Link href="/" className="flex items-center">
          <Image src="/assets/imgs/donnybookw.png" alt="Donnybook" width={120} height={40} className="object-contain" />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/main/lists" className="text-white hover:underline">Explore stays</Link>
        </div>
      </div>
    </nav>
  )
}
