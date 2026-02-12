import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Kontaktformular state
  const [contact, setContact] = useState({ name: "", email: "", message: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(loginForm.email, loginForm.password);
      navigate("/home");
    } catch (err) {
      setError("Login fejlede. Tjek dine oplysninger.");
    } finally {
      setLoading(false);
    }
  };

  // Dummy submit til kontaktformular (kan udbygges)
  const handleContact = (e) => {
    e.preventDefault();
    alert("Tak for din besked! Vi vender tilbage hurtigst muligt.");
    setContact({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f6fa]">
      {/* Hero med billede og overlay */}
      <div className="relative">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: "url('/family-adoption-and-parents-hug-child-love-and-h-2022-12-29-04-26-45-utc.jpg')",
            height: "480px",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/60"></div>
        </div>
        <nav className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md shadow relative z-10">
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
        <section className="flex flex-col items-center justify-center text-center px-4 py-16 relative z-10" style={{ minHeight: "480px" }}>
          <div className="max-w-2xl mx-auto">
            <div className="mb-4">
              <span className="inline-block bg-[#2563eb]/20 text-[#fff] font-semibold px-4 py-1 rounded-full text-sm shadow">
                Your Social Media for Adoption
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white drop-shadow-2xl">
              Connecting Adoptees <br />
              <span className="text-[#f97316]">Worldwide</span>
            </h1>
            <p className="text-white/90 mb-8 text-lg drop-shadow-lg">
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
                className="inline-block bg-white/80 border border-[#2563eb] text-[#2563eb] font-bold px-8 py-3 rounded-full text-lg shadow hover:bg-[#e0edff] transition-colors duration-200"
              >
                Learn More
              </a>
            </div>
            <div className="flex justify-center gap-8 text-white font-semibold text-lg drop-shadow-lg">
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
      </div>

      {/* Empowerment sektion */}
      <section className="max-w-4xl mx-auto mt-12 mb-12 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
          <img src="/image.png" alt="" className="w-16 h-16 rounded-xl mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-[#1e3a5f]">Empowerment Through Shared Experiences</h2>
          <p className="text-gray-700 text-center mb-2">
            We believe in the power of shared experiences. Gain insights and perspectives from others who have walked a similar path, empowering you to make informed decisions and foster a strong sense of belonging.
          </p>
        </div>
      </section>

      {/* Membership plans & pricing */}
      <section id="membership" className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="inline-block bg-[#2563eb]/10 text-[#2563eb] font-semibold px-4 py-1 rounded-full text-sm mb-2">
              Membership
            </span>
            <h2 className="text-3xl font-bold mb-2 text-[#1e3a5f]">Membership Plans & Pricing</h2>
            <p className="text-gray-600">
              For people with smaller adoption countries, we recommend World Wide groups
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#f3f6fa] rounded-xl p-8 shadow text-center">
              <h3 className="text-xl font-bold mb-2 text-[#2563eb]">Country Basic</h3>
              <p className="mb-4 text-gray-700">Perfect for connecting with your country community</p>
              <div className="text-3xl font-extrabold mb-4">$21<span className="text-base font-normal">/year</span></div>
              <ul className="text-gray-600 mb-4 space-y-2 text-left">
                <li>✔ Adoptee & parent groups</li>
                <li>✔ Access to country community</li>
                <li>✔ Basic support</li>
              </ul>
              <a href="/pricing" className="block bg-[#2563eb] text-white font-bold rounded-full py-3 mt-4 hover:bg-[#1e3a5f] transition">Choose Basic</a>
            </div>
            <div className="bg-[#f3f6fa] rounded-xl p-8 shadow text-center border-4 border-[#f97316]">
              <div className="mb-2">
                <span className="inline-block bg-[#f97316] text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#f97316]">Country Plus</h3>
              <p className="mb-4 text-gray-700">Enhanced features for deeper connections</p>
              <div className="text-3xl font-extrabold mb-4">$43<span className="text-base font-normal">/year</span></div>
              <ul className="text-gray-600 mb-4 space-y-2 text-left">
                <li>✔ Everything in Basic</li>
                <li>✔ Premium groups & features</li>
                <li>✔ Priority support</li>
              </ul>
              <a href="/pricing" className="block bg-[#f97316] text-white font-bold rounded-full py-3 mt-4 hover:bg-[#ea580c] transition">Choose Plus</a>
            </div>
          </div>
        </div>
      </section>

      {/* Kontaktformular */}
      <section className="max-w-3xl mx-auto mt-12 mb-12 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4 text-[#1e3a5f]">Send us a message</h2>
          <form onSubmit={handleContact} className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg"
              value={contact.name}
              onChange={e => setContact({ ...contact, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email Address *"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg"
              value={contact.email}
              onChange={e => setContact({ ...contact, email: e.target.value })}
              required
            />
            <textarea
              placeholder="Your Message"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg"
              rows={4}
              value={contact.message}
              onChange={e => setContact({ ...contact, message: e.target.value })}
              required
            />
            <button
              type="submit"
              className="w-full bg-[#f97316] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#ea580c] transition-colors shadow-lg"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1e3a5f] text-white py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <img src="/image.png" alt="Adopteez Logo" className="w-14 h-14 rounded-full mb-2" />
            <div className="font-bold text-lg mb-2">Adopteez</div>
            <p className="text-sm mb-4 max-w-xs">
              Creating a supportive community for adoptees and adoptive parents worldwide. Connect with others who understand your unique journey.
            </p>
            <div className="flex gap-3">
              <a href="#" className="hover:text-[#f97316]"><i className="fab fa-facebook text-2xl"></i></a>
              <a href="#" className="hover:text-[#f97316]"><i className="fab fa-instagram text-2xl"></i></a>
              <a href="#" className="hover:text-[#f97316]"><i className="fab fa-linkedin text-2xl"></i></a>
            </div>
          </div>
          <div>
            <div className="font-bold mb-2">Quick Links</div>
            <ul>
              <li><a href="/" className="hover:text-[#f97316]">Home</a></li>
              <li><a href="#communities" className="hover:text-[#f97316]">Communities</a></li>
              <li><a href="#membership" className="hover:text-[#f97316]">Membership</a></li>
              <li><a href="#about" className="hover:text-[#f97316]">About Us</a></li>
              <li><a href="#blog" className="hover:text-[#f97316]">Blog</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold mb-2">Contact</div>
            <div className="text-sm">Slengeriksvej 3<br />5500 Middelfart, Denmark</div>
          </div>
        </div>
        <div className="text-center text-xs mt-8 opacity-70">
          © 2026 Adopteez. All rights reserved.
        </div>
      </footer>

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
