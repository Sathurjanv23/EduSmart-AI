'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function FeeManagementPage() {
  const [transactions, setTransactions] = useState([]);
  const [feeStructure, setFeeStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const studentId = 'current-student-id'; // Replace with actual student ID

  useEffect(() => {
    fetchFeeData();
  }, []);

  const fetchFeeData = async () => {
    setLoading(true);
    try {
      const transactionResponse = await axios.get(
        `${API_BASE_URL}/fee-transactions?studentId=${studentId}`
      );
      setTransactions(transactionResponse.data);

      const feeResponse = await axios.get(`${API_BASE_URL}/fee-structure`);
      if (feeResponse.data.length > 0) {
        setFeeStructure(feeResponse.data[0]);
      }
    } catch (error) {
      console.error('Error fetching fee data:', error);
    }
    setLoading(false);
  };

  const handlePayment = async () => {
    if (paymentMethod === 'RAZORPAY') {
      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: (feeStructure.totalFee * 100).toFixed(0),
        currency: 'INR',
        name: 'School Fee Payment',
        description: `Fee for ${new Date().getFullYear()}`,
        handler: async (response) => {
          try {
            await axios.post(`${API_BASE_URL}/fee-transactions`, {
              studentId,
              feeStructureId: feeStructure.id,
              amount: feeStructure.totalFee,
              paidAmount: feeStructure.totalFee,
              paymentMode: 'ONLINE',
              paymentGateway: 'RAZORPAY',
              transactionId: response.razorpay_payment_id,
              status: 'PAID',
            });
            setShowPaymentModal(false);
            fetchFeeData();
            alert('Payment successful!');
          } catch (error) {
            console.error('Error recording payment:', error);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PARTIAL':
        return 'bg-orange-100 text-orange-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPaid = transactions
    .filter((t) => t.status === 'PAID')
    .reduce((sum, t) => sum + t.paidAmount, 0);
  const totalDue = (feeStructure?.totalFee || 0) - totalPaid;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
            <p className="text-gray-600 mt-2">View and manage your school fee payments</p>
          </div>
          {totalDue > 0 && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Pay Now
            </button>
          )}
        </div>

        {/* Fee Summary */}
        {feeStructure && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-2">Total Fee</div>
              <div className="text-3xl font-bold text-gray-900">
                ₹{feeStructure.totalFee?.toLocaleString()}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg shadow-md p-6">
              <div className="text-sm text-green-600 mb-2">Amount Paid</div>
              <div className="text-3xl font-bold text-green-600">
                ₹{totalPaid.toLocaleString()}
              </div>
            </div>
            <div className="bg-red-50 rounded-lg shadow-md p-6">
              <div className="text-sm text-red-600 mb-2">Amount Due</div>
              <div className="text-3xl font-bold text-red-600">
                ₹{totalDue.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Fee Breakdown */}
        {feeStructure && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Fee Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Tuition Fee</span>
                <span className="font-semibold">₹{feeStructure.tuitionFee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Lab Fee</span>
                <span className="font-semibold">₹{feeStructure.labFee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Sports Fee</span>
                <span className="font-semibold">₹{feeStructure.sportsFee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Transport Fee</span>
                <span className="font-semibold">₹{feeStructure.transportFee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Other Fee</span>
                <span className="font-semibold">₹{feeStructure.otherFee?.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>₹{feeStructure.totalFee?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No payment records found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Method</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {new Date(transaction.paidDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                      ₹{transaction.paidAmount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{transaction.paymentMode}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {transaction.receiptUrl && (
                        <a href={transaction.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Download
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Make Payment</h2>
              <div className="mb-6">
                <p className="text-gray-600 mb-2">Select Payment Method</p>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="RAZORPAY"
                      checked={paymentMethod === 'RAZORPAY'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    Razorpay (Secure)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="PAYPAL"
                      checked={paymentMethod === 'PAYPAL'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    PayPal
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="CASH"
                      checked={paymentMethod === 'CASH'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    Cash (In Office)
                  </label>
                </div>
              </div>
              <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">Amount to Pay:</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalDue.toLocaleString()}</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handlePayment}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Proceed
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
}
