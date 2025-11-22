import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer } from 'lucide-react';

const DealOfTheDay = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 45, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gradient-to-r from-red-500 to-brand-orange text-white py-3 px-4 shadow-md"
    >
      <div className="container mx-auto flex flex-col md:flex-row justify-center items-center gap-4 text-center">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Timer className="animate-pulse" />
          <span>DEAL OF THE DAY: 20% OFF on All Everest Spices!</span>
        </div>
        <div className="flex gap-2 font-mono text-xl font-bold bg-white/20 px-4 py-1 rounded-lg">
          <span>{String(timeLeft.hours).padStart(2, '0')}</span>:
          <span>{String(timeLeft.minutes).padStart(2, '0')}</span>:
          <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default DealOfTheDay;
