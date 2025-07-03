'use client'

import { useState } from 'react'
import { X, Calendar, Users, MapPin, Clock, TrendingUp, Wallet, AlertCircle } from 'lucide-react'
import { useWallet } from '@/components/providers/WalletProvider'
import { blockchainService } from '@/lib/blockchain'
import { Trail } from '@/types'

interface BookingModalProps {
  trail: Trail
  isOpen: boolean
  onClose: () => void
}

export function BookingModal({ trail, isOpen, onClose }: BookingModalProps) {
  const { connected, wallet } = useWallet()
  const [selectedDate, setSelectedDate] = useState('')
  const [participants, setParticipants] = useState(1)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingError, setBookingError] = useState('')

  if (!isOpen) return null

  const totalPrice = trail.price * participants
  const availableSpots = trail.maxCapacity - trail.currentBookings

  const handleBooking = async () => {
    if (!connected || !wallet) {
      setBookingError('Please connect your wallet to book this trail.')
      return
    }

    if (!selectedDate) {
      setBookingError('Please select a date for your adventure.')
      return
    }

    if (participants > availableSpots) {
      setBookingError(`Only ${availableSpots} spots available.`)
      return
    }

    setIsBooking(true)
    setBookingError('')

    try {
      blockchainService.setWallet(wallet)
      
      // Create booking transaction
      const txHash = await blockchainService.createBookingTransaction(
        trail.id,
        totalPrice / 1000, // Convert to ADA (assuming price is in LKR, simplified conversion)
        selectedDate
      )

      alert(`Booking successful! Transaction hash: ${txHash}`)
      onClose()
    } catch (error) {
      console.error('Booking failed:', error)
      setBookingError('Booking failed. Please try again or check your wallet balance.')
    } finally {
      setIsBooking(false)
    }
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 90) // 3 months ahead
    return maxDate.toISOString().split('T')[0]
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Book Your Adventure</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Trail Info */}
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{trail.name}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-blue-500" />
              <span>{trail.location}</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
              <span>{trail.distance}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-purple-500" />
              <span>{trail.duration}</span>
            </div>
            <div className="flex items-center">
              <span className={`px-2 py-1 rounded-full text-xs ${
                trail.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                trail.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {trail.difficulty}
              </span>
            </div>
          </div>
          <p className="text-gray-600 mt-3">{trail.description}</p>
        </div>

        {/* Booking Form */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getTomorrowDate()}
                  max={getMaxDate()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Participants */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Participants
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={participants}
                  onChange={(e) => setParticipants(parseInt(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {Array.from({ length: Math.min(availableSpots, 10) }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {availableSpots} spots available
              </p>
            </div>
          </div>

          {/* Pricing */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Price per person:</span>
              <span className="font-medium">₨{trail.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Participants:</span>
              <span className="font-medium">{participants}</span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-lg font-bold text-green-600">₨{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Rewards Info */}
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Blockchain Rewards</h4>
            <div className="text-sm text-green-700 space-y-1">
              <div>✓ Earn 50 TREK tokens per person upon completion</div>
              <div>✓ Mint unique trail completion NFT</div>
              <div>✓ On-chain booking confirmation</div>
            </div>
          </div>

          {/* Error Message */}
          {bookingError && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{bookingError}</span>
            </div>
          )}

          {/* Wallet Status */}
          {!connected && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg flex items-center">
              <Wallet className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-yellow-700">Connect your Cardano wallet to proceed with booking</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBooking}
              disabled={!connected || isBooking || !selectedDate || !trail.available}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                connected && !isBooking && selectedDate && trail.available
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isBooking ? 'Processing...' : `Book for ₨${totalPrice.toLocaleString()}`}
            </button>
          </div>

          {/* Terms */}
          <p className="mt-4 text-xs text-gray-500 text-center">
            By booking, you agree to our terms and conditions. Cancellations must be made 24 hours in advance.
          </p>
        </div>
      </div>
    </div>
  )
}
