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

  const handleContact = (e) => {
    e.preventDefault();
    alert("Tak for din besked! Vi vender tilbage hurtigst muligt.");
    setContact({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f6fa] font-sans">
      {/* Hero med billede og overlay */}
      <div className="relative">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: "url('/family-adoption-and-parents-hug-child-love-and-h-2022-12-29-04-26-45-utc.jpg')",
            height: "520px",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/70 rounded-b-3xl"></div>
        </div>
        <nav className="flex items-center justify-between px-12 py-5 bg-white/90 backdrop-blur-md shadow-lg rounded-t-3xl relative z-10">
          <div className="flex items-center gap-4">
            <img src="/image.png" alt="Adopteez Logo" className="w-14 h-14 rounded-full" />
            <span className="font-extrabold text-2xl text-[#2563eb] tracking-tight">Adopteez</span>
            <a href="#communities" className="ml-8 text-[#1e3a5f] hover:text-[#2563eb] font-medium">Communities</a>
            <a href="#membership" className="ml-6 text-[#1e3a5f] hover:text-[#2563eb] font-medium">Membership</a>
            <a href="#about" className="ml-6 text-[#1e3a5f] hover:text-[#2563eb] font-medium">About Us</a>
            <a href="#blog" className="ml-6 text-[#1e3a5f] hover:text-[#2563eb] font-medium">Blog</a>
          </div>
          <button
            onClick={() => setShowLogin(true)}
            className="inline-block bg-[#f97316] hover:bg-[#ea580c] text-white font-bold px-8 py-3 rounded-full text-lg shadow-lg transition-colors duration-200"
          >
            Log ind
          </button>
        </nav>
        <section className="flex flex-col items-center justify-center text-center px-4 py-20 relative z-10" style={{ minHeight: "520px" }}>
          <div className="max-w-2xl mx-auto">
            <span className="inline-block bg-[#2563eb]/30 text-white font-bold px-5 py-2 rounded-full text-base shadow mb-6">
              Your Social Media for Adoption
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-5 text-white drop-shadow-2xl">
              Connecting Adoptees <br />
              <span className="text-[#f97316]">Worldwide</span>
            </h1>
            <p className="text-white/90 mb-10 text-xl drop-shadow-lg font-medium">
              Join Adopteez.com, a supportive network for adoptees and their families. Connect with others who share your experiences and build meaningful relationships in a community that understands your journey.
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center mb-12">
              <a
                href="/pricing"
                className="inline-block bg-[#f97316] hover:bg-[#ea580c] text-white font-bold px-10 py-4 rounded-full text-xl shadow-lg transition-colors duration-200"
              >
                Become a Member
              </a>
              <a
                href="#learn-more"
                className="inline-block bg-white/90 border-2 border-[#2563eb] text-[#2563eb] font-bold px-10 py-4 rounded-full text-xl shadow hover:bg-[#e0edff] transition-colors duration-200"
              >
                Learn More
              </a>
            </div>
            <div className="flex justify-center gap-12 text-white font-bold text-xl drop-shadow-lg">
              <div>
                <span className="text-3xl font-extrabold">150+</span>
                <div className="text-base font-medium">Countries Represented</div>
              </div>
              <div>
                <span className="text-3xl font-extrabold">10K+</span>
                <div className="text-base font-medium">Community Members</div>
              </div>
              <div>
                <span className="text-3xl font-extrabold">24/7</span>
                <div className="text-base font-medium">Support Network</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Empowerment sektion */}
      <section className="max-w-4xl mx-auto mt-20 mb-16 px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 flex flex-col items-center">
          <img src="/image.png" alt="" className="w-20 h-20 rounded-2xl mb-6 shadow" />
          <h2 className="text-3xl font-extrabold mb-3 text-[#1e3a5f]">Empowerment Through Shared Experiences</h2>
          <p className="text-gray-700 text-center mb-2 text-lg font-medium">
            We believe in the power of shared experiences. Gain insights and perspectives from others who have walked a similar path, empowering you to make informed decisions and foster a strong sense of belonging.
          </p>
        </div>
      </section>

      {/* Membership plans & pricing */}
      <section id="membership" className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-4">
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
            <div className="bg-[#f3f6fa] rounded-3xl p-10 shadow-2xl text-center flex flex-col items-center">
              <h3 className="text-2xl font-extrabold mb-2 text-[#2563eb]">Country Basic</h3>
              <p className="mb-4 text-gray-700 font-medium">Perfect for connecting with your country community</p>
              <div className="text-4xl font-extrabold mb-4">$21<span className="text-base font-normal">/year</span></div>
              <ul className="text-gray-600 mb-4 space-y-2 text-left font-medium">
                <li>✔ Adoptee & parent groups</li>
                <li>✔ Access to country community</li>
                <li>✔ Basic support</li>
              </ul>
              <a href="/pricing" className="block bg-[#2563eb] text-white font-bold rounded-full py-3 px-10 mt-4 hover:bg-[#1e3a5f] transition">
                Choose Basic
              </a>
            </div>
            <div className="bg-[#f3f6fa] rounded-3xl p-10 shadow-2xl text-center flex flex-col items-center border-4 border-[#f97316]">
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
              <a href="/pricing" className="block bg-[#f97316] text-white font-bold rounded-full py-3 px-10 mt-4 hover:bg-[#ea580c] transition">
                Choose Plus
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Kontaktformular */}
      <section className="max-w-3xl mx-auto mt-20 mb-16 px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <h2 className="text-3xl font-extrabold mb-6 text-[#1e3a5f]">Send us a message</h2>
          <form onSubmit={handleContact} className="space-y-6">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-5 py-4 bg-gray-100 border border-gray-300 rounded-xl font-medium"
              value={contact.name}
              onChange={e => setContact({ ...contact, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email Address *"
              className="w-full px-5 py-4 bg-gray-100 border border-gray-300 rounded-xl font-medium"
              value={contact.email}
              onChange={e => setContact({ ...contact, email: e.target.value })}
              required
            />
            <textarea
              placeholder="Your Message"
              className="w-full px-5 py-4 bg-gray-100 border border-gray-300 rounded-xl font-medium"
              rows={4}
              value={contact.message}
              onChange={e => setContact({ ...contact, message: e.target.value })}
              required
            />
            <button
              type="submit"
              className="w-full bg-[#f97316] text-white py-4 rounded-full font-bold text-xl hover:bg-[#ea580c] transition-colors shadow-lg"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1e3a5f] text-white py-12 mt-auto rounded-t-3xl">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-start gap-10">
          <div>
            <img src="/image.png" alt="Adopteez Logo" className="w-16 h-16 rounded-full mb-3 shadow" />
            <div className="font-extrabold text-xl mb-3">Adopteez</div>
            <p className="text-base mb-5 max-w-xs">
              Creating a supportive community for adoptees and adoptive parents worldwide. Connect with others who understand your unique journey.
            </p>
            <div className="flex gap-4 mt-2">
              <a href="#" className="hover:text-[#f97316]"><i className="fab fa-facebook text-2xl"></i></a>
              <a href="#" className="hover:text-[#f97316]"><i className="fab fa-instagram text-2xl"></i></a>
              <a href="#" className="hover:text-[#f97316]"><i className="fab fa-linkedin text-2xl"></i></a>
            </div>
          </div>
          <div>
            <div className="font-bold mb-3 text-lg">Quick Links</div>
            <ul className="space-y-2">
              <li><a href="/" className="hover:text-[#f97316]">Home</a></li>
              <li><a href="#communities" className="hover:text-[#f97316]">Communities</a></li>
              <li><a href="#membership" className="hover:text-[#f97316]">Membership</a></li>
              <li><a href="#about" className="hover:text-[#f97316]">About Us</a></li>
              <li><a href="#blog" className="hover:text-[#f97316]">Blog</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold mb-3 text-lg">Contact</div>
            <div className="text-base">Slengeriksvej 3<br />5500 Middelfart, Denmark</div>
          </div>
        </div>
        <div className="text-center text-sm mt-10 opacity-70">
          © 2026 Adopteez. All rights reserved.
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 relative">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-3xl font-extrabold"
              aria-label="Luk"
            >
              ×
            </button>
            <h2 className="text-3xl font-extrabold text-[#2563eb] mb-8 text-center">Log ind</h2>
            <form
              onSubmit={handleLogin}
              className="flex flex-col gap-6"
            >
              <input
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-5 py-4 bg-gray-100 border border-gray-300 rounded-xl font-medium"
                required
              />
              <input
                type="password"
                placeholder="Adgangskode"
                value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-5 py-4 bg-gray-100 border border-gray-300 rounded-xl font-medium"
                required
              />
              {error && (
                <div className="p-2 bg-red-100 border border-red-400 text-red-700 rounded text-base text-center">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563eb] text-white py-4 rounded-full font-bold text-xl hover:bg-[#1e3a5f] transition-colors disabled:opacity-50 shadow-lg"
              >
                {loading ? "Logger ind..." : "Log ind"}
              </button>
            </form>
            <div className="mt-8 text-center">
              <span className="text-base text-gray-500">Ikke medlem endnu?</span>
              <a
                href="/pricing"
                className="ml-2 text-[#f97316] font-bold hover:underline"
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
