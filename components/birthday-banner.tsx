import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface BirthdayBannerProps {
  name: string;
  imageUrl?: string;
}

export function BirthdayBanner({ name, imageUrl }: BirthdayBannerProps) {
  useEffect(() => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ["#6366f1", "#a855f7", "#ec4899", "#f59e0b"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ["#6366f1", "#a855f7", "#ec4899", "#f59e0b"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 160, damping: 18 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border border-primary/20"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-4 -right-4 text-4xl opacity-20">🎂</div>
        <div className="absolute bottom-2 left-4 text-2xl opacity-15">🎉</div>
      </div>
      <div className="relative flex items-center gap-4 px-5 py-4">
        <div className="relative shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/30"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center ring-2 ring-primary/30">
              <span className="text-xl font-bold text-primary">
                {name.charAt(0)}
              </span>
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 text-sm">🎂</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500 shrink-0" />
            <span className="text-sm font-semibold text-foreground">
              Happy Birthday!
            </span>
          </div>
          <p className="text-base font-bold text-foreground mt-0.5 truncate">
            {name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Wishing you a fantastic day filled with joy and celebration!
          </p>
        </div>
        <div className="shrink-0 text-3xl opacity-30 hidden sm:block">🎉</div>
      </div>
    </motion.div>
  );
}
