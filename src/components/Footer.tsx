import { MapPin, Mail, Phone, ArrowRight, Utensils, ShoppingBag, Music, Heart, Globe, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AnimatedLogo from "./AnimatedLogo";

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
);
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
);

const socialLinks = [
  { label: "X", href: "#", icon: XIcon },
  { label: "Instagram", href: "#", icon: InstagramIcon },
  { label: "Facebook", href: "#", icon: FacebookIcon },
  { label: "TikTok", href: "#", icon: TikTokIcon },
];

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="relative pb-20 lg:pb-0 overflow-hidden bg-gradient-to-br from-[hsl(84,40%,88%)] via-[hsl(90,35%,84%)] to-[hsl(95,30%,80%)] dark:bg-gradient-to-br dark:from-[hsl(0,0%,8%)] dark:via-[hsl(84,10%,6%)] dark:to-[hsl(84,15%,4%)]">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary radial glow — top center */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full bg-[radial-gradient(ellipse_at_center,hsl(84,76%,53%,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,hsl(84,76%,53%,0.1),transparent_70%)]" />
        {/* Warm accent — bottom right */}
        <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,hsl(84,60%,50%,0.12),transparent_65%)] dark:bg-[radial-gradient(circle,hsl(84,76%,53%,0.07),transparent_65%)]" />
        {/* Cool accent — bottom left */}
        <div className="absolute -bottom-32 -left-20 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,hsl(100,50%,50%,0.1),transparent_60%)] dark:bg-[radial-gradient(circle,hsl(160,40%,40%,0.05),transparent_60%)]" />
        {/* Geometric decorations */}
        <svg className="absolute -right-20 -top-20 w-[400px] h-[400px] opacity-[0.07] dark:opacity-[0.04]" viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="180" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
          <circle cx="200" cy="200" r="140" stroke="hsl(var(--primary))" strokeWidth="1"/>
          <circle cx="200" cy="200" r="100" stroke="hsl(var(--primary))" strokeWidth="0.5"/>
        </svg>
        <svg className="absolute -left-16 bottom-10 w-[300px] h-[300px] opacity-[0.05] dark:opacity-[0.03]" viewBox="0 0 300 300" fill="none">
          <path d="M150 20 L280 150 L150 280 L20 150 Z" stroke="hsl(var(--primary))" strokeWidth="1"/>
        </svg>
        {/* Subtle noise texture overlay for depth */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />
      </div>

      {/* Top accent bar */}
      <div className="relative">
        <div className="h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent dark:via-primary/50" />
      </div>

      <div className="container mx-auto px-4 pt-12 pb-8 sm:pt-16 sm:pb-10 relative z-10">
        {/* === NEWSLETTER CTA BANNER === */}
        <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/8 via-primary/4 to-accent/6 dark:from-primary/12 dark:via-primary/6 dark:to-accent/8 border border-primary/15 dark:border-primary/20 backdrop-blur-sm shadow-[0_4px_30px_-10px_hsl(84,76%,53%,0.1)] dark:shadow-[0_4px_30px_-10px_hsl(84,76%,53%,0.15)]">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-xl sm:text-2xl font-black text-foreground mb-2">
                Stay in the <span className="text-primary">loop</span>
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Get the latest venues, deals, and events straight to your inbox.
              </p>
            </div>
            <div className="flex w-full lg:w-auto gap-2 max-w-md">
              <Input
                type="email"
                placeholder="Enter your email"
                className="rounded-xl bg-background/60 border-border/50 backdrop-blur-sm"
              />
              <Button className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-bold px-6 shrink-0">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile: Compact stacked layout */}
        <div className="lg:hidden space-y-8">
          {/* Logo + Description */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <AnimatedLogo />
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
              Your ultimate guide to the best dining, shopping, and nightlife in Gulu City.
            </p>
            <div className="flex gap-2 justify-center">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className="w-9 h-9 rounded-xl hover:bg-primary/10 hover:scale-110 flex items-center justify-center text-primary transition-all duration-200"
                >
                  <item.icon className="w-4 h-4 [stroke:none]" />
                </a>
              ))}
            </div>
          </div>


          {/* Links grid */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-black text-foreground mb-3 text-xs uppercase tracking-widest flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Explore
              </h3>
              <ul className="space-y-2.5">
                {["Restaurants", "Bars & Nightlife", "Cafes", "Local Eats"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium flex items-center gap-1 group">
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-black text-foreground mb-3 text-xs uppercase tracking-widest flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Company
              </h3>
              <ul className="space-y-2.5">
                {[
                  { label: "About Us", href: "#" },
                  { label: "For Business", href: "/onboarding" },
                  { label: "Privacy", href: "#" },
                  { label: "Terms", href: "#" },
                ].map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium flex items-center gap-1 group">
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="font-black text-foreground text-xs uppercase tracking-widest flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Contact
            </h3>
            <div className="flex items-center gap-4 flex-wrap">
              <a href="mailto:hello@go.community" className="flex items-center gap-2 text-sm text-foreground font-medium hover:text-primary transition-colors">
                <Mail className="w-4 h-4 text-primary" />
                hello@go.community
              </a>
              <a href="tel:+256XXXXXXXX" className="flex items-center gap-2 text-sm text-foreground font-medium hover:text-primary transition-colors">
                <Phone className="w-4 h-4 text-primary" />
                +256 XXX XXX XXX
              </a>
            </div>
          </div>
        </div>

        {/* Desktop: Enhanced 4-column layout */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-10">
          <div className="space-y-5">
            <AnimatedLogo />
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your ultimate guide to discovering the best dining, shopping, and nightlife experiences in Gulu City.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className="w-9 h-9 rounded-xl hover:bg-primary/10 hover:scale-110 flex items-center justify-center text-primary transition-all duration-200"
                >
                  <item.icon className="w-4 h-4 [stroke:none]" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-black text-foreground mb-5 text-xs uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Explore
            </h3>
            <ul className="space-y-3.5 text-sm">
              {["Restaurants", "Bars & Nightlife", "Cafes", "Local Eats", "Pork Joints", "Grill Spots"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-all group flex items-center gap-1.5 font-medium">
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-black text-foreground mb-5 text-xs uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Company
            </h3>
            <ul className="space-y-3.5 text-sm">
              {[
                { label: "About Us", href: "#" },
                { label: "For Business", href: "/onboarding" },
                { label: "Careers", href: "#" },
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-muted-foreground hover:text-primary transition-all group flex items-center gap-1.5 font-medium">
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-black text-foreground mb-5 text-xs uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Contact
            </h3>
            <ul className="space-y-4 text-sm">
              {[
                { icon: Mail, text: "hello@go.community", subtext: "Get in touch" },
                { icon: Phone, text: "+256 XXX XXX XXX", subtext: "Mon-Sat, 8am-8pm" },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center shrink-0 transition-colors">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium text-foreground">{item.text}</span>
                    {item.subtext && <p className="text-xs text-muted-foreground mt-0.5">{item.subtext}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright with enhanced styling */}
        <div className="mt-12 pt-6 border-t border-primary/10 dark:border-primary/15">
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            © 2025 <span className="font-bold text-primary">GO</span> Community. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
