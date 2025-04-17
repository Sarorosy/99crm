import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { CircleX } from "lucide-react";
import toast from "react-hot-toast";

const ProcessEmailCampaign = ({ campaignId, afterSave, onClose }) => {
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
                const response = await fetch(`https://99crm.phdconsulting.in/zend/api/getcampaigndetails/`, {
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
                const response = await fetch("https://99crm.phdconsulting.in/zend/api/getbouncedemails", {
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

    const markAsDelivered = async () => {
        if (!window.confirm("Please confirm to mark as delivered?")) return;

        try {
            const response = await axios.post("https://99crm.phdconsulting.in/zend/api/processemailcampaign",
                 { emailcampaignid: campaignId.id,
                    post_user_id : sessionStorage.getItem("id"),
                    post_user_name : sessionStorage.getItem("name"),
                  });
            if (response.data.status) {
                toast.success("Campaign marked as delivered!");
                setCampaignDetails({ ...campaignDetails, status: "Delivered" });
                afterSave();
            } else {
                toast.error(response.data.message || "Failed to mark as delivered.");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred while marking as delivered.");
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
                    className="absolute trx p-2 text-gray-600 hover:text-red-600 transition-colors cremove"
                >
                    <CircleX size={32} />
                </button>
                {loading ? <div>Loading campaign details...</div> :
                    <div className="text-sm">
                        <div className="mb-4">
                            <strong className="block text-gray-700">Campaign Subject:</strong>
                            <span className="text-gray-600">{campaignDetails.camp_title || ''}</span>
                            {campaignDetails.status === "In Process" && (
                                <button
                                    className="btn btn-info text-sm float-right py-0.5 px-1 bg-blue-600 text-white rounded hover:bg-blue-700 "
                                    onClick={markAsDelivered}
                                >
                                    Mark as Delivered
                                </button>
                            )}
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
                        <div className="mb-4">
                            <strong className="block text-gray-700">Mail To:</strong>
                            {campaignDetails.queryIds &&
                                campaignDetails.queryIds.split("~").map((queryId, index) => {
                                    const arrayClients = queryId.split("||");
                                    const sentEmails = campaignDetails.sentEmails.split("||");

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
                                                        <button
                                                            className="btn btn-warning bg-yellow-500 text-white py-1 px-3 rounded-md"
                                                            onClick={() => sendSingleEmail(arrayClients[5], index)}
                                                        >
                                                            Send Email
                                                        </button>
                                                    ) : (
                                                        <button className="btn btn-success bg-green-600 text-white py-1 px-3 rounded-md">Mail Sent</button>
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
                    </div>}
            </div>
        </motion.div>
    );

};

export default ProcessEmailCampaign;
