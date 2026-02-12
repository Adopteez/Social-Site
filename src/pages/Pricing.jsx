export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#f3f6fa] flex flex-col font-sans">
      <div className="max-w-4xl mx-auto mt-16 mb-16 px-4">
        <div className="text-center mb-14">
          <span className="inline-block bg-[#2563eb]/15 text-[#2563eb] font-bold px-5 py-2 rounded-full text-base mb-3">
            Membership
          </span>
          <h2 className="text-4xl font-extrabold mb-3 text-[#1e3a5f]">Membership Plans & Pricing</h2>
          <p className="text-gray-600 text-lg">
            For people with smaller adoption countries, we recommend World Wide groups
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-white rounded-3xl p-10 shadow-2xl text-center flex flex-col items-center">
            <h3 className="text-2xl font-extrabold mb-2 text-[#2563eb]">Country Basic</h3>
            <p className="mb-4 text-gray-700 font-medium">Perfect for connecting with your country community</p>
            <div className="text-4xl font-extrabold mb-4">$21<span className="text-base font-normal">/year</span></div>
            <ul className="text-gray-600 mb-4 space-y-2 text-left font-medium">
              <li>✔ Adoptee & parent groups</li>
              <li>✔ Access to country community</li>
              <li>✔ Basic support</li>
            </ul>
            <a href="/checkout" className="block bg-[#2563eb] text-white font-bold rounded-full py-3 px-10 mt-4 hover:bg-[#1e3a5f] transition">
              Choose Basic
            </a>
          </div>
          <div className="bg-white rounded-3xl p-10 shadow-2xl text-center flex flex-col items-center border-4 border-[#f97316]">
            <div className="mb-2">
              <span className="inline-block bg-[#f97316] text-white text-xs font-bold px-4 py-2 rounded-full shadow">Most Popular</span>
            </div>
            <h3 className="text-2xl font-extrabold mb-2 text-[#f97316]">Country Plus</h3>
            <p className="mb-4 text-gray-700 font-medium">Enhanced features for deeper connections</p>
            <div className="text-4xl font-extrabold mb-4">$43<span className="text-base font-normal">/year</span></div>
            <ul className="text-gray-600 mb-4 space-y-2 text-left font-medium">
              <li>✔ Everything in Basic</li>
              <li>✔ Premium groups & features</li>
              <li>✔ Priority support</li>
            </ul>
            <a href="/checkout" className="block bg-[#f97316] text-white font-bold rounded-full py-3 px-10 mt-4 hover:bg-[#ea580c] transition">
              Choose Plus
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
