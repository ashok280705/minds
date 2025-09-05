'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, ShoppingCart, Pill, Navigation } from 'lucide-react';

export default function PharmacyDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Pill className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Pharmacy Services</h1>
            <p className="text-gray-600">Find medicines online or locate nearby pharmacies</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Physical Pharmacy Card */}
            <Link href="/dashboard/pharmacy/physical">
              <div className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <MapPin className="w-12 h-12" />
                  <Navigation className="w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <h2 className="text-2xl font-bold mb-3">Find Nearby Pharmacies</h2>
                <p className="text-blue-100 mb-4">
                  Locate physical pharmacies near your location with directions and contact information
                </p>
                
                <div className="flex items-center text-sm text-blue-100">
                  <span>• Real-time location tracking</span>
                </div>
                <div className="flex items-center text-sm text-blue-100">
                  <span>• Store hours and ratings</span>
                </div>
                <div className="flex items-center text-sm text-blue-100">
                  <span>• Direct navigation support</span>
                </div>
              </div>
            </Link>

            {/* Online Pharmacy Card */}
            <Link href="/dashboard/pharmacy/online">
              <div className="group bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <ShoppingCart className="w-12 h-12" />
                  <Pill className="w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <h2 className="text-2xl font-bold mb-3">Online Medicine Store</h2>
                <p className="text-green-100 mb-4">
                  Browse and order medicines online with home delivery options
                </p>
                
                <div className="flex items-center text-sm text-green-100">
                  <span>• Wide medicine catalog</span>
                </div>
                <div className="flex items-center text-sm text-green-100">
                  <span>• Prescription upload</span>
                </div>
                <div className="flex items-center text-sm text-green-100">
                  <span>• Home delivery available</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center gap-3 p-4 bg-white rounded-lg hover:bg-blue-50 transition-colors border border-gray-200">
                <MapPin className="w-6 h-6 text-blue-600" />
                <span className="font-medium text-gray-700">Emergency Pharmacy</span>
              </button>
              
              <button className="flex items-center gap-3 p-4 bg-white rounded-lg hover:bg-green-50 transition-colors border border-gray-200">
                <Pill className="w-6 h-6 text-green-600" />
                <span className="font-medium text-gray-700">Medicine Reminder</span>
              </button>
              
              <button className="flex items-center gap-3 p-4 bg-white rounded-lg hover:bg-purple-50 transition-colors border border-gray-200">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
                <span className="font-medium text-gray-700">Order History</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}