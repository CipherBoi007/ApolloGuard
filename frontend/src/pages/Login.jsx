import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Shield, 
  Stethoscope, 
  HeartPulse,
  UserCircle,
  ArrowRight,
  Mail,
  Lock,
  AlertCircle,
  Sparkles,
  CheckCircle,
  Building2,
  Users,
  Activity
} from 'lucide-react';

// Testimonial Carousel Component
const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const testimonials = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Chief of Cardiology',
      hospital: 'Stanford Medical Center',
      quote: 'The AI predictions have transformed our early intervention capabilities. We\'ve seen a 40% reduction in late-stage diagnoses.',
      rating: 5
    },
    {
      name: 'Dr. Michael Rodriguez',
      role: 'Medical Director',
      hospital: 'Community Health Network',
      quote: 'Implementation was seamless and the ROI was evident within months. Our staff productivity increased by 35%.',
      rating: 5
    },
    {
      name: 'Emily Thompson',
      role: 'Patient',
      hospital: 'Diabetes Management Program',
      quote: 'Having access to my health data and understanding my risks has been empowering. I feel more in control.',
      rating: 5
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const current = testimonials[currentIndex];

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      {/* Rating Stars */}
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      
      <blockquote className="text-white/90 text-sm leading-relaxed mb-4 italic">
        "{current.quote}"
      </blockquote>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{current.name}</p>
          <p className="text-xs text-white/60">{current.role}</p>
          <p className="text-xs text-white/40">{current.hospital}</p>
        </div>
        
        {/* Navigation Dots */}
        <div className="flex space-x-1.5">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30'
              }`}
              aria-label={`View testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ icon: Icon, value, label }) => (
  <div className="flex items-center space-x-3">
    <div className="p-2 bg-white/10 rounded-lg">
      <Icon className="w-4 h-4 text-white" />
    </div>
    <div>
      <div className="text-lg font-semibold text-white">{value}</div>
      <div className="text-xs text-white/60">{label}</div>
    </div>
  </div>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState({});
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [lockMessage, setLockMessage] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Load login attempts from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('loginAttempts');
    if (stored) {
      const attempts = JSON.parse(stored);
      const now = Date.now();
      const validAttempts = Object.entries(attempts).reduce((acc, [key, data]) => {
        if (now - data.timestamp < 15 * 60 * 1000) {
          acc[key] = data;
        }
        return acc;
      }, {});
      setLoginAttempts(validAttempts);
      localStorage.setItem('loginAttempts', JSON.stringify(validAttempts));
    }
  }, []);

  // Lock timer effect
  useEffect(() => {
    let interval;
    if (isLocked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setLockMessage('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTimer]);

  const getClientIdentifier = () => {
    return email.toLowerCase().trim() + '_' + navigator.userAgent.substring(0, 50);
  };

  const checkRateLimit = () => {
    const identifier = getClientIdentifier();
    const attempt = loginAttempts[identifier];
    
    if (attempt) {
      const now = Date.now();
      const timeSinceFirstAttempt = now - attempt.firstAttempt;
      const timeSinceLastAttempt = now - attempt.lastAttempt;
      
      if (attempt.count >= 5 && timeSinceFirstAttempt < 15 * 60 * 1000) {
        const remainingLockTime = Math.ceil((15 * 60 * 1000 - timeSinceFirstAttempt) / 1000);
        setLockTimer(remainingLockTime);
        setIsLocked(true);
        setLockMessage(`Too many failed attempts. Try again in ${Math.floor(remainingLockTime / 60)}:${String(remainingLockTime % 60).padStart(2, '0')}`);
        return true;
      }
      
      if (attempt.count >= 3 && timeSinceLastAttempt < 60 * 1000) {
        const waitTime = Math.ceil((60 * 1000 - timeSinceLastAttempt) / 1000);
        setLockMessage(`Too many attempts. Please wait ${waitTime} seconds`);
        return true;
      }
    }
    return false;
  };

  const recordFailedAttempt = () => {
    const identifier = getClientIdentifier();
    const now = Date.now();
    
    setLoginAttempts(prev => {
      const current = prev[identifier] || { count: 0, firstAttempt: now, lastAttempt: now };
      const updated = {
        ...prev,
        [identifier]: {
          count: current.count + 1,
          firstAttempt: current.firstAttempt,
          lastAttempt: now,
          timestamp: now
        }
      };
      localStorage.setItem('loginAttempts', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (checkRateLimit()) {
      return;
    }

    setIsLoading(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      const identifier = getClientIdentifier();
      const updated = { ...loginAttempts };
      delete updated[identifier];
      setLoginAttempts(updated);
      localStorage.setItem('loginAttempts', JSON.stringify(updated));
      
      navigate(`/${result.role}/dashboard`);
    } else {
      recordFailedAttempt();
      checkRateLimit();
    }
    
    setIsLoading(false);
  };

  const getDemoCredentials = (role) => {
    const credentials = {
      admin: { email: 'admin@hospital.com', password: 'Admin@123' },
      doctor: { email: 'doctor1@hospital.com', password: 'Doctor@123' },
      nurse: { email: 'nurse1@hospital.com', password: 'Nurse@123' },
      patient: { email: 'patient1@email.com', password: 'Patient@123' },
    };
    return credentials[role] || credentials.admin;
  };

  const fillDemoCredentials = () => {
    const creds = getDemoCredentials(selectedRole);
    setEmail(creds.email);
    setPassword(creds.password);
  };

  const roles = [
    { id: 'admin', label: 'Admin', icon: Shield },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope },
    { id: 'nurse', label: 'Nurse', icon: HeartPulse },
    { id: 'patient', label: 'Patient', icon: UserCircle },
  ];

  const features = [
    'AI-Powered Predictions',
    'HIPAA Compliant',
    'Secure Messaging',
    'Real-time Analytics'
  ];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Rich Branding with Testimonials */}
      <div className="hidden lg:flex lg:w-2/5 relative bg-slate-900 flex-col">
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80"
          alt="Medical professional"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/60"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-8">
          {/* Logo and Product Name */}
          <div className="mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center shadow-lg">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-xl">ApolloGuard</span>
                <span className="text-xs text-blue-400 block">Hospital Management System</span>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <StatsCard icon={Building2} value="500+" label="Hospitals" />
            <StatsCard icon={Users} value="50K+" label="Providers" />
            <StatsCard icon={Activity} value="98%" label="Satisfaction" />
            <StatsCard icon={CheckCircle} value="24/7" label="Support" />
          </div>

          {/* Features List */}
          <div className="mb-8">
            <h3 className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-3">Why choose us</h3>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-white/70">
                  <CheckCircle className="w-4 h-4 text-blue-400 mr-2" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="mt-auto">
            <TestimonialCarousel />
          </div>

          {/* Trust Badges */}
          <div className="mt-6 flex items-center space-x-4 text-xs text-white/40">
            <span>HIPAA</span>
            <span className="w-1 h-1 rounded-full bg-white/20"></span>
            <span>SOC 2</span>
            <span className="w-1 h-1 rounded-full bg-white/20"></span>
            <span>FDA</span>
          </div>
        </div>
      </div>

      {/* Right Side - Polished Login Form */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-8 bg-white">
        <div className="max-w-sm w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-slate-900 text-lg">ApolloGuard</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Hospital Management System</p>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to continue to ApolloGuard</p>
          </div>

          {/* Role Selection - Enhanced Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-slate-500 mb-2">Select your role</label>
            <div className="grid grid-cols-4 gap-2">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-2 rounded-lg border transition-all flex flex-col items-center ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${
                      isSelected ? 'text-blue-600' : 'text-slate-500'
                    }`} />
                    <span className={`text-xs font-medium ${
                      isSelected ? 'text-blue-600' : 'text-slate-600'
                    }`}>
                      {role.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Role Info */}
          <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600">
              <span className="font-medium text-slate-900">Demo credentials:</span> Use the demo button below or select a role to autofill
            </p>
          </div>

          {/* Lock Message */}
          {lockMessage && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start">
              <AlertCircle className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-amber-700">{lockMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="you@hospital.com"
                  required
                  disabled={isLocked}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="••••••••"
                  required
                  disabled={isLocked}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-xs text-slate-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Use demo
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || isLocked}
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Quick Role Demo Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-400 text-center mb-3">Quick demo access</p>
            <div className="grid grid-cols-4 gap-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role.id);
                    const creds = getDemoCredentials(role.id);
                    setEmail(creds.email);
                    setPassword(creds.password);
                  }}
                  className="text-xs px-2 py-1.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link to="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;