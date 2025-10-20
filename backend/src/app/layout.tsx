import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UWPlanit Backend API",
  description: "Backend API server for UWPlanit course planning platform",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              UWPlanit Backend API
            </h1>
            <p className="text-gray-600 mb-8">
              This is the backend API server. The frontend application should be running separately.
            </p>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Available Endpoints</h2>
              <ul className="space-y-2 text-sm">
                <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/env</code> - Environment configuration</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/profile</code> - User profile management</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">GET/POST /api/auth/*</code> - Auth0 authentication</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/trpc/*</code> - tRPC API endpoints</li>
              </ul>
            </div>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
