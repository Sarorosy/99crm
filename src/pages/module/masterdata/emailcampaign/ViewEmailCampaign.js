import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { CircleX } from "lucide-react";

const ViewEmailCampaign = ({ campaignId, afterSave, onClose }) => {
    const [campaignDetails, setCampaignDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // Fetch campaign details
        const fetchCampaignDetails = async () => {
            try {
                const response = await axios.get(`https://99crm.phdconsulting.in/99crmwebapi/api/getcampaigndetails/${campaignId.id}`);
                setCampaignDetails(response.data.data);
            } catch (err) {
                setError("Failed to fetch campaign details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaignDetails();
    }, [campaignId]);

    

    if (loading) return <div>Loading campaign details...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-gray-100 shadow-lg z-50 overflow-y-auto p-6"
        >
            <div className="mx-auto w-full max-w-3xl relative bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-6 text-left text-gray-800">View Email Campaign</h2>
                <button
                    onClick={onClose}
                    className="absolute trx p-2 text-gray-600 hover:text-red-600 transition-colors cremove"
                >
                    <CircleX size={32} />
                </button>
    
                <div className="mb-4">
                    <strong className="block text-gray-700">Campaign Subject:</strong>
                    <span className="text-gray-600">{campaignDetails.camp_title || 'N/A'}</span>
                    
                </div>
                <hr className="my-4" />
                <div className="mb-4">
                    <strong className="block text-gray-700">Website:</strong>
                    <span className="text-gray-600">{campaignDetails.website_name ? campaignDetails.website_name : 'N/A'}</span>
                </div>
                <hr className="my-4" />
                <div className="mb-4">
                    <strong className="block text-gray-700">Mail To:</strong>
                    {campaignDetails.clients && campaignDetails.clients.length > 0 ? (
                        <div className="space-y-2">
                            {campaignDetails.clients.map((client, key) => {
                                const isSent = campaignDetails.sentEmails.includes(client.email);
                                const isInactive = campaignDetails.inactiveEmails.includes(client.email);
    
                                return (
                                    <div key={key} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm">
                                        <div>
                                            <span className="font-semibold text-gray-800">{client.name}</span> ({client.email})
                                        </div>
                                        
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500">No clients to send emails to.</p>
                    )}
                </div>
    
                <div className="mb-4">
                    <strong className="block text-gray-700">Mail Body:</strong>
                    {campaignDetails.email_body ? (
                        <div
                            className="email-body mt-2 text-gray-700"
                            dangerouslySetInnerHTML={{ __html: campaignDetails.email_body }}
                        />
                    ) : (
                        <p className="text-gray-500">No email body provided.</p>
                    )}
                </div>
    
                <hr className="my-4" />
                <div className="mb-4">
                    <strong className="block text-gray-700">Signature:</strong>
                    {campaignDetails.signature ? (
                        <div
                            className="mt-2 text-gray-600"
                            dangerouslySetInnerHTML={{
                                __html: campaignDetails.signature
                                    .split('|||')
                                    .filter((value, index, self) => self.indexOf(value) === index)
                                    .join('</br>')
                            }}
                        />
                    ) : (
                        <span className="text-gray-500">N/A</span>
                    )}
                </div>
    
                <hr className="my-4" />
            </div>
        </motion.div>
    );
    
};

export default ViewEmailCampaign;
