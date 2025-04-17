import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const BoxQueryDetails = ({ onClose, queryId }) => {
    const [companyData, setCompanyData] = useState([]);
    const [websiteData, setWebsiteData] = useState({});
    const [queryData, setQueryData] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [filteredWebsites, setFilteredWebsites] = useState([]);
    const [selectedWebsite, setSelectedWebsite] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQueryDetails = async () => {
            const response = await fetch('https://99crm.phdconsulting.in/zend/api/getboxquerydetails', {
                method: 'POST',
                body: JSON.stringify({
                    query_id: queryId,
                    user_id: sessionStorage.getItem('id'),
                }),
            });
            const data = await response.json();
            setCompanyData(data.companyData);
            setQueryData(data.QueryInfo);
            setWebsiteData(JSON.parse(data.genericWebsite)); // Ensure JSON parsing
        };

        fetchQueryDetails();
    }, [queryId]);

    // Handle company selection
    const handleCompanyChange = (e) => {
        const companyId = e.target.value;
        setSelectedCompany(companyId);
        setFilteredWebsites(websiteData[companyId] || []);
    };

    const handleClaim = async () => {
        if (!selectedCompany) {
            toast.error("Please select a company");
            return;
        }
        if (!selectedWebsite) {
            toast.error("Please select a website");
            return;
        }
        const response = await fetch('https://99crm.phdconsulting.in/zend/api/claimboxquery', {
            method: 'POST',
            body: JSON.stringify({
                query_id: queryId,
                company_id: selectedCompany,
                website_id: selectedWebsite,
                user_id: sessionStorage.getItem('id'),
                user_name: sessionStorage.getItem('name'),
                user_type: sessionStorage.getItem('user_type'),
                team_id: sessionStorage.getItem('team_id'),
                sms_notify: sessionStorage.getItem('sms_notify'),
                whatsaap_notification: sessionStorage.getItem('whatsaap_notification')
            }),
        });
        const data = await response.json();
        if (data.status) {
            if (data.value == "1") {
                toast.success("Query claimed successfully");
                navigate('/queryhistory');
            } else {
                toast.error("Query already exists on the company with this email");
            }
        }
    }
    return (
        <motion.div
            initial={{ opacity: 0, }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 right-0 h-full w-1/2 bg-gray-50 shadow-2xl z-50 overflow-y-auto"
        >
            <div className="bg-white rounded-lg shadow-lg h-full">
                <div className="flex px-6 items-center justify-between bg-gradient-to-r from-[#0A5EB0] to-[#0A47B0] text-white py-2 ">
                    <h2 className="text-xl font-semibold tracking-wide">Box Query Details</h2>
                    <button
                        onClick={onClose}
                        className="text-white p-1 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-200"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="flex flex-col gap-1  p-4">
                    {queryData && (
                        <div className="flex flex-col space-y-4 gap-4">
                            <div className="grid grid-cols-2 gap-4 text-md">
                                {queryData.name && (
                                    <div className="flex items-center">
                                        <div className="w-32 font-medium">Name:</div>
                                        <div>{queryData.name}</div>
                                    </div>
                                )}

                                {queryData.email_id && (
                                    <div className="flex items-center">
                                        <div className="w-32 font-medium">Email:</div>
                                        <div>{queryData.email_id}</div>
                                    </div>
                                )}

                                {queryData.phone && (
                                    <div className="flex items-center">
                                        <div className="w-32 font-medium">Contact No:</div>
                                        <div>{queryData.phone}</div>
                                    </div>
                                )}

                                {queryData.website_name && (
                                    <div className="flex items-center">
                                        <div className="w-32 font-medium">Website:</div>
                                        <div>
                                            {queryData.website_name === "others"
                                                ? queryData.other_website
                                                : queryData.website_name}
                                        </div>
                                    </div>
                                )}



                                <div className="flex items-center">
                                    <div className="w-32 font-medium">Created Date:</div>
                                    <div>{queryData.created_on && new Date(queryData.created_on * 1000).toLocaleString('en-US', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</div>
                                </div>

                            </div>
                            {queryData.box_tag && (
                                <div className="flex items-center my-2">
                                    <div className="w-32 font-medium">Box Tag:</div>
                                    <div className="ml-2 flex flex-wrap gap-1 space-x-2">
                                        {queryData.box_tag_names.split(',').map((tag, index) => (
                                            <span key={index} className="inline-block bg-gray-100 rounded px-1 py-0.5">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium mb-1">Select Company</label>
                                    <select
                                        className="w-full border p-1 rounded text-xs"
                                        onChange={handleCompanyChange}
                                        value={selectedCompany}
                                    >
                                        <option value="">Select Company</option>
                                        {companyData.map((company) => (
                                            <option key={company.id} value={company.id}>
                                                {company.company_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex-1">
                                    <label className="block text-xs font-medium mb-1">Select Website</label>
                                    <select className="w-full border p-1 rounded text-xs"
                                        onChange={(e) => setSelectedWebsite(e.target.value)}
                                        value={selectedWebsite}
                                    >
                                        <option value="">Select Website</option>
                                        {filteredWebsites.map((website) => (
                                            <option key={website.id} value={website.id}>
                                                {website.website_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {sessionStorage.getItem('user_type') == 'user' && (
                                <div className="flex items-center gap-4 mt-2">
                                    <button onClick={handleClaim} className="bg-orange-500 text-white px-3 py-1 rounded">Claim</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </motion.div>
    );
};

export default BoxQueryDetails;
