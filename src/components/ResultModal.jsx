import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Copy } from 'lucide-react';
import Button from './Button';

const ResultModal = ({ isOpen, onClose, type = 'success', title, message, data }) => {
    if (!isOpen) return null;

    const isSuccess = type === 'success';

    const handleCopy = () => {
        if (data) {
            navigator.clipboard.writeText(JSON.stringify(data, null, 2));
            // Optional: temporary toast could go here
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className={`p-6 flex items-start gap-4 ${isSuccess ? 'bg-green-50' : 'bg-red-50'}`}>
                        <div className={`p-3 rounded-full shrink-0 ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {isSuccess ? <CheckCircle size={28} /> : <AlertCircle size={28} />}
                        </div>
                        <div className="flex-1">
                            <h3 className={`text-xl font-bold mb-1 ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
                                {title}
                            </h3>
                            <p className={`text-sm ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
                                {message}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Body - Scrollable if content is long */}
                    <div className="p-6 overflow-y-auto">
                        {data && (
                            <div className="mt-2">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Response Details</span>
                                    <button
                                        onClick={handleCopy}
                                        className="text-xs flex items-center gap-1 text-[var(--color-primary)] hover:underline"
                                    >
                                        <Copy size={12} /> max-copy
                                    </button>
                                </div>
                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto relative group">
                                    <pre className="text-xs text-green-400 font-mono leading-relaxed">
                                        {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                        <Button onClick={onClose} variant={isSuccess ? 'primary' : 'outline'} className={isSuccess ? 'bg-green-600 hover:bg-green-700' : 'border-red-200 text-red-700 hover:bg-red-50'}>
                            Close
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ResultModal;
