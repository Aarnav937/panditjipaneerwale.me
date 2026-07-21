import React from 'react';
import { Phone, MapPin, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer = ({ onToggleAdmin }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-brand-charcoal text-white pt-10 pb-8 border-t border-brand-gold/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold text-brand-orange mb-2">Pandit Ji Paneer Wale</h3>
            <div className="w-12 h-0.5 bg-brand-gold/60 rounded-full mb-3" />
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Fresh paneer, dairy & authentic spices — free delivery in Abu Dhabi.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-gold mb-3">{t('contactUs')}</h4>
            <div className="space-y-2.5 text-gray-400 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 flex-shrink-0 text-brand-saffron" size={16} />
                <span>F9QJ+F6F Abu Dhabi, UAE</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="flex-shrink-0 text-brand-saffron" size={16} />
                <a href="tel:+971524676306" className="hover:text-brand-orange transition">+971 52 467 6306</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="flex-shrink-0 text-brand-saffron" size={16} />
                <a href="mailto:rrc.inttrading@gmail.com" className="hover:text-brand-orange transition break-all">rrc.inttrading@gmail.com</a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-gold mb-3">{t('quickLinks')}</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-brand-orange transition">{t('home')}</a></li>
              <li><a href="#products" className="hover:text-brand-orange transition">Products</a></li>
              <li><a href="#our-store" className="hover:text-brand-orange transition">Store</a></li>
              <li><a href="#contact" className="hover:text-brand-orange transition">{t('contact')}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-5 text-center text-gray-500 text-xs flex flex-col items-center gap-1.5">
          <span>&copy; {new Date().getFullYear()} Pandit Ji Paneer Wale. {t('rightsReserved')}</span>
          {onToggleAdmin && (
            <button
              onClick={onToggleAdmin}
              className="text-gray-700 hover:text-gray-500 text-[10px]"
            >
              Admin
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
