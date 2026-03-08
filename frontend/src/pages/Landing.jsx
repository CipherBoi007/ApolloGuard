import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Shield, 
  Brain, 
  Users, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  HeartPulse,
  Stethoscope,
  UserCircle,
  Building2,
  Award,
  PlayCircle,
  AlertCircle
} from 'lucide-react';

// Button Component
const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2",
    outline: "bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2",
    ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2",
    light: "bg-white text-slate-900 hover:bg-slate-100 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900",
    outlineLight: "bg-transparent text-white border border-white/30 hover:bg-white/10 hover:border-white/50 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  return (
    <button className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Landing = () => {
  const features = [
    {
      icon: <Brain className="w-5 h-5 text-slate-600" />,
      title: 'AI Disease Prediction',
      description: 'Machine learning models trained on millions of clinical cases for accurate early detection.',
      metric: '94% accuracy'
    },
    {
      icon: <Activity className="w-5 h-5 text-slate-600" />,
      title: 'Patient Monitoring',
      description: 'Real-time vitals tracking with intelligent alerts for critical changes.',
      metric: '< 2sec latency'
    },
    {
      icon: <Shield className="w-5 h-5 text-slate-600" />,
      title: 'HIPAA Compliant',
      description: 'Enterprise-grade security with end-to-end encryption and audit trails.',
      metric: '100% compliant'
    },
    {
      icon: <Users className="w-5 h-5 text-slate-600" />,
      title: 'Care Coordination',
      description: 'Seamless collaboration between physicians, nurses, and patients.',
      metric: '10k+ users'
    }
  ];

  const roleCards = [
    {
      role: 'doctor',
      title: 'For Physicians',
      description: 'Advanced diagnostic tools and patient management',
      icon: Stethoscope,
      benefits: [
        'AI-assisted diagnosis with 94% accuracy',
        'Comprehensive patient history',
        'Treatment planning tools',
        'Research integration'
      ],
      stats: '2,500+ active physicians',
      cta: 'Access Doctor Portal'
    },
    {
      role: 'nurse',
      title: 'For Nurses',
      description: 'Streamlined patient care and documentation',
      icon: HeartPulse,
      benefits: [
        'Real-time vital signs tracking',
        'Medication management',
        'Care plan coordination',
        'Team communication'
      ],
      stats: '5,000+ registered nurses',
      cta: 'Access Nurse Portal'
    },
    {
      role: 'patient',
      title: 'For Patients',
      description: 'Take control of your health journey',
      icon: UserCircle,
      benefits: [
        'Secure health records access',
        'Appointment scheduling',
        'Treatment insights',
        'Health monitoring'
      ],
      stats: '50,000+ patients',
      cta: 'Access Patient Portal'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Chief of Cardiology',
      institution: 'Stanford Medical Center',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      quote: "The prediction accuracy has transformed how we approach early intervention. We've seen a 40% reduction in late-stage diagnoses.",
      yearsUsing: 3
    },
    {
      name: 'Michael Rodriguez, RN',
      role: 'ICU Head Nurse',
      institution: 'Johns Hopkins Hospital',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      quote: 'The real-time monitoring alerts have helped us prevent critical situations. Essential tool for modern nursing.',
      yearsUsing: 2
    },
    {
      name: 'Emily Thompson',
      role: 'Patient',
      institution: 'Diabetes Management Program',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      quote: 'Having access to my health data and understanding my risks has been empowering. I feel more in control of my health.',
      yearsUsing: 1
    },
    {
      name: 'Dr. James Wilson',
      role: 'Medical Director',
      institution: 'Community Health Network',
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      quote: 'Implementation was seamless and the ROI was evident within months. Our staff productivity increased by 35%.',
      yearsUsing: 2
    }
  ];

  const stats = [
    { value: '500K+', label: 'Clinical Predictions', icon: Brain },
    { value: '7,500+', label: 'Healthcare Providers', icon: Users },
    { value: '500+', label: 'Hospitals', icon: Building2 },
    { value: '98%', label: 'User Satisfaction', icon: TrendingUp }
  ];

  const integrations = [
    { name: 'Epic', logo: '🏥' },
    { name: 'Cerner', logo: '📊' },
    { name: 'Allscripts', logo: '📋' },
    { name: 'Meditech', logo: '💻' },
    { name: 'Athenahealth', logo: '🔄' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Navigation */}
      <nav className="fixed top-0 w-full bg-white border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <HeartPulse className="w-6 h-6 text-slate-900" />
              <span className="text-lg font-semibold text-slate-900">ApolloGuard</span>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full ml-2">HIPAA</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Features</a>
              <a href="#solutions" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Solutions</a>
              <a href="#testimonials" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Testimonials</a>
              <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
            </div>

            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/login">
                <Button variant="primary" size="sm">Access Portal</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Background image with overlay */}
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80")`,
        }}>
          <div className="absolute inset-0 bg-slate-900/70"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-white">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 mb-6 border border-white/20">
                <span className="text-xs font-medium text-white">For healthcare professionals</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                AI-powered disease prediction for better patient outcomes
              </h1>
              
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                Join 7,500+ healthcare providers using machine learning to detect diseases earlier, 
                reduce diagnostic errors, and improve care coordination.
              </p>

              {/* Fixed Hero Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link to="/login">
                  <Button 
                    variant="light" 
                    size="lg" 
                    className="min-w-[180px] shadow-lg hover:shadow-xl"
                  >
                    Access Portal
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <button className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 hover:border-white/50 transition-all duration-200">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Watch demo
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">HIPAA Compliant</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-white/40"></div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">FDA Registered</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-white/40"></div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span className="font-medium">SOC 2 Type II</span>
                </div>
              </div>
            </div>
          
            {/* Right Column - Dashboard Preview */}
            <div className="relative">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                {/* Dashboard Header */}
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-xs font-medium text-slate-500">Clinical Dashboard</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-slate-300 rounded-full"></div>
                      <span className="text-xs text-slate-600">Dr. Sarah Chen</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-4">
                  {/* Top Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <div className="text-xs text-slate-500 mb-1">At-risk patients</div>
                      <div className="text-lg font-semibold text-slate-900">24</div>
                      <div className="text-xs text-amber-600 mt-1">↑ +3 today</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <div className="text-xs text-slate-500 mb-1">Predictions</div>
                      <div className="text-lg font-semibold text-slate-900">156</div>
                      <div className="text-xs text-emerald-600 mt-1">94% accuracy</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <div className="text-xs text-slate-500 mb-1">Pending reviews</div>
                      <div className="text-lg font-semibold text-slate-900">8</div>
                      <div className="text-xs text-blue-600 mt-1">3 urgent</div>
                    </div>
                  </div>

                  {/* Chart Area */}
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-600">Risk Trends</span>
                      <span className="text-xs text-slate-400">Last 7 days</span>
                    </div>
                    <div className="h-20 flex items-end space-x-1">
                      {[12, 16, 8, 20, 14, 10, 16].map((height, i) => (
                        <div key={i} className="flex-1 bg-blue-200 rounded-t" style={{ height: `${height}px` }}></div>
                      ))}
                    </div>
                  </div>

                  {/* Patient List Preview */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-700">Recent patients</span>
                      <span className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer">View all →</span>
                    </div>
                    
                    <div className="space-y-2">
                      {[
                        { initials: 'JD', name: 'James Wilson', mrn: '3847', age: '67', gender: 'Male', risk: 'High', riskColor: 'amber' },
                        { initials: 'MC', name: 'Maria Chen', mrn: '2915', age: '52', gender: 'Female', risk: 'Stable', riskColor: 'emerald' },
                        { initials: 'RP', name: 'Robert Patel', mrn: '4562', age: '71', gender: 'Male', risk: 'Monitoring', riskColor: 'blue' }
                      ].map((patient, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-slate-600">{patient.initials}</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900">{patient.name}</div>
                              <div className="text-xs text-slate-500">MRN: {patient.mrn} • {patient.age}y • {patient.gender}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`text-xs px-2 py-1 bg-${patient.riskColor}-100 text-${patient.riskColor}-700 rounded-full`}>
                              {patient.risk}
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Alert */}
              <div className="absolute -bottom-3 -right-3 bg-white rounded-lg shadow-lg border border-slate-200 p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-slate-700">3 new alerts</span>
                  <AlertCircle className="w-3 h-3 text-slate-400 ml-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-sm text-slate-600 flex items-center justify-center mt-1">
                    <Icon className="w-4 h-4 mr-1 text-slate-400" />
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything you need in one platform
            </h2>
            <p className="text-lg text-slate-600">
              Comprehensive tools designed specifically for healthcare professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{feature.description}</p>
                <div className="text-xs font-medium text-slate-500">{feature.metric}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Solutions */}
      <section id="solutions" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Solutions for every role
            </h2>
            <p className="text-lg text-slate-600">
              Tailored experiences for physicians, nurses, and patients
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {roleCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-slate-700" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{card.title}</h3>
                  <p className="text-sm text-slate-600 mb-4">{card.description}</p>
                  
                  <ul className="space-y-2 mb-6">
                    {card.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0 mt-0.5" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="text-xs text-slate-500 mb-4">
                    {card.stats}
                  </div>
                  
                  <Link to={`/login?role=${card.role}`}>
                    <Button variant="outline" className="w-full">
                      {card.cta}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Trusted by healthcare leaders
            </h2>
            <p className="text-lg text-slate-600">
              Real stories from real professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-slate-200"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                    <p className="text-xs text-slate-600">{testimonial.role}</p>
                    <p className="text-xs text-slate-500">{testimonial.institution}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Using for {testimonial.yearsUsing} years</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Seamless integrations
            </h2>
            <p className="text-slate-600">
              Connects with your existing EHR systems
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8">
            {integrations.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200">
                <span className="text-2xl">{item.logo}</span>
                <span className="font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start improving patient outcomes today
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Join thousands of healthcare providers already using ApolloGuard
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login?role=doctor">
              <Button 
                variant="light" 
                size="lg" 
                className="min-w-[200px] shadow-lg hover:shadow-xl"
              >
                I'm a physician
              </Button>
            </Link>
            <Link to="/login?role=nurse">
              <Button 
                variant="outlineLight" 
                size="lg" 
                className="min-w-[200px]"
              >
                I'm a nurse
              </Button>
            </Link>
            <Link to="/login?role=patient">
              <Button 
                variant="outlineLight" 
                size="lg" 
                className="min-w-[200px]"
              >
                I'm a patient
              </Button>
            </Link>
          </div>
          <p className="text-sm text-white/60 mt-4">
            Secure access for healthcare professionals and patients
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <HeartPulse className="w-5 h-5 text-slate-900" />
                <span className="font-semibold text-slate-900">ApolloGuard</span>
              </div>
              <p className="text-sm text-slate-600">
                © 2024 ApolloGuard Inc.<br />
                All rights reserved.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#features" className="hover:text-slate-900">Features</a></li>
                <li><a href="#pricing" className="hover:text-slate-900">Pricing</a></li>
                <li><a href="#" className="hover:text-slate-900">Integrations</a></li>
                <li><a href="#" className="hover:text-slate-900">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-slate-900">About</a></li>
                <li><a href="#" className="hover:text-slate-900">Blog</a></li>
                <li><a href="#" className="hover:text-slate-900">Careers</a></li>
                <li><a href="#" className="hover:text-slate-900">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-slate-900">Privacy</a></li>
                <li><a href="#" className="hover:text-slate-900">Terms</a></li>
                <li><a href="#" className="hover:text-slate-900">HIPAA</a></li>
                <li><a href="#" className="hover:text-slate-900">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
            <p>HIPAA compliant • SOC 2 Type II • 256-bit encryption • FDA registered</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;