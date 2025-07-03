'use client'

import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string
}

export function StatsCard({ icon: Icon, label, value }: StatsCardProps) {
  return (
    <div className="text-center">
      <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
        <Icon className="h-6 w-6 text-green-600" />
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-gray-600 text-sm">{label}</div>
    </div>
  )
}
