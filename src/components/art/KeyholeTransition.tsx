import React, { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { motion, AnimatePresence } from "framer-motion";
import { isArtMode } from "../../store/modeStore";

export default function KeyholeTransition() {
  const artModeActive = useStore(isArtMode);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {artModeActive && (
        <motion.div
          initial={{ scale: 0.01, opacity: 0 }}
          animate={{ scale: 100, opacity: 1 }}
          exit={{ scale: 0.01, opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-40 bg-black pointer-events-none"
          style={{
            clipPath: 'path("M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z")',
            transformOrigin: "top right", // Roughly where the button is
          }}
        />
      )}
    </AnimatePresence>
  );
}
