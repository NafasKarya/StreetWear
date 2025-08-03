import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CartButtonWithDrawer: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Disable scroll saat drawer terbuka
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Cleanup saat unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Tombol Cart */}
      <button
        onClick={() => setOpen(true)}
        className="bg-white text-black p-2 rounded-full hover:scale-110 transition z-[100]"
        aria-label="Buka Keranjang"
      >
        🛒
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black z-[998]"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-lg z-[9999] flex flex-col"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <span className="text-lg font-bold">Keranjang</span>
              <button
                onClick={() => setOpen(false)}
                className="text-2xl"
                aria-label="Tutup"
              >
                &times;
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto text-black">
              <p className="opacity-70">Keranjang kamu masih kosong.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartButtonWithDrawer;
