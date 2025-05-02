import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ChatbotWidget = ({ message }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (message) {
      setShowMessage(true);
      setIsOpen(true);
    }
  }, [message]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50"
      >
        💬
      </button>

      <AnimatePresence>
        {isOpen && showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-20 right-6 max-w-sm w-full bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-4 border border-blue-500 z-50"
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">🤖</div>
              <div>
                <h4 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">
                  Chatbot Suggestion
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {message}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;
