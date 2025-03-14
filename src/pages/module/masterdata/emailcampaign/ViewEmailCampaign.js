import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { CircleX } from "lucide-react";
import toast from "react-hot-toast";

const ViewEmailCampaign = ({ campaignId, afterSave, onClose }) => {
    const [campaignDetails, setCampaignDetails] = useState(null);
    const [campUserInfo, setCampUserInfo] = useState(null);
    const [bouncedEmails, setBouncedEmails] = useState([]);
    const [websites, setWebsites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // Fetch campaign details
        const fetchCampaignDetails = async () => {
            try {
                const response = await fetch(`https://99crm.phdconsulting.in/api/getcampaigndetails/`, {
                    method: 'POST',
                    body: JSON.stringify({ emailcampaignid: campaignId.id }),
                });
                const data = await response.json();
                if (data.status) {
                    setCampaignDetails(data.emailcampaignInfo);
                    setCampUserInfo(data.camp_userInfo);
                    setWebsites(data.websites);
                } else {
                    toast.error(data.message || "Failed to fetch campaign details.");
                }

            } catch (err) {
                setError("Failed to fetch campaign details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaignDetails();
    }, [campaignId]);

    useEffect(() => {
        const fetchBounces = async () => {
            try {
                const response = await fetch("https://99crm.phdconsulting.in/api/getbouncedemails", {
                    method: "GET",
                });

                const result = await response.json();

                if (result.status) {
                    setBouncedEmails(result.data);
                }

            } catch (error) {
                console.error("Error fetching bounced emails:", error);
            }
        };

        fetchBounces();
    }, []);


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
            <div className=" text-sm mx-auto w-full max-w-3xl relative bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-6 text-left text-gray-800">View Email Campaign</h2>
                <button
                    onClick={onClose}
                    className="absolute trx p-2 text-gray-600 hover:text-red-600 transition-colors cremove"
                >
                    <CircleX size={32} />
                </button>

                <div className="mb-4">
                    <strong className="block text-gray-700">Campaign Subject:</strong>
                    <span className="text-gray-600">{campaignDetails.camp_title || ''}</span>

                </div>
                <hr className="my-4" />
                {campaignDetails.camp_type === "Website Camp" && Array.isArray(websites) && websites.length > 0 && (
                    <div className="mb-4">
                        <strong className="block text-gray-700">
                            Website: {campaignDetails.camp_website}
                        </strong>
                        {websites
                            .filter((website) => website.id.toString() === campaignDetails.camp_website.toString())
                            .map((website, index) => (
                                <span key={index} className="text-gray-600">{website.website}</span>
                            ))}
                    </div>
                )}


                {campaignDetails.camp_type == "User Camp" && (
                    <div className="mb-4">
                        <strong className="block text-gray-700">User:</strong>
                        <span className="text-gray-600">{campUserInfo ? `${campUserInfo.name} - ${campUserInfo.email_id}` : ''}</span>
                    </div>
                )}
                <hr className="my-4" />
                <div className="mb-4 h-96 overflow-y-auto custom-scrollbar overflow-x-hidden elevenpx">
                    <strong className="block text-gray-700">Mail To:</strong>
                    {campaignDetails && campaignDetails.queryIds &&
                        campaignDetails.queryIds.split("~").map((queryId, index) => {
                            const arrayClients = queryId.split("||");
                            const sentEmails = campaignDetails.sent_email.split("||");

                            if (!bouncedEmails.includes(arrayClients[5])) {
                                return (
                                    <div key={index}>
                                        <p>
                                            {arrayClients[4]} {" => "} {arrayClients[5]}
                                        </p>

                                        {campaignDetails.status === "Delivered" && (
                                            <>
                                                <br />
                                            </>
                                        )}

                                        {arrayClients[5] !== "" &&
                                            arrayClients[5] !== null &&
                                            campaignDetails.status === "In Process" &&
                                            (!sentEmails.includes(arrayClients[5]) ? (
                                                <button>Send Mail</button>
                                            ) : (
                                                <p>Mail Sent</p>
                                            ))}
                                    </div>
                                );
                            }
                            return null;
                        })}

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
