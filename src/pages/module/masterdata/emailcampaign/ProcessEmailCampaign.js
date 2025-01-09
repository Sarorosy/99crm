import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { CircleX } from "lucide-react";

const ProcessEmailCampaign = ({ campaignId, afterSave, onClose }) => {
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

    const markAsDelivered = async () => {
        if (!window.confirm("Please confirm to mark as delivered?")) return;

        try {
            const response = await axios.post("https://99crm.phdconsulting.in/99crmwebapi/api/campaignmarkasdelivered", { campaignId: campaignId.id });
            if (response.data.status) {
                alert("Campaign marked as delivered!");
                setCampaignDetails({ ...campaignDetails, status: "Delivered" });
            } else {
                alert("Failed to mark as delivered.");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred while marking as delivered.");
        }
    };

    const sendSingleEmail = async (email, key) => {
        try {
            const response = await axios.post("/api/sendsingleemail", {
                email,
                key,
                campaignId,
            });

            if (response.data.success) {
                alert(`Email sent to ${email}`);
                setCampaignDetails((prevDetails) => ({
                    ...prevDetails,
                    sentEmails: [...prevDetails.sentEmails, email],
                }));
            } else {
                alert(`Failed to send email to ${email}`);
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred while sending the email.");
        }
    };

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
                <h2 className="text-2xl font-semibold mb-6 text-left text-gray-800">Process Email Campaign</h2>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                    <CircleX size={32} />
                </button>
    
                <div className="mb-4">
                    <strong className="block text-gray-700">Campaign Subject:</strong>
                    <span className="text-gray-600">{campaignDetails.camp_title || 'N/A'}</span>
                    {campaignDetails.status === "In Process" && (
                        <button
                            className="btn btn-info float-right py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
                            onClick={markAsDelivered}
                        >
                            Mark as Delivered
                        </button>
                    )}
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
                                        {isInactive ? (
                                            <span className="text-red-500">Inactive</span>
                                        ) : isSent ? (
                                            <button className="btn btn-success bg-green-600 text-white py-1 px-3 rounded-md">Mail Sent</button>
                                        ) : (
                                            <button
                                                className="btn btn-warning bg-yellow-500 text-white py-1 px-3 rounded-md"
                                                onClick={() => sendSingleEmail(client.email, key)}
                                            >
                                                Send Email
                                            </button>
                                        )}
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

export default ProcessEmailCampaign;
