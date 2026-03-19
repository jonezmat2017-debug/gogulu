import { Search, Utensils, ShoppingBag, Sparkles, ArrowRight, Star, Music, TrendingUp, ChevronRight, X, Zap, Leaf } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import heroEateriesCutout from "@/assets/hero-eateries-cutout.png";
import heroMarketCutout from "@/assets/hero-market-cutout.png";
import heroNightlifeCutout from "@/assets/hero-nightlife-cutout.png";
import heroEateries from "@/assets/hero-eateries.jpg";
import heroMarket from "@/assets/hero-market.jpg";
import heroVibingGuy from "@/assets/hero-vibing-guy.jpg";

const words = ["Eat", "Shop", "Vibe"];

interface HeroProps {
  onCategorySelect?: (category: string | null) => void;
  activeCategory?: string | null;
}

const Hero = ({ onCategorySelect, activeCategory }: HeroProps) => {
  const [currentWord, setCurrentWord] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentWord((prev) => {
          const next = (prev + 1) % words.length;
          setActiveImage(next);
          return next;
        });
        setIsAnimating(false);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleCategoryClick = (filter: string) => {
    if (onCategorySelect) {
      onCategorySelect(activeCategory === filter ? null : filter);
    }
  };

  const cutoutImages = [heroEateriesCutout, heroMarketCutout, heroNightlifeCutout];

  const categories = [
    { 
      icon: Utensils, 
      label: "Eateries", 
      filter: "eatery", 
      description: "Top restaurants & local cuisine",
      image: heroEateries,
      stat: "20+",
      statLabel: "Restaurants",
    },
    { 
      icon: ShoppingBag, 
      label: "Marketplace", 
      filter: "market",
      description: "Unbeatable deals from sellers",
      image: heroMarket,
      stat: "100+",
      statLabel: "Products",
    },
    { 
      icon: Music, 
      label: "Nightspots", 
      filter: "night_spot",
      description: "Bars, clubs & leisure spots",
      image: heroVibingGuy,
      stat: "15+",
      statLabel: "Venues",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[hsl(0,0%,96%)] dark:bg-secondary">
      {/* === GREEN ORGANIC BLOB SHAPES === */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large green blob - right side */}
        <svg className="absolute -right-10 top-0 w-[70%] sm:w-[60%] lg:w-[55%] h-full" viewBox="0 0 600 700" fill="none" preserveAspectRatio="none">
          <path d="M200 0C300 0 450 40 530 140C610 240 620 350 580 450C540 550 450 630 350 680C250 700 180 680 120 620C60 560 20 470 10 370C0 270 30 170 90 100C150 30 170 0 200 0Z" fill="hsl(var(--primary))" opacity="0.15"/>
        </svg>
        {/* Medium blob - bottom right */}
        <svg className="absolute right-[5%] bottom-0 w-[50%] sm:w-[45%] lg:w-[40%] h-[70%]" viewBox="0 0 500 500" fill="none" preserveAspectRatio="none">
          <path d="M250 30C340 20 430 70 470 160C510 250 490 350 430 420C370 490 280 520 190 490C100 460 40 390 20 300C0 210 30 120 90 70C150 20 200 35 250 30Z" fill="hsl(var(--primary))" opacity="0.1"/>
        </svg>
        {/* Small accent dots */}
        <div className="absolute top-[15%] right-[30%] w-3 h-3 rounded-full bg-primary/30 hidden lg:block" />
        <div className="absolute top-[25%] right-[22%] w-2 h-2 rounded-full bg-primary/20 hidden lg:block" />
        <div className="absolute bottom-[30%] right-[45%] w-2 h-2 rounded-full bg-primary/25 hidden lg:block" />

        {/* === FLOWING SPIRAL WAVE LINES === */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 700" fill="none" preserveAspectRatio="xMidYMid slice">
          <style>{`
            @keyframes spiralFlow {
              0% { stroke-dashoffset: 0; }
              100% { stroke-dashoffset: -200; }
            }
            @keyframes spiralDrift {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-12px); }
            }
            .spiral-line {
              stroke-dasharray: 80 40;
              animation: spiralFlow 6s linear infinite;
            }
            .spiral-group-1 { animation: spiralDrift 8s ease-in-out infinite; }
            .spiral-group-2 { animation: spiralDrift 10s ease-in-out infinite 1s; }
          `}</style>
          <g className="spiral-group-1">
            <path className="spiral-line" d="M-50 400 C100 350, 200 200, 400 250 S600 450, 750 300 S950 100, 1100 200 S1250 400, 1300 350" 
              stroke="hsl(var(--primary))" strokeWidth="2" fill="none" opacity="0.5" style={{animationDuration: '6s'}}/>
            <path className="spiral-line" d="M-50 420 C120 370, 220 220, 420 270 S620 470, 770 320 S970 120, 1120 220 S1270 420, 1320 370" 
              stroke="hsl(var(--primary))" strokeWidth="1.6" fill="none" opacity="0.4" style={{animationDuration: '7s'}}/>
            <path className="spiral-line" d="M-50 440 C140 390, 240 240, 440 290 S640 490, 790 340 S990 140, 1140 240 S1290 440, 1340 390" 
              stroke="hsl(var(--primary))" strokeWidth="1.3" fill="none" opacity="0.32" style={{animationDuration: '8s'}}/>
          </g>
          <g className="spiral-group-2">
            <path className="spiral-line" d="M-50 460 C160 410, 260 260, 460 310 S660 510, 810 360 S1010 160, 1160 260 S1310 460, 1360 410" 
              stroke="hsl(var(--primary))" strokeWidth="1.2" fill="none" opacity="0.28" style={{animationDuration: '9s'}}/>
            <path className="spiral-line" d="M-50 480 C180 430, 280 280, 480 330 S680 530, 830 380 S1030 180, 1180 280 S1330 480, 1380 430" 
              stroke="hsl(var(--primary))" strokeWidth="1" fill="none" opacity="0.22" style={{animationDuration: '10s'}}/>
          </g>
          <path className="spiral-line spiral-group-1" d="M-50 400 C100 350, 200 200, 400 250 S600 450, 750 300 S950 100, 1100 200 S1250 400, 1300 350" 
            stroke="hsl(var(--primary))" strokeWidth="5" fill="none" opacity="0.12" filter="url(#spiralGlow)" style={{animationDuration: '6s'}}/>
          <g className="spiral-group-2">
            <path className="spiral-line" d="M-50 180 C150 130, 300 80, 500 150 S700 280, 850 180 S1050 50, 1250 130" 
              stroke="hsl(var(--primary))" strokeWidth="1.2" fill="none" opacity="0.2" style={{animationDuration: '11s'}}/>
            <path className="spiral-line" d="M-50 200 C170 150, 320 100, 520 170 S720 300, 870 200 S1070 70, 1270 150" 
              stroke="hsl(var(--primary))" strokeWidth="0.9" fill="none" opacity="0.16" style={{animationDuration: '12s'}}/>
          </g>
          <defs>
            <filter id="spiralGlow">
              <feGaussianBlur stdDeviation="6" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>

      {/* === CONTENT === */}
      <div className="container mx-auto px-4 pt-8 pb-4 sm:pt-10 sm:pb-6 md:pt-14 md:pb-8 lg:pt-16 lg:pb-10 relative z-10">
        
        {/* ========== MOBILE & TABLET ========== */}
        <div className="lg:hidden relative mb-6 sm:mb-8">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/20 text-primary text-xs font-bold mb-4">
              <Sparkles className="w-3 h-3" />
              Discover Gulu City
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-3">
              <span className="text-primary">Go</span>
              <span 
                className={`inline-block transition-all duration-500 ease-out min-w-[80px] sm:min-w-[100px] ${
                  isAnimating ? "opacity-0 translate-y-3 scale-90" : "opacity-100 translate-y-0 scale-100"
                }`}
              >
                {words[currentWord]}
              </span>
            </h1>

            <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-xs mb-5 leading-relaxed">
              Local eats, vibrant markets, and unforgettable nightlife — all in one place.
            </p>

            {/* Cutout image with layered arc circles */}
            <div className="relative w-full max-w-[320px] sm:max-w-[400px] md:max-w-[460px] h-[300px] sm:h-[380px] md:h-[440px] mb-5">
              {/* Outer large arc - accent color */}
              <div className="absolute bottom-[2%] left-1/2 -translate-x-[42%] w-[82%] aspect-square rounded-full bg-accent" />
              {/* Inner arc - dark overlay */}
              <div className="absolute bottom-[5%] left-1/2 -translate-x-[55%] w-[78%] aspect-square rounded-full bg-foreground dark:bg-card" />
              {/* Subtle glow */}
              <div className="absolute bottom-[3%] left-1/2 -translate-x-1/2 w-[80%] aspect-square rounded-full bg-accent/20 blur-2xl scale-110" />
              {/* Person image */}
              {cutoutImages.map((img, i) => (
                <img 
                  key={i}
                  src={img} 
                  alt="GO Community" 
                  className={`absolute inset-0 w-full h-full object-contain object-bottom drop-shadow-2xl transition-all duration-700 z-10 [filter:drop-shadow(0_0_1px_hsl(var(--secondary)))_drop-shadow(0_0_2px_hsl(var(--secondary)))] ${
                    activeImage === i 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-0 scale-95 translate-y-4'
                  }`}
                />
              ))}
              {/* Floating badge */}
              <div className="absolute -top-2 -right-2 sm:right-2 z-20">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                  {/* Animated orbiting dots */}
                  <div className="absolute inset-[-6px] animate-[spin_6s_linear_infinite]">
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
                  </div>
                  <div className="absolute inset-[-6px] animate-[spin_8s_linear_infinite_reverse]">
                    <span className="absolute top-[10%] left-[10%] w-1 h-1 rounded-full bg-primary/60" />
                    <span className="absolute bottom-[10%] right-[10%] w-1 h-1 rounded-full bg-accent/60" />
                  </div>
                  {/* Badge circle */}
                  <div className="w-full h-full rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/30 border-4 border-secondary">
                    <div className="text-center leading-tight relative">
                      <div className="relative inline-block">
                        <span className="text-[10px] sm:text-[11px] font-black text-primary-foreground">GO</span>
                        <Leaf className="absolute -top-1 -right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 text-green-400 fill-green-400 -rotate-45" />
                      </div>
                      <span className="text-[5px] sm:text-[6px] font-bold text-primary-foreground/80 tracking-wider block">COMMUNITY</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 mb-4">
              <Button onClick={() => { handleCategoryClick('eatery'); document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }); }} className="h-10 sm:h-11 px-5 sm:px-6 rounded-full font-bold shadow-lg shadow-primary/25 group">
                Explore Now
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" className="h-10 sm:h-11 px-5 sm:px-6 rounded-full font-bold border-border">
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1.5">
                  {[heroEateries, heroVibingGuy, heroMarket].map((img, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-secondary overflow-hidden">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <span className="text-xs font-bold text-foreground">1K+</span>
                <span className="text-[10px] text-muted-foreground">Users</span>
              </div>
              <div className="h-3 w-px bg-border" />
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-primary fill-primary" />
                <span className="text-xs font-bold text-foreground">4.8</span>
              </div>
              <div className="h-3 w-px bg-border" />
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-primary" />
                <span className="text-xs font-bold text-foreground">50+</span>
                <span className="text-[10px] text-muted-foreground">Venues</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========== DESKTOP ========== */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 items-center mb-12">
          {/* Left Column - Text */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-5 relative z-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/20 text-primary text-sm font-bold animate-[fadeInUp_0.6s_ease-out]">
              <Sparkles className="w-4 h-4" />
              Discover the best of Gulu City
            </div>

            <h1 className="text-[5.5rem] font-black tracking-tighter leading-[0.85] animate-[fadeInUp_0.7s_ease-out]">
              <span className="relative inline-block">
                <span className="text-primary">Go</span>
              </span>
              <span 
                className={`inline-block transition-all duration-500 ease-out min-w-[160px] ${
                  isAnimating ? "opacity-0 translate-y-4 scale-90" : "opacity-100 translate-y-0 scale-100"
                }`}
              >
                <span className="text-foreground">{words[currentWord]}</span>
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-foreground/80 font-medium leading-relaxed max-w-md animate-[fadeInUp_0.8s_ease-out] tracking-wide">
              Your gateway to authentic <span className="text-primary font-semibold">local eats</span>, vibrant <span className="text-accent font-semibold">markets</span>, and unforgettable <span className="text-primary font-semibold">nightlife</span> experiences in Gulu City.
            </p>

            {/* CTA + Search */}
            <div className="flex items-center gap-3 animate-[fadeInUp_0.9s_ease-out]">
              <Button onClick={() => { handleCategoryClick('eatery'); document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }); }} className="h-12 px-8 rounded-full font-bold text-base shadow-lg shadow-primary/25 group">
                Explore Now
                <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
              <div className="flex-1 max-w-xs bg-background/40 backdrop-blur-xl rounded-full border border-border/50 overflow-hidden">
                <div className="flex items-center">
                  <Search className="ml-4 h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    type="text"
                    placeholder="Search venues, food..."
                    className="h-12 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 pt-2 animate-[fadeInUp_1s_ease-out]">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[heroEateries, heroVibingGuy, heroMarket].map((img, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-secondary overflow-hidden">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="ml-2">
                  <div className="text-lg font-black text-foreground">1K+</div>
                  <div className="text-[11px] text-muted-foreground font-medium -mt-0.5">Happy Users</div>
                </div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary fill-primary" />
                <div>
                  <div className="text-lg font-black text-foreground">4.8</div>
                  <div className="text-[11px] text-muted-foreground font-medium -mt-0.5">Avg Rating</div>
                </div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-lg font-black text-foreground">50+</div>
                  <div className="text-[11px] text-muted-foreground font-medium -mt-0.5">Venues</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Cutout image on green blob */}
          <div className="lg:col-span-7 xl:col-span-7 relative flex items-center justify-center min-h-[520px]">
            {/* Layered arc circles - like reference */}
            {/* Outer arc - accent/yellow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-[44%] -translate-y-1/2 w-[430px] h-[430px] rounded-full bg-accent z-0" />
            {/* Inner arc - dark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-[56%] -translate-y-1/2 w-[410px] h-[410px] rounded-full bg-foreground dark:bg-card z-0" />
            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-accent/15 blur-3xl scale-125 z-0" />

            {/* Cutout person images - cycle with word */}
            <div className="relative w-full h-[580px] z-10">
              {cutoutImages.map((img, i) => (
                <img 
                  key={i}
                  src={img} 
                  alt={`GO ${words[i]}`}
                  className={`absolute bottom-4 left-1/2 -translate-x-1/2 h-[96%] w-auto max-w-[95%] object-contain [filter:drop-shadow(0_0_1px_hsl(var(--secondary)))_drop-shadow(0_0_3px_hsl(var(--secondary)))_drop-shadow(0_20px_40px_rgba(0,0,0,0.3))] transition-all duration-700 ease-out ${
                    activeImage === i 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-0 scale-90 translate-y-8'
                  }`}
                />
              ))}
            </div>

            {/* Floating GO badge - top right */}
            <div className="absolute top-4 right-8 z-20 animate-[fadeInUp_1.1s_ease-out]">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/40">
                  <div className="text-center">
                    <div className="text-xl font-black text-primary-foreground leading-none">GO</div>
                    <div className="text-[8px] font-bold text-primary-foreground/80 mt-0.5">COMMUNITY</div>
                  </div>
                </div>
                <div className="absolute -inset-3 rounded-full border-2 border-dashed border-primary/30 animate-spin" style={{ animationDuration: '15s' }} />
              </div>
            </div>

            {/* Floating stats card - bottom left */}
            <div className="absolute bottom-8 left-0 z-20 animate-[fadeInUp_1.2s_ease-out]">
              <div className="bg-card/90 backdrop-blur-xl rounded-2xl p-3 shadow-xl border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-foreground">50+</div>
                    <div className="text-[10px] text-muted-foreground">Venues Listed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative dashed line connecting to badge */}
            <svg className="absolute top-16 right-32 w-[100px] h-[80px] z-10" viewBox="0 0 100 80" fill="none">
              <path d="M0 40 C30 10, 70 70, 100 30" stroke="hsl(var(--foreground))" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.2"/>
            </svg>
          </div>
        </div>

        {/* === CATEGORY SELECTOR CARDS === */}
        <div id="categories" className="relative z-20">
          {/* Mobile: vertical stack for better UX */}
          <div className="flex flex-col sm:hidden gap-3">
            {categories.map((cat, i) => {
              const isActive = activeCategory === cat.filter;
              return (
                <button
                  key={i}
                  onClick={() => handleCategoryClick(cat.filter)}
                  className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-500 cursor-pointer text-left ${
                    isActive 
                      ? 'border-primary bg-primary/10 shadow-xl shadow-primary/15' 
                      : 'border-border/30 bg-card/60 backdrop-blur-sm hover:border-primary/40'
                  }`}
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <img src={cat.image} alt={cat.label} className={`w-full h-full object-cover transition-all duration-700 ${isActive ? 'scale-110 opacity-20' : 'scale-100 opacity-8'}`} loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-r from-card via-card/95 to-card/80" />
                  </div>
                  <div className="relative flex items-center gap-4 p-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                      isActive ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-primary/10 text-primary'
                    }`}>
                      <cat.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-black text-foreground">{cat.label}</h3>
                      <p className="text-xs text-muted-foreground leading-tight mt-0.5">{cat.description}</p>
                      <div className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'
                      }`}>
                        <span>{cat.stat} {cat.statLabel}</span>
                      </div>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                      isActive ? 'bg-primary text-primary-foreground rotate-90' : 'bg-muted/30 text-muted-foreground'
                    }`}>
                      {isActive ? <X className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                  {isActive && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />}
                </button>
              );
            })}
          </div>

          {/* Tablet & Desktop: grid cards */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-3 lg:gap-5">
            {categories.map((cat, i) => {
              const isActive = activeCategory === cat.filter;
              return (
                <button
                  key={i}
                  onClick={() => handleCategoryClick(cat.filter)}
                  className={`group relative overflow-hidden rounded-3xl transition-all duration-500 cursor-pointer text-left p-[1.5px] ${
                    isActive 
                      ? 'bg-gradient-to-br from-primary via-accent to-primary/60 shadow-2xl shadow-primary/20 scale-[1.03]' 
                      : 'bg-gradient-to-br from-primary/40 via-primary/20 to-primary/40 hover:from-primary/60 hover:via-primary/30 hover:to-primary/60 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.01]'
                  }`}
                >
                  <div className={`relative overflow-hidden rounded-[calc(1.5rem-1.5px)] h-full ${
                    isActive ? 'bg-background dark:bg-card' : 'bg-background/95 dark:bg-card/80 backdrop-blur-md'
                  }`}>
                  {/* Background image with enhanced overlay */}
                  <div className="absolute inset-0 overflow-hidden rounded-3xl">
                    <img 
                      src={cat.image} 
                      alt={cat.label}
                      className={`w-full h-full object-cover transition-all duration-700 ${
                        isActive ? 'scale-110 opacity-30 dark:opacity-25' : 'scale-100 opacity-[0.15] dark:opacity-10 group-hover:opacity-25 dark:group-hover:opacity-20 group-hover:scale-105'
                      }`}
                      loading="lazy"
                    />
                    <div className={`absolute inset-0 transition-all duration-500 ${
                      isActive
                        ? 'bg-gradient-to-t from-background via-background/85 to-primary/10 dark:from-card dark:via-card/90 dark:to-primary/5'
                        : 'bg-gradient-to-t from-background via-background/90 to-background/70 dark:from-card dark:via-card/90 dark:to-card/70'
                    }`} />
                  </div>

                  {/* Glow effect on active */}
                  {isActive && (
                    <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/15 dark:bg-primary/10 blur-2xl" />
                  )}

                  {/* Content */}
                  <div className="relative p-5 lg:p-6">
                    {/* Icon with glassmorphism */}
                    <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${
                      isActive 
                        ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 scale-110' 
                        : 'bg-primary/8 dark:bg-primary/10 text-primary border border-primary/15 dark:border-primary/10 group-hover:bg-primary/15 dark:group-hover:bg-primary/20 group-hover:border-primary/25'
                    }`}>
                      <cat.icon className="w-6 h-6 lg:w-7 lg:h-7" />
                    </div>

                    {/* Title & description */}
                    <h3 className="text-lg lg:text-xl font-black text-foreground mb-1">{cat.label}</h3>
                    <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed mb-4">{cat.description}</p>

                    {/* Stat + CTA row */}
                    <div className="flex items-center justify-between">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-500 ${
                        isActive 
                          ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm' 
                          : 'bg-primary/8 dark:bg-muted/50 text-muted-foreground border border-primary/10 dark:border-transparent group-hover:bg-primary/15 group-hover:text-primary group-hover:border-primary/20'
                      }`}>
                        <span>{cat.stat}</span>
                        <span>{cat.statLabel}</span>
                      </div>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isActive 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'bg-primary/8 dark:bg-muted/30 text-muted-foreground border border-primary/10 dark:border-transparent group-hover:bg-primary/15 group-hover:text-primary'
                      }`}>
                        {isActive ? <X className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Active indicator bar */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary transition-all duration-500 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background via-background/60 to-transparent" />
    </section>
  );
};

export default Hero;
