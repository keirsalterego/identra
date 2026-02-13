import { useState, useEffect } from "react";
import { Shield, Brain, Lock, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [setupComplete, setSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    {
      title: "Welcome to Identra",
      subtitle: "Your Personal AI Memory Vault",
      description: "Store your thoughts, memories, and ideas securely. Access them anytime with AI-powered search.",
      icon: Sparkles,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "100% Private",
      subtitle: "Your Data Never Leaves Your Device",
      description: "Everything is encrypted and stored locally on your computer. No cloud, no tracking, no data collection.",
      icon: Lock,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "AI-Powered Memory",
      subtitle: "Find Anything Instantly",
      description: "Use natural language to search your memories. Ask questions and get intelligent answers from your own data.",
      icon: Brain,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Let's Get Started",
      subtitle: "What should we call you?",
      description: "This helps personalize your experience. You can change this anytime in settings.",
      icon: Shield,
      color: "from-orange-500 to-red-500",
      input: true
    }
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;
  const isLastStep = step === steps.length - 1;

  const handleNext = async () => {
    if (isLastStep) {
      setIsLoading(true);
      try {
        // Initialize session with user name
        await invoke("initialize_session", { 
          username: name || "User" 
        });
        
        setSetupComplete(true);
        
        // Save onboarding completion
        localStorage.setItem("identra-onboarded", "true");
        localStorage.setItem("identra-username", name || "User");
        
        setTimeout(() => {
          onComplete();
        }, 1500);
      } catch (error) {
        console.error("Setup failed:", error);
        alert("Setup failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("identra-onboarded", "true");
    onComplete();
  };

  if (setupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-identra-bg via-identra-secondary/5 to-identra-bg flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center animate-scale-in">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-identra-text mb-2">All Set!</h2>
          <p className="text-identra-text-secondary">Welcome to Identra, {name || "friend"} ✨</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-identra-bg via-identra-secondary/5 to-identra-bg flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-center gap-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === step ? 'w-12 bg-gradient-to-r ' + currentStep.color : 
                  idx < step ? 'w-8 bg-identra-primary' : 'w-8 bg-identra-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-identra-surface border border-identra-border rounded-2xl p-10 shadow-2xl backdrop-blur-xl">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentStep.color} flex items-center justify-center animate-float`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-identra-text to-identra-text-secondary bg-clip-text text-transparent mb-2">
            {currentStep.title}
          </h1>
          
          {/* Subtitle */}
          <p className={`text-center font-medium bg-gradient-to-r ${currentStep.color} bg-clip-text text-transparent mb-4`}>
            {currentStep.subtitle}
          </p>

          {/* Description */}
          <p className="text-center text-identra-text-secondary text-lg mb-8">
            {currentStep.description}
          </p>

          {/* Input Field (Last Step) */}
          {currentStep.input && (
            <div className="mb-8">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-6 py-4 bg-identra-bg border border-identra-border rounded-xl text-identra-text placeholder-identra-text-tertiary focus:outline-none focus:border-identra-primary transition-colors text-center text-lg"
                autoFocus
                onKeyPress={(e) => e.key === "Enter" && handleNext()}
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            {!isLastStep && (
              <button
                onClick={handleSkip}
                className="px-6 py-3 text-identra-text-tertiary hover:text-identra-text transition-colors"
              >
                Skip
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={isLoading || (isLastStep && !name.trim())}
              className={`flex-1 px-8 py-4 bg-gradient-to-r ${currentStep.color} text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                "Setting up..."
              ) : isLastStep ? (
                <>
                  Get Started
                  <CheckCircle2 className="w-5 h-5" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-center text-identra-text-tertiary text-sm mt-6">
          Press CMD+K anywhere to open the quick launcher
        </p>
      </div>
    </div>
  );
}
