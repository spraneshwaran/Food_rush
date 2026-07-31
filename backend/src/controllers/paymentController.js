const asyncHandler = require('express-async-handler');

// @desc  Mock payment initiation (simulate Razorpay/Stripe)
// @route POST /api/payment/initiate
const initiatePayment = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', method } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Invalid payment amount');
  }

  // Simulate payment gateway response
  const mockOrderId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  res.json({
    success: true,
    data: {
      orderId: mockOrderId,
      amount,
      currency,
      keyId: 'rzp_test_mock_key',
      method,
      gatewayUrl: '/payment/checkout',
    },
  });
});

// @desc  Verify payment (mock success)
// @route POST /api/payment/verify
const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature } = req.body;

  // In a real scenario: HMAC SHA256 signature verification
  // For mock: simulate a success
  const isValid = orderId && paymentId;

  if (!isValid) {
    res.status(400);
    throw new Error('Payment verification failed — invalid signature');
  }

  res.json({
    success: true,
    message: 'Payment verified successfully',
    data: {
      transactionId: paymentId || `txn_${Date.now()}`,
      status: 'completed',
      verifiedAt: new Date(),
    },
  });
});

module.exports = { initiatePayment, verifyPayment };
