import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Video, MessageCircle, Shield, Clock, Star } from 'lucide-react';
import { Button } from '../components/ui/button';

const Landing = () => {
  return (
    <div data-testid="landing-page" className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-transparent to-teal-100/50 -z-10" />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Your Health,
                <span className="block bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Our Priority
                </span>
              </h1>
              <p className="text-lg text-gray-600 max-w-xl">
                Connect with top healthcare professionals instantly. Book appointments, consult via video, and manage your health all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button data-testid="get-started-btn" className="btn-primary text-lg px-8 py-6">
                    Get Started
                  </Button>
                </Link>
                <Link to="/doctors">
                  <Button data-testid="browse-doctors-btn" className="btn-secondary text-lg px-8 py-6">
                    Browse Doctors
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center space-x-8 pt-4">
                <div>
                  <p className="text-3xl font-bold text-blue-600">500+</p>
                  <p className="text-sm text-gray-600">Verified Doctors</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-teal-600">10k+</p>
                  <p className="text-sm text-gray-600">Happy Patients</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">4.8</p>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&h=800&fit=crop"
                  alt="Healthcare Professional"
                  className="rounded-3xl shadow-2xl w-full h-[600px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-teal-400/20 rounded-full blur-3xl" />
              <div className="absolute -top-6 -left-6 w-48 h-48 bg-gradient-to-br from-teal-400/20 to-blue-400/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Why Choose MedConnect?</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Experience healthcare like never before with our comprehensive platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Calendar className="w-8 h-8" />,
                title: 'Easy Booking',
                description: 'Book appointments with top doctors in just a few clicks. Real-time availability updates.',
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: <Video className="w-8 h-8" />,
                title: 'Video Consultations',
                description: 'Connect face-to-face with healthcare professionals from anywhere via secure video calls.',
                color: 'from-teal-500 to-teal-600'
              },
              {
                icon: <MessageCircle className="w-8 h-8" />,
                title: 'Instant Chat',
                description: 'Real-time messaging with your doctor for quick questions and follow-ups.',
                color: 'from-blue-500 to-teal-500'
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Secure & Private',
                description: 'Your health data is encrypted and protected. Complete HIPAA compliance.',
                color: 'from-teal-600 to-blue-600'
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: '24/7 Availability',
                description: 'Access healthcare services anytime. Emergency consultations available.',
                color: 'from-blue-600 to-teal-500'
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: 'Verified Professionals',
                description: 'All doctors are thoroughly verified with proper credentials and experience.',
                color: 'from-teal-500 to-blue-500'
              }
            ].map((feature, index) => (
              <div key={index} className="card group hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 text-lg">Get started in three simple steps</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create Account',
                description: 'Sign up in seconds with your email or social accounts'
              },
              {
                step: '02',
                title: 'Find Your Doctor',
                description: 'Browse through verified doctors and book an appointment'
              },
              {
                step: '03',
                title: 'Start Consultation',
                description: 'Connect via video call or chat and get expert advice'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="card text-center">
                  <div className="text-6xl font-bold text-blue-100 mb-4">{item.step}</div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-teal-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 via-blue-500 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied patients and start your journey to better health today
          </p>
          <Link to="/register">
            <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-6">
            <span className="text-3xl font-bold text-white">MedConnect</span>
          </div>
          <p className="mb-4">© 2025 MedConnect. All rights reserved.</p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;