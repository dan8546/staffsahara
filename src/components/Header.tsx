import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useSession } from "@/stores/useSession";
import { cn } from "@/lib/utils";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, profile, signOut } = useSession();
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
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <User className="h-4 w-4" />
                    {profile?.first_name || 'Utilisateur'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {profile?.first_name} {profile?.last_name}
                  </DropdownMenuLabel>
                  <DropdownMenuLabel className="text-xs font-normal text-ink-500">
                    {profile?.tenant_name} • {profile?.role}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/passport">Mon profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm" className="rounded-2xl">
                {t('cta.getQuote')}
              </Button>
            )}
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
                {user ? 'Mon espace' : t('cta.getQuote')}
              </Button>
              {user && (
                <Button 
                  variant="outline" 
                  className="w-full rounded-2xl mt-2 text-red-600 border-red-200"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};