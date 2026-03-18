import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Utensils, ShoppingBag, Music, ArrowRight, ArrowLeft, Sparkles, Users, ShieldCheck, MapPin, Star, TrendingUp, Zap, ChevronRight } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";
import heroEateriesCutout from "@/assets/hero-eateries-cutout.png";
import heroMarketCutout from "@/assets/hero-market-cutout.png";
import heroNightlifeCutout from "@/assets/hero-nightlife-cutout.png";

const steps = [
  {
    title: "Welcome to GO",
    subtitle: "Your gateway to the best of Gulu City",
    description: "GO is a vibrant community that connects you with everything amazing happening in Gulu City — eateries, marketplace, and nightlife.",
    image: null,
    accent: "primary",
  },
  {
    icon: Utensils,
    emoji: "🍗",
    title: "The Finest Eateries",
    subtitle: "Discover top restaurants in Gulu City",
    description: "From authentic local Acholi cuisine to modern dining — find, review, and enjoy the best restaurants Gulu City has to offer.",
    image: heroEateriesCutout,
    accent: "primary",
  },
  {
    icon: ShoppingBag,
    emoji: "🛒",
    title: "Explore the Marketplace",
    subtitle: "Unbeatable deals at your fingertips",
    description: "Browse products from local sellers — brand new, refurbished, and pre-owned items all in one vibrant marketplace.",
    image: heroMarketCutout,
    accent: "primary",
  },
  {
    icon: Music,
    emoji: "🎶",
    title: "Coolest Night & Leisure Spots",
    subtitle: "Vibe in the hottest spots in Gulu City",
    description: "Discover bars, clubs, lounges, and leisure venues where Gulu City comes alive — from chill hangouts to electric nightlife.",
    image: heroNightlifeCutout,
    accent: "primary",
  },
  {
    title: "Join the Community",
    subtitle: "How do you want to be part of GO?",
    description: "Select your role to get started. Your role unlocks special capabilities.",
    image: null,
    isRoleSelection: true,
    accent: "primary",
  },
];

