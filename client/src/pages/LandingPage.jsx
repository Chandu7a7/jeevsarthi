import { Link, useNavigate } from 'react-router-dom';
import { Activity, Shield, Bell, QrCode, Globe, ArrowRight } from "lucide-react";
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleNavigate = (page) => {
    navigate(`/${page}`);
  };

  const features = [
    {
      icon: Activity,
      title: "AI Predictions",
      description: "Smart predictions for AMU and MRL compliance using advanced AI algorithms"
    },
    {
      icon: Shield,
      title: "Blockchain Traceability",
      description: "Immutable records ensuring complete transparency and data integrity"
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Real-time notifications for withdrawal periods and compliance violations"
    },
    {
      icon: QrCode,
      title: "QR Verification",
      description: "Quick verification of animal health records and treatment history"
    },
    {
      icon: Globe,
      title: "Multi-language UI",
      description: "Support for Hindi, Marathi, Gujarati, and English languages"
    },
    {
      icon: Shield,
      title: "Government Grade Security",
      description: "Enterprise-level security for sensitive livestock health data"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Logo size="large" />
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="rounded-[12px]"
                onClick={() => handleNavigate("login")}
              >
                Login
              </Button>
              <Button 
                className="bg-[#2E7D32] hover:bg-[#1B5E20] rounded-[12px]"
                onClick={() => handleNavigate("register")}
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-green-100 text-[#2E7D32] px-4 py-2 rounded-full mb-6 text-sm font-medium">
              AI + Blockchain Powered Platform
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              JEEVSARTHI — AI-Powered Livestock Health Portal
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Monitor AMU (Antimicrobial Usage), MRL (Maximum Residue Limits) & improve food safety 
              using AI + Blockchain technology. Built for farmers, veterinarians, labs, and regulators.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-[#2E7D32] hover:bg-[#1B5E20] rounded-[12px] text-white"
                onClick={() => handleNavigate("register")}
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-[12px]"
                onClick={() => handleNavigate("login")}
              >
                View Dashboard
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-[#2E7D32] to-[#1976D2] rounded-[24px] p-8 text-white">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur rounded-[16px] p-4">
                  <Activity className="w-8 h-8 mb-2" />
                  <p className="font-medium">Real-time Monitoring</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-[16px] p-4">
                  <Shield className="w-8 h-8 mb-2" />
                  <p className="font-medium">Blockchain Security</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-[16px] p-4">
                  <Bell className="w-8 h-8 mb-2" />
                  <p className="font-medium">Smart Alerts</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-[16px] p-4">
                  <QrCode className="w-8 h-8 mb-2" />
                  <p className="font-medium">QR Verification</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600">
              Everything you need for comprehensive livestock health monitoring
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="bg-gray-50 rounded-[16px] p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="bg-[#2E7D32] w-12 h-12 rounded-[12px] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-[#2E7D32] to-[#1976D2] rounded-[24px] p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Livestock Health Management?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of farmers, veterinarians, and regulators using JEEVSARTHI
            </p>
            <Button 
              size="lg" 
              className="bg-white text-[#2E7D32] hover:bg-gray-100 rounded-[12px] font-semibold"
              onClick={() => handleNavigate("register")}
            >
              Get Started Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Logo size="large" />
          <p className="mt-4 text-gray-400">
            Developed by Team Cattle-Coders | SIH 2025
          </p>
          <p className="mt-2 text-gray-500 text-sm">
            © 2025 JEEVSARTHI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
