import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { key: "b2b", href: "/rfq" },
    { key: "b2c", href: "/jobs" },
    { key: "about", href: "/about" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-paper-0 border-b border-ink-300/20 py-3 md:py-4">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo variant="blue" size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-brand-blue",
                  isActive(item.href) 
                    ? "text-brand-blue" 
                    : "text-ink-700"
                )}
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="default" size="sm" className="rounded-2xl">
              {t('cta.getQuote')}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9 p-0"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-ink-300/20 pt-4">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isActive(item.href) 
                      ? "text-brand-blue" 
                      : "text-ink-700"
                  )}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
              <Button 
                variant="default" 
                className="w-full rounded-2xl mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('cta.getQuote')}
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};