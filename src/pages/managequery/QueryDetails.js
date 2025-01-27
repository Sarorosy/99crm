import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import QueryInformation from './QueryDetailsComponents/QueryInformation';

const QueryDetails = ({ refId, onClose }) => {
    const [activeTab, setActiveTab] = useState(1);

    // Dummy content for each tab
    const TabContent = () => {
        switch (activeTab) {
            case 1:
                return <div className="text-sm text-gray-700">
                    <QueryInformation refId={refId} />
                </div>;
            case 2:
                return <div className="text-sm text-gray-700">Generate Price - Content</div>;
            case 3:
                return <div className="text-sm text-gray-700">Attached Files - Content</div>;
            case 4:
                return <div className="text-sm text-gray-700">Internal Comments - Content</div>;
            case 5:
                return <div className="text-sm text-gray-700">Campaign Comments - Content</div>;
            default:
                return <div className="text-sm text-gray-700">Query Information - Content</div>;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-gray-100 shadow-lg z-50 overflow-y-auto p-6"
        >
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="flex px-5 items-center justify-between bg-blue-500 text-white py-3 rounded-t-lg">
                    <h2 className="text-lg font-semibold">Query Details</h2>

                    <button
                        onClick={onClose}
                        className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500"
                    >
                        <X size={15} />
                    </button>
                </div>

                <div className='row'>
                    <div className=" mt-4 col-md-5">
                        <div className="flex space-x-2 border-b px-2">
                            {/* Tab buttons */}
                            <button
                                onClick={() => setActiveTab(1)}
                                style={{fontSize:"11px"}}
                                className={` font-medium px-2 py-1 rounded-lg transition-colors ${activeTab === 1 ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-100' : 'text-gray-500 hover:text-blue-600'}`}
                            >
                                Query Information
                            </button>
                            <button
                                onClick={() => setActiveTab(2)}
                                style={{fontSize:"11px"}}
                                className={` font-medium px-2 py-1 rounded-lg transition-colors ${activeTab === 2 ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-100' : 'text-gray-500 hover:text-blue-600'}`}
                            >
                                Generate Price
                            </button>
                            <button
                                onClick={() => setActiveTab(3)}
                                style={{fontSize:"11px"}}
                                className={` font-medium px-2 py-1 rounded-lg transition-colors ${activeTab === 3 ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-100' : 'text-gray-500 hover:text-blue-600'}`}
                            >
                                Attached Files
                            </button>
                            <button
                                onClick={() => setActiveTab(4)}
                                style={{fontSize:"11px"}}
                                className={` font-medium px-2 py-1 rounded-lg transition-colors ${activeTab === 4 ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-100' : 'text-gray-500 hover:text-blue-600'}`}
                            >
                                Internal Comments
                            </button>
                            <button
                                onClick={() => setActiveTab(5)}
                                style={{fontSize:"11px"}}
                                className={` font-medium px-2 py-1 rounded-lg transition-colors ${activeTab === 5 ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-100' : 'text-gray-500 hover:text-blue-600'}`}
                            >
                                Campaign Comments
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="px-1 py-6">
                    <TabContent />
                </div>
            </div>
        </motion.div>
    );
};

export default QueryDetails;
