import { useState } from "react";

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dummy login-funktion – udskift med din egen auth-løsning!
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Her indsætter du din auth-logik
    setTimeout(() => {
      setLoading(false);
      if (loginForm.email === "demo@adopteez.com" && loginForm.password === "demo") {
        window.location.href = "/home";
      } else {
        setError("Login fejlede. Tjek dine oplysninger.");
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0edff] to-[#f3f6fa] flex flex-col">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow">
        <div className="flex items-center gap-4">
          <img src="/image.png" alt="Adopteez Logo" className="w-12 h-12 rounded-full" />
          <span className="font-bold text-xl text-[#2563eb]">Adopteez</span>
          <a href="#communities" className="ml-8 text-[#1e3a5f] hover:text-[#2563eb] font-medium">Communities</a>
          <a href="#membership" className="ml-6 text-[#1e3a5f] hover:text-[#2563eb] font-medium">Membership</a>
          <a href="#about" className="ml-6 text-[#1e3a5f] hover:text-[#2563eb] font-medium">About Us</a>
          <a href="#blog" className="ml-6 text-[#1e3a5f] hover:text-[#2563eb] font-medium">Blog</a>
        </div>
        <div>
          <button
            onClick={() => setShowLogin(true)}
            className="inline-block bg-[#2563eb] hover:bg-[#1e3a5f] text-white font-bold px-6 py-3 rounded-full text-lg shadow transition-colors duration-200"
          >
            Log ind
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-4 py-16 bg-cover bg-center" style={{
        backgroundImage: "url('/FAmilyCauch-Photoroom.jpg'), linear-gradient(to bottom right, #e0edff, #f3f6fa)"
      }}>
        <div className="max-w-2xl">
          <div className="mb-4">
            <span className="inline-block bg-[#2563eb]/10 text-[#2563eb] font-semibold px-4 py-1 rounded-full text-sm">
              Your Social Media for Adoption
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Connecting Adoptees <br />
            <span className="text-[#f97316]">Worldwide</span>
          </h1>
          <p className="text-[#1e3a5f] mb-8 text-lg">
            Join Adopteez.com, a supportive network for adoptees and their families. Connect with others who share your experiences and build meaningful relationships in a community that understands your journey.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-10">
            <a
              href="/pricing"
              className="inline-block bg-[#f97316] hover:bg-[#ea580c] text-white font-bold px-8 py-3 rounded-full text-lg shadow transition-colors duration-200"
            >
              Become a Member
            </a>
            <a
              href="#learn-more"
              className="inline-block bg-white border border-[#2563eb] text-[#2563eb] font-bold px-8 py-3 rounded-full text-lg shadow hover:bg-[#e0edff] transition-colors duration-200"
            >
              Learn More
            </a>
          </div>
          <div className="flex justify-center gap-8 text-[#1e3a5f] font-semibold text-lg">
            <div>
              <span className="text-2xl font-bold">150+</span>
              <div className="text-sm">Countries Represented</div>
            </div>
            <div>
              <span className="text-2xl font-bold">10K+</span>
              <div className="text-sm">Community Members</div>
            </div>
            <div>
              <span className="text-2xl font-bold">24/7</span>
              <div className="text-sm">Support Network</div>
            </div>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl font-bold"
              aria-label="Luk"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-[#2563eb] mb-6 text-center">Log ind</h2>
            <form
              onSubmit={handleLogin}
              className="flex flex-col gap-4"
            >
              <input
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                required
              />
              <input
                type="password"
                placeholder="Adgangskode"
                value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                required
              />
              {error && (
                <div className="p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563eb] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#1e3a5f] transition-colors disabled:opacity-50 shadow-lg"
              >
                {loading ? "Logger ind..." : "Log ind"}
              </button>
            </form>
            <div className="mt-6 text-center">
              <span className="text-sm text-gray-500">Ikke medlem endnu?</span>
              <a
                href="/pricing"
                className="ml-2 text-[#f97316] font-semibold hover:underline"
              >
                Bliv medlem
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
