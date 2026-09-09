import React from 'react';
import { Phone, MapPin, Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer = ({ onToggleAdmin }) => {
  const { t } = useLanguage();

  return (
    <footer id="contact" className="bg-slate-950 text-white pt-16 pb-12 border-t border-amber-500/20 relative overflow-hidden">
      <div className="accent-gold-line absolute top-0 left-0 right-0 opacity-70" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-brand-orange flex items-center justify-center shadow-lg">
                <span className="text-xl">🧀</span>
              </div>
              <span className="font-display text-2xl font-black text-white tracking-tight">
                Pandit Ji <span className="text-brand-orange">Paneer Wale</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Abu Dhabi's trusted destination for handcrafted fresh buffalo paneer, pure dairy, authentic Everest spices, and pantry staples.
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-emerald-400 live-dot" />
              <span>Free Delivery in Abu Dhabi</span>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-amber-400 mb-4">
              {t('contactUs') || "Contact & Support"}
            </h4>
            <div className="space-y-3.5 text-gray-300 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 shrink-0 text-brand-orange w-4 h-4" />
                <span className="text-xs sm:text-sm">F9QJ+F6F Abu Dhabi, United Arab Emirates</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="shrink-0 text-brand-orange w-4 h-4" />
                <a href="tel:+971524676306" className="hover:text-brand-orange transition text-xs sm:text-sm font-bold">
                  +971 52 467 6306
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="shrink-0 text-emerald-400 w-4 h-4" />
                <a 
                  href="https://wa.me/971524676306?text=Hello%20Pandit%20Ji%20Paneer%20Wale" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition text-xs sm:text-sm font-bold"
                >
                  WhatsApp: +971 52 467 6306
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="shrink-0 text-brand-orange w-4 h-4" />
                <a href="mailto:rrc.inttrading@gmail.com" className="hover:text-brand-orange transition text-xs sm:text-sm break-all font-medium">
                  rrc.inttrading@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-amber-400 mb-4">
              {t('quickLinks') || "Quick Links"}
            </h4>
            <ul className="space-y-2.5 text-gray-400 text-sm font-medium">
              <li>
                <a href="#" className="hover:text-brand-orange transition">
                  {t('home')}
                </a>
              </li>
              <li>
                <a href="#products" className="hover:text-brand-orange transition">
                  Fresh Catalog (~158 Products)
                </a>
              </li>
              <li>
                <a href="#our-store" className="hover:text-brand-orange transition">
                  Visit Retail Store in Abu Dhabi
                </a>
              </li>
              <li>
                <a href="https://maps.google.com/?q=F9QJ+F6F+Abu+Dhabi" target="_blank" rel="noopener noreferrer" className="hover:text-brand-orange transition">
                  Google Maps Directions
                </a>
              </li>
            </ul>
          </div>

          {/* Assurance & WhatsApp */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-amber-400 mb-4">
              Ordering & Assurance
            </h4>
            <div className="space-y-3 text-xs text-gray-400">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> WhatsApp Direct Order
                </p>
                <p className="leading-relaxed">
                  No advance card payment required. Order directly via WhatsApp and pay cash or instant transfer on delivery.
                </p>
              </div>
              <p className="text-[11px] text-gray-500">
                ⚡ Fresh batch prepared every morning at 05:00 AM.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            <span>&copy; {new Date().getFullYear()} Pandit Ji Paneer Wale. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-600">Abu Dhabi, UAE</span>
            {onToggleAdmin && (
              <button
                onClick={onToggleAdmin}
                className="text-gray-600 hover:text-amber-400 transition-colors text-[11px] font-mono"
                title="Admin portal access"
              >
                [Admin Portal]
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
