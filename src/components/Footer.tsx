import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Building2, 
  Plane, 
  Ticket, 
  Stethoscope, 
  Zap, 
  Server,
  GraduationCap 
} from "lucide-react";

export const Footer = () => {
  const { t } = useTranslation();

  const businessUnits = [
    { icon: Building2, name: "RedMed Mobile", color: "text-brand-blue" },
    { icon: Plane, name: "Star Aviation", color: "text-brand-gold" },
    { icon: Ticket, name: "Ain Salah Siyaha", color: "text-ink-500" },
    { icon: Stethoscope, name: "Medical", color: "text-red-500" },
    { icon: Zap, name: "Energy", color: "text-yellow-500" },
    { icon: Server, name: "ICT", color: "text-blue-500" },
    { icon: GraduationCap, name: "RRTC", color: "text-green-500" },
  ];

  return (
    <footer className="bg-ink-900 text-paper-0 py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-brand-gold">
              Staff Sahara
            </h3>
            <p className="text-sm text-paper-0/80 mb-4">
              {t('footer.hq')}
            </p>
            <div className="space-y-2 text-sm text-paper-0/70">
              <p>Email: contact@staff-sahara.com</p>
              <p>Tél: +213 (0) 29 XX XX XX</p>
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-brand-gold">
              Informations
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/legal" 
                  className="text-paper-0/80 hover:text-brand-gold transition-colors"
                >
                  {t('footer.legal')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-paper-0/80 hover:text-brand-gold transition-colors"
                >
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-paper-0/80 hover:text-brand-gold transition-colors"
                >
                  {t('nav.about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Business Units */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-brand-gold">
              Groupe RedMed
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {businessUnits.map((unit, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-2 rounded-lg bg-ink-800/50 hover:bg-ink-700/50 transition-colors group"
                  title={unit.name}
                >
                  <unit.icon 
                    className={cn(
                      "h-5 w-5 mb-1 transition-colors group-hover:scale-110",
                      unit.color
                    )} 
                  />
                  <span className="text-xs text-paper-0/60 text-center leading-tight">
                    {unit.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-ink-700 mt-8 pt-6 text-center">
          <p className="text-sm text-paper-0/60">
            © {new Date().getFullYear()} Staff Sahara - RedMed Group. 
            Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};