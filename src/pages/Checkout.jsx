export default function Checkout() {
  return (
    <div className="min-h-screen bg-[#f3f6fa] flex flex-col font-sans">
      <div className="max-w-xl mx-auto mt-20 mb-16 px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <h2 className="text-3xl font-extrabold mb-6 text-[#1e3a5f] text-center">Checkout</h2>
          <form className="space-y-6">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-5 py-4 bg-gray-100 border border-gray-300 rounded-xl font-medium"
              required
            />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-5 py-4 bg-gray-100 border border-gray-300 rounded-xl font-medium"
              required
            />
            <input
              type="text"
              placeholder="Card Number"
              className="w-full px-5 py-4 bg-gray-100 border border-gray-300 rounded-xl font-medium"
              required
            />
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full px-5 py-4 bg-gray-100 border border-gray-300 rounded-xl font-medium"
                required
              />
              <input
                type="text"
                placeholder="CVC"
                className="w-full px-5 py-4 bg-gray-100 border border-gray-300 rounded-xl font-medium"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#f97316] text-white py-4 rounded-full font-bold text-xl hover:bg-[#ea580c] transition-colors shadow-lg"
            >
              Complete Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
