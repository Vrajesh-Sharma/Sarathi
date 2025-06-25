import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Github, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Spiritual Quote */}
          <div className="mb-12">
            <blockquote className="font-cinzel text-2xl md:text-3xl font-light italic text-cream-100 mb-4 leading-relaxed">
              "You are what your deep, driving desire is."
            </blockquote>
            <cite className="font-inter text-lg text-divine-300">
              — Chandogya Upanishad
            </cite>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-6 mb-8">
            {[
              { icon: Github, href: 'https://github.com/Vrajesh-Sharma', label: 'GitHub' },
              { icon: Instagram, href: 'https://instagram.com/its_vrajesh_sharma', label: 'Instagram' },
              { icon: Linkedin, href: 'https://www.linkedin.com/in/vrajesharma-7-dsa/', label: 'LinkedIn' }              
            ].map(({ icon: Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all duration-300"
                aria-label={label}
              >
                <Icon className="w-6 h-6" />
              </motion.a>
            ))}
          </div>

          {/* Divider */}
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-divine-400 to-transparent mx-auto mb-8"></div>

          {/* Copyright and Love */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-cream-300">
            <p className="font-inter text-sm">
              © 2025 Sarathi - Divine Guidance Through Technology
            </p>
            <div className="hidden md:block text-divine-400">•</div>
            <div className="flex items-center gap-1">
              <span className="font-inter text-sm">Made with</span>
              <Heart className="w-4 h-4 text-red-400 fill-current" />
              <span className="font-inter text-sm">by Vrajesh Sharma</span>
            </div>
          </div>

          {/* Final Blessing */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-8 pt-8 border-t border-white/10"
          >
            <p className="font-inter text-sm text-cream-200 opacity-70 italic">
              🙏 May the divine light guide your path to truth and enlightenment 🙏
            </p>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;