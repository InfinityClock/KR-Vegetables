// Dynamically load Razorpay SDK
export const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export const openRazorpayCheckout = async ({
  orderId,
  amount,
  currency = 'INR',
  keyId,
  customerName,
  customerPhone,
  customerEmail,
  description,
  onSuccess,
  onFailure,
}) => {
  const loaded = await loadRazorpay()
  if (!loaded) {
    onFailure?.('Failed to load payment gateway. Please try again.')
    return
  }

  const options = {
    key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: Math.round(amount * 100), // paise
    currency,
    name: 'KR Vegetables & Fruits',
    description: description || 'Fresh vegetables & fruits order',
    image: '/logo.png',
    order_id: orderId,
    handler: (response) => {
      onSuccess?.({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      })
    },
    prefill: {
      name: customerName || '',
      contact: customerPhone || '',
      email: customerEmail || '',
    },
    theme: {
      color: '#2D6A4F',
    },
    modal: {
      ondismiss: () => {
        onFailure?.('Payment cancelled')
      },
    },
  }

  const rzp = new window.Razorpay(options)
  rzp.on('payment.failed', (response) => {
    onFailure?.(response.error?.description || 'Payment failed')
  })
  rzp.open()
}