const roles = [
  {
    value: "buyer" as const,
    label: "Explorer",
    description: "Browse venues, shop the marketplace, and discover the best of Gulu City",
    icon: MapPin,
    emoji: "🔍",
  },
  {
    value: "seller" as const,
    label: "Vendor",
    description: "List and sell your products to the GO community",
    icon: ShoppingBag,
    emoji: "🏪",
  },
  {
    value: "venue_owner" as const,
    label: "Venue Owner",
    description: "Showcase your restaurant, bar, or leisure spot to thousands",
    icon: Utensils,
    emoji: "🏢",
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<"buyer" | "seller" | "venue_owner">("buyer");

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  const handleNext = () => {
    if (isLast) {
      navigate("/auth", { state: { selectedRole } });
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (isFirst) {
      navigate("/");
    } else {
      setCurrentStep((s) => s - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background organic blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute -top-20 -left-20 w-[500px] h-[500px] lg:w-[700px] lg:h-[700px]" viewBox="0 0 600 600" fill="none">
          <path d="M300 50C400 50 520 120 550 220C580 320 530 400 480 470C430 540 350 580 260 560C170 540 100 480 60 400C20 320 30 220 80 150C130 80 200 50 300 50Z" fill="hsl(var(--primary))" opacity="0.08"/>
        </svg>
        <svg className="absolute -bottom-32 -right-32 w-[500px] h-[500px] lg:w-[600px] lg:h-[600px]" viewBox="0 0 600 600" fill="none">
          <path d="M250 80C350 60 450 100 500 180C550 260 540 360 480 430C420 500 330 540 240 520C150 500 80 440 50 360C20 280 40 180 100 120C160 60 200 90 250 80Z" fill="hsl(var(--primary))" opacity="0.06"/>
        </svg>
        {/* Decorative dots */}
        <div className="absolute top-[20%] right-[15%] w-3 h-3 rounded-full bg-primary/20" />
        <div className="absolute top-[40%] left-[8%] w-2 h-2 rounded-full bg-primary/15" />
        <div className="absolute bottom-[25%] right-[25%] w-2 h-2 rounded-full bg-primary/25" />
        <div className="absolute top-[60%] right-[10%] w-4 h-4 rounded-full bg-primary/10" />
        {/* Dashed decorative line */}
        <svg className="absolute top-[30%] right-[5%] w-[200px] h-[150px] hidden md:block" viewBox="0 0 200 150" fill="none">
          <path d="M10 80 C50 20, 100 130, 150 50 S190 90, 190 70" stroke="hsl(var(--foreground))" strokeWidth="1" strokeDasharray="5 5" fill="none" opacity="0.1"/>
        </svg>
      </div>

      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-4 sm:px-8 pt-6 pb-4">
        <button onClick={() => navigate("/")} className="text-2xl font-black text-primary tracking-tight">
          GO
        </button>
        <div className="flex items-center gap-2">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentStep
                  ? "w-8 bg-primary"
                  : i < currentStep
                  ? "w-4 bg-primary/40"
                  : "w-2 bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-bold text-muted-foreground">{currentStep + 1}/{steps.length}</span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center relative z-10 px-4 sm:px-8 pb-8 gap-4 sm:gap-6 lg:gap-12 max-w-6xl mx-auto w-full">
        
        {/* Left: Text content */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-lg order-2 lg:order-1">
          {/* Step badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/20 text-primary text-xs font-bold mb-5">
            {step.icon ? (
              <>
                <step.icon className="w-3.5 h-3.5" />
                {step.subtitle}
              </>
            ) : isFirst ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Welcome aboard
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                Almost there
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter leading-[0.9] text-foreground mb-3">
            {step.title}
          </h1>

          {/* Subtitle */}
          <p className="text-primary font-bold text-sm sm:text-base mb-3">{step.subtitle}</p>

          {/* Description */}
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6 max-w-md">
            {step.description}
          </p>

          {/* Welcome step stats */}
          {isFirst && (
            <div className="flex items-center gap-4 sm:gap-6 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-black text-foreground">1K+</div>
                  <div className="text-[10px] text-muted-foreground">Members</div>
                </div>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                </div>
                <div>
                  <div className="text-sm font-black text-foreground">4.8</div>
                  <div className="text-[10px] text-muted-foreground">Rating</div>
                </div>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-black text-foreground">50+</div>
                  <div className="text-[10px] text-muted-foreground">Venues</div>
                </div>
              </div>
            </div>
          )}

          {/* Role selection */}
          {step.isRoleSelection && (
            <RadioGroup
              value={selectedRole}
              onValueChange={(v: "buyer" | "seller" | "venue_owner") => setSelectedRole(v)}
              className="space-y-3 w-full mb-6"
            >
              {roles.map((role) => (
                <label
                  key={role.value}
                  htmlFor={`role-${role.value}`}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedRole === role.value
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/10 scale-[1.02]"
                      : "border-border/30 bg-card/50 hover:border-primary/30 hover:bg-card/80"
                  }`}
                >
                  <RadioGroupItem value={role.value} id={`role-${role.value}`} className="sr-only" />
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-all duration-300 ${
                    selectedRole === role.value ? "bg-primary/20 scale-110" : "bg-muted/50"
                  }`}>
                    {role.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-foreground">{role.label}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{role.description}</div>
                  </div>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    selectedRole === role.value 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted/30 text-muted-foreground"
                  }`}>
                    {selectedRole === role.value ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </div>
                </label>
              ))}
            </RadioGroup>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center gap-3 w-full">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-12 rounded-full font-bold border-border"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {isFirst ? "Home" : "Back"}
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 h-12 rounded-full font-bold shadow-lg shadow-primary/25 group"
            >
              {isLast ? (user ? "Get Started" : "Sign Up Now") : "Next"}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Already have account */}
          {isLast && !user && (
            <p className="text-center lg:text-left w-full text-sm text-muted-foreground mt-4">
              Already a member?{" "}
              <button onClick={() => navigate("/auth")} className="text-primary font-bold hover:underline">
                Sign In
              </button>
            </p>
          )}
        </div>

        {/* Right: Visual */}
        <div className="flex-1 flex items-center justify-center w-full order-1 lg:order-2">
          <div className="relative w-full aspect-square max-w-[220px] sm:max-w-[280px] md:max-w-[340px] lg:max-w-[440px]">
            {/* Green ellipse base */}
            <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[80%] h-[25%] rounded-[50%] bg-primary/12 blur-xl" />
            <div className="absolute bottom-[7%] left-1/2 -translate-x-1/2 w-[55%] h-[12%] rounded-[50%] bg-primary/25 blur-sm" />
            <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[35%] h-[6%] rounded-[50%] bg-primary/40" />

            {/* Feature step images */}
            {step.image ? (
              <img
                key={currentStep}
                src={step.image}
                alt={step.title}
                className="absolute inset-0 w-full h-full object-contain object-bottom [filter:drop-shadow(0_0_2px_hsl(var(--secondary)))_drop-shadow(0_0_4px_hsl(var(--secondary)))_drop-shadow(0_20px_40px_rgba(0,0,0,0.25))] animate-[slideUp_0.6s_ease-out]"
              />
            ) : isFirst ? (
              /* Welcome step - GO logo visual */
              <div className="absolute inset-0 flex items-center justify-center animate-[scaleIn_0.6s_ease-out]">
                <div className="relative">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
                    <div className="text-center">
                      <div className="text-5xl sm:text-6xl font-black text-primary-foreground leading-none">GO</div>
                      <div className="text-[10px] sm:text-xs font-bold text-primary-foreground/70 mt-1">COMMUNITY</div>
                    </div>
                  </div>
                  <div className="absolute -inset-5 rounded-full border-2 border-dashed border-primary/30 animate-spin" style={{ animationDuration: '20s' }} />
                  <div className="absolute -inset-10 rounded-full border border-dashed border-primary/15 animate-spin" style={{ animationDuration: '30s', animationDirection: 'reverse' }} />
                  
                  {/* Floating mini badges */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-xl bg-card/90 backdrop-blur border border-border/50 flex items-center justify-center shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
                    <span className="text-xl">🍗</span>
                  </div>
                  <div className="absolute -bottom-2 -left-6 w-12 h-12 rounded-xl bg-card/90 backdrop-blur border border-border/50 flex items-center justify-center shadow-lg animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
                    <span className="text-xl">🛒</span>
                  </div>
                  <div className="absolute top-1/2 -right-8 w-12 h-12 rounded-xl bg-card/90 backdrop-blur border border-border/50 flex items-center justify-center shadow-lg animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                    <span className="text-xl">🎶</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Role selection step */
              <div className="absolute inset-0 flex items-center justify-center animate-[scaleIn_0.6s_ease-out]">
                <div className="relative">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center">
                    <ShieldCheck className="w-16 h-16 sm:w-20 sm:h-20 text-primary" />
                  </div>
                  <div className="absolute -inset-4 rounded-full border-2 border-dashed border-primary/20 animate-spin" style={{ animationDuration: '20s' }} />
                  
                  {/* Role emoji badges */}
                  {roles.map((role, i) => {
                    const positions = [
                      "-top-3 left-1/2 -translate-x-1/2",
                      "-bottom-3 -left-3",
                      "-bottom-3 -right-3",
                    ];
                    return (
                      <div 
                        key={role.value}
                        className={`absolute ${positions[i]} w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${
                          selectedRole === role.value 
                            ? "bg-primary text-primary-foreground scale-110 shadow-primary/30" 
                            : "bg-card/90 backdrop-blur border border-border/50"
                        }`}
                      >
                        <span className="text-2xl">{role.emoji}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Floating GO badge for feature steps */}
            {step.image && (
              <div className="absolute top-2 right-2 z-20">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <div className="text-center">
                    <span className="text-[10px] font-black text-primary-foreground leading-none block">GO</span>
                    <span className="text-[6px] font-bold text-primary-foreground/70">COMMUNITY</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
