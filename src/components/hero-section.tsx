"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Zap, Target, Sparkles, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@auth0/nextjs-auth0/client";
import { LoginButton } from "@/components/auth/login-button";
import { AccountMenu } from "@/components/account-menu";
import Image from "next/image";
import Link from "next/link";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const { user, isLoading: authLoading } = useUser();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-blue-300/10 to-purple-300/10 blur-3xl animate-pulse" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-3 cursor-pointer">
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Image src="/assets/uwplanit-colour-logo.svg" alt="UWPlanit Logo" width={40} height={40} className="h-10 w-10" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              UWPlanit
            </span>
          </motion.div>
        </Link>
        <motion.div
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <a href="/graph">Graph</a>
          </Button>
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <a href="/planner">Planner</a>
          </Button>
          {!authLoading && (user ? <AccountMenu /> : <LoginButton variant="outline" />)}
        </motion.div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >

            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl">
              Plan Your{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Academic Future
              </span>
            </h1>

            <p className="mt-8 text-xl leading-8 text-gray-600 font-medium">
              Visualize course dependencies and plan your degree path with our
              course planner designed for University of Waterloo students.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-start gap-4">
              <Button
                size="lg"
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Start Planning Free
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </div>

            {/* Enhanced Stats */}
            <div className="mt-20 grid grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="h-8 w-8 text-blue-600 mr-2" />
                  <h3 className="text-3xl font-bold text-gray-900">6,000+</h3>
                </div>
                <p className="text-sm font-medium text-gray-600">Courses mapped</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-8 w-8 text-purple-600 mr-2" />
                  <h3 className="text-3xl font-bold text-gray-900">50+</h3>
                </div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Feature Preview */}
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-[76rem] rounded-2xl bg-white/10 shadow-2xl ring-1 ring-white/20 backdrop-blur-sm border border-white/30"
            >
              <div className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  <div className="ml-4 text-sm font-medium text-gray-600">UWPlanit</div>
                </div>
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 font-mono text-sm shadow-inner">
                  <div className="text-green-400 mb-2">→ Analyzing course path for CS Major...</div>
                  <div className="text-blue-400 mb-2">✓ Prerequisites: CS135 → CS136 → CS241</div>
                  <div className="text-purple-400 mb-2">✓ Corequisites: MATH136, MATH239</div>
                  <div className="text-yellow-400 mb-2">✓ Optimized 5-year plan generated</div>
                  <div className="mt-4 text-gray-400">
                    <span className="text-blue-400">$</span> uwgraph --optimize --major cs
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced Features Section */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mx-auto max-w-2xl lg:text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-blue-600">Everything you need</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Plan smarter,{" "}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              graduate faster
            </span>
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our intelligent course planner uses UW data to help you navigate complex
            prerequisites and optimize your academic journey.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
        >
          <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
            <div className="flex flex-col bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold leading-8 tracking-tight text-gray-900">
                Interactive Graph
              </h3>
              <p className="mt-4 text-base leading-7 text-gray-600">
                Visualize course dependencies with our beautiful interactive graph. See
                prerequisites, corequisites, and connections at a glance.
              </p>
            </div>

            <div className="flex flex-col bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold leading-8 tracking-tight text-gray-900">
                Smart Planning
              </h3>
              <p className="mt-4 text-base leading-7 text-gray-600">
                Plan your degree. Get optimal course sequences and
                identify potential scheduling conflicts before they happen.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
