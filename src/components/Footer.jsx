import React from 'react';
import { Phone, MapPin, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer = ({ onToggleAdmin }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-brand-orange mb-4">Pandit Ji Paneer Wale</h3>
            <p className="text-gray-400 mb-4">
              Bringing the freshest paneer and authentic spices to your kitchen. Quality you can trust.
            </p>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-4">{t('contactUs')}</h4>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 flex-shrink-0 text-brand-orange" size={20} />
                <span>F9QJ+M5J, Al Zahiyah - E16 02, Abu Dhabi, United Arab Emirates</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="flex-shrink-0 text-brand-orange" size={20} />
                <span>+971 52 467 6306</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="flex-shrink-0 text-brand-orange" size={20} />
                <span>rrc.inttrading@gmail.com</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-4">{t('quickLinks')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-brand-orange transition">{t('home')}</a></li>
              <li><a href="#" className="hover:text-brand-orange transition">{t('about')}</a></li>
              <li><a href="#" className="hover:text-brand-orange transition">Products</a></li>
              <li><a href="#" className="hover:text-brand-orange transition">{t('contact')}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
          <span>&copy; {new Date().getFullYear()} Pandit Ji Paneer Wale. {t('rightsReserved')}</span>
          <button
            onClick={onToggleAdmin}
            className="text-gray-800 hover:text-gray-700 text-xs"
          >
            Admin
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
