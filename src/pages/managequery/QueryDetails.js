import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const QueryDetails = ({ refId, onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-gray-100 shadow-lg z-50 overflow-y-auto"
        >
            <div className=''>
                <div className='flex px-5 items-center justify-between bg-blue-400 text-white pnav py-3'>
                    <h2 className="text-xl font-semibold">Query Details </h2>

                    <button
                        onClick={onClose}
                        className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500"
                    >

                        <X size={15} />
                    </button>
                </div>

                {/* Content */}
                <div className="mt-6">


                </div>
            </div>
        </motion.div>
    );
};

export default QueryDetails;
