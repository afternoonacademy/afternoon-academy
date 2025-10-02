"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="relative flex flex-col min-h-screen">
      {/* 🔹 Hero Section */}
      <div className="relative w-full h-screen">
        {/* Background image */}
        <Image
          src="/homework-hero.svg"
          alt="Afternoon Academy hero background"
          fill
          priority
          className="object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Navigation buttons (top right) */}
        <div className="absolute top-6 right-8 flex gap-4 z-20">
          <button
            onClick={() => router.push("/sign-up?role=parent")}
            className="px-5 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition"
          >
            I’m a Parent
          </button>
          <button
            onClick={() => router.push("/sign-up?role=teacher")}
            className="px-5 py-2 rounded-lg bg-secondary text-white font-semibold hover:bg-secondary/90 transition"
          >
            I’m a Teacher
          </button>
        </div>

        {/* Centered Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <h1 className="text-5xl sm:text-6xl font-bold text-white drop-shadow-lg mb-6">
            Welcome to <span className="text-primary">The Afternoon Academy</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mb-10">
            After-school support designed for{" "}
            <strong>students</strong> to thrive and{" "}
            <strong>parents & teachers</strong> to feel confident.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-6">
            <button
              onClick={() => router.push("/sign-up?role=parent")}
              className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition"
            >
              Join as Parent
            </button>
            <button
              onClick={() => router.push("/sign-up?role=teacher")}
              className="px-6 py-3 rounded-lg bg-secondary text-white font-semibold hover:bg-secondary/90 transition"
            >
              Join as Teacher
            </button>
          </div>

          <p className="mt-8 text-sm text-gray-300">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/sign-in")}
              className="text-primary cursor-pointer underline"
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
