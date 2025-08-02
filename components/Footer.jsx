"use client";

import { motion } from "framer-motion";
import { Github, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <motion.footer
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 px-8 "
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="flex items-center gap-1 text-sm">
          Made with <Heart className="w-4 h-4 text-red-500" /> by Your Team.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="mailto:team@mindbridge.com"
            className="flex items-center gap-1 hover:underline"
          >
            <Mail className="w-4 h-4" /> Contact
          </a>
          <a
            href="https://github.com/your-repo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline"
          >
            <Github className="w-4 h-4" /> GitHub
          </a>
        </div>
      </div>
    </motion.footer>
  );
}