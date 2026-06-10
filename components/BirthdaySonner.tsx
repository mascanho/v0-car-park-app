import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type BirthdaySonnerProps = {
  name: string;
  message?: string;
  imageUrl: string;
  show: boolean;
  onClose?: () => void;
  duration?: number;
};

export const BirthdaySonner: React.FC<BirthdaySonnerProps> = ({
  name,
  message = "Wishing you a wonderful birthday 🎉",
  imageUrl,
  show,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl
                       bg-white/70 backdrop-blur-xl shadow-xl
                       border border-white/40 max-w-sm"
          >
            {/* Avatar */}
            <div className="relative">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {name?.charAt(0)}
                  </span>
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 text-xs">🎂</span>
            </div>

            {/* Text */}
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-gray-900">
                Happy Birthday, {name}
              </span>
              <span className="text-sm text-gray-600">{message}</span>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="ml-2 text-gray-400 hover:text-gray-700 transition"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
