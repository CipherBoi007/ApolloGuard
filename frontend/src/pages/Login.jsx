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
  CheckCircle,
  AlertCircle,
  Fingerprint
} from 'lucide-react';

// Testimonial Carousel Component
const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const testimonials = [
    {
      initials: 'SC',
      name: 'Dr. Sarah Chen',
      title: 'Chief Medical Officer',
      quote: 'The most reliable healthcare platform we\'ve implemented. The security and compliance features give us complete peace of mind.',
      rating: 5
    },
    {
      initials: 'MJ',
      name: 'Dr. Michael Jones',
      title: 'Cardiology',
      quote: 'Reduced our diagnosis time by 40% while improving accuracy. The AI predictions are remarkably precise.',
      rating: 5
    },
    {
      initials: 'ER',
      name: 'Dr. Emily Rodriguez',
      title: 'ICU Director',
      quote: 'Real-time risk assessments have been game-changing for our ICU. We catch complications hours earlier.',
      rating: 5
    },
    {
      initials: 'RT',
      name: 'Robert Thompson',
      title: 'Patient',
      quote: 'The early warning system alerted my doctor to changes I wouldn\'t have noticed. It literally saved my life.',
      rating: 5
    }
  ];

  // Auto-rotate testimonials every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      {/* Rating */}
      <div className="flex space-x-1 mb-4">
        {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
          <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-slate-700 text-sm leading-relaxed mb-4">
        "{testimonials[currentIndex].quote}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-slate-700">
              {testimonials[currentIndex].initials}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold text-slate-900">
              {testimonials[currentIndex].name}
            </p>
            <p className="text-xs text-slate-500">
              {testimonials[currentIndex].title}
            </p>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex space-x-1">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex ? 'bg-slate-900' : 'bg-slate-300'
              }`}
              aria-label={`View testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

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
      // Clean up old entries (older than 15 minutes)
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
    // Use email + IP fingerprint (simplified - in production use real IP + user agent)
    return email.toLowerCase().trim() + '_' + navigator.userAgent.substring(0, 50);
  };

  const checkRateLimit = () => {
    const identifier = getClientIdentifier();
    const attempt = loginAttempts[identifier];
    
    if (attempt) {
      const now = Date.now();
      const timeSinceFirstAttempt = now - attempt.firstAttempt;
      const timeSinceLastAttempt = now - attempt.lastAttempt;
      
      // More than 5 attempts in 15 minutes
      if (attempt.count >= 5 && timeSinceFirstAttempt < 15 * 60 * 1000) {
        const remainingLockTime = Math.ceil((15 * 60 * 1000 - timeSinceFirstAttempt) / 1000);
        setLockTimer(remainingLockTime);
        setIsLocked(true);
        setLockMessage(`Too many failed attempts. Please try again in ${Math.floor(remainingLockTime / 60)}:${String(remainingLockTime % 60).padStart(2, '0')}`);
        return true;
      }
      
      // Rate limiting - max 3 attempts per minute
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
          lastAttempt: now
        }
      };
      localStorage.setItem('loginAttempts', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check rate limiting
    if (checkRateLimit()) {
      return;
    }

    setIsLoading(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      // Clear attempts for this identifier on success
      const identifier = getClientIdentifier();
      const updated = { ...loginAttempts };
      delete updated[identifier];
      setLoginAttempts(updated);
      localStorage.setItem('loginAttempts', JSON.stringify(updated));
      
      navigate(`/${result.role}/dashboard`);
    } else {
      // Record failed attempt
      recordFailedAttempt();
      
      // Check if this failure triggers lockout
      checkRateLimit();
    }
    
    setIsLoading(false);
  };

  const getDemoCredentials = (role) => {
    const credentials = {
      admin: { email: 'admin@hospital.com', password: 'Admin@123' },
      doctor: { email: 'doctor@hospital.com', password: 'Doctor@123' },
      nurse: { email: 'nurse@hospital.com', password: 'Nurse@123' },
      patient: { email: 'patient@example.com', password: 'Patient@123' },
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

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Professional Branding with Testimonials */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-b from-slate-50 to-white p-12 flex-col justify-between border-r border-slate-200">
        <div>
          {/* Logo with company name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">AG</span>
            </div>
            <div>
              <span className="font-semibold text-slate-900 text-lg">ApolloGuard</span>
              <div className="flex items-center mt-0.5">
                <span className="text-xs text-slate-500">Enterprise Secure</span>
              </div>
            </div>
          </div>

          {/* Testimonial Carousel */}
          <div className="mt-12">
            <TestimonialCarousel />
          </div>
        </div>

        {/* Security badges with better styling */}
        <div className="space-y-4">
          <div className="flex items-center text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
            <Shield className="w-4 h-4 mr-2 text-slate-700" />
            <span className="font-medium mr-2">HIPAA Compliant</span>
            <span className="text-slate-400">•</span>
            <span className="ml-2 text-slate-500">SOC 2 Type II</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>FDA Registered</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>256-bit Encryption</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>MFA Available</span>
          </div>
        </div>
      </div>

      {/* Right Side - Polished Login Form */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="font-semibold text-slate-900 text-lg"></span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500">Sign in to your enterprise account</p>
          </div>

          {/* Lock Message */}
          {lockMessage && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start">
              <AlertCircle className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-amber-700">{lockMessage}</span>
            </div>
          )}

          {/* Role Selection - Professional Tabs */}
          <div className="mb-8">
            <div className="bg-slate-50 p-1 rounded-lg inline-flex w-full">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all flex items-center justify-center space-x-2 ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition text-sm"
                  placeholder="you@hospital.com"
                  required
                  disabled={isLocked}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition text-sm"
                  placeholder="Enter your password"
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
                  className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                />
                <span className="ml-2 text-sm text-slate-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-sm text-slate-600 hover:text-slate-900 font-medium"
              >
                Use demo credentials
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || isLocked}
              className="w-full bg-slate-900 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-slate-800 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                'Sign in'
              )}
            </button>

            {/* Social Login */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-slate-400">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-medium text-slate-700">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-medium text-slate-700">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.38-1.07-.5-2.05-.5-3.2 0-1.47.65-2.22.5-3.2-.38C4.87 17.23 5.53 11.5 9.1 11.1c1.35-.12 2.35.9 3.1.9.75 0 1.98-.98 3.2-.8 1.78.18 2.93 1.6 2.93 1.6-.57.35-1.74 1.5-1.7 2.85.04 1.57 1.3 2.65 1.3 2.65s-1.03 2.53-2.48 3.98zM12.03 7.25c-.7-.82-1.3-1.9-1.1-3 .9-.05 2.03.52 2.68 1.3.7.85 1.1 1.9.9 3-.9.1-2.03-.5-2.68-1.3z"/>
                </svg>
                Apple
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <Link to="/" className="text-sm text-slate-500 hover:text-slate-900">
              ← Return to homepage
            </Link>
            <div className="mt-4 text-xs text-slate-400">
              © 2024 ApolloGuard, Inc. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;