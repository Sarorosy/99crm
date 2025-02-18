import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import QueryInformation from './QueryDetailsComponents/QueryInformation';
import GeneratePriceQuote from './QueryDetailsComponents/GeneratePriceQuote';
import ShowAttachedFiles from './QueryDetailsComponents/ShowAttachedFiles';
import InternalComments from './QueryDetailsComponents/InternalComments';
import CampaignComments from './QueryDetailsComponents/CampaignComments';
import toast from 'react-hot-toast';
import RightDiv from './RightDiv';

const QueryDetails = ({ refId, onClose }) => {
    const [activeTab, setActiveTab] = useState(1);
    const [queryInfo, setQueryInfo] = useState(null);
    const [tempateInfo, setTemplateInfo] = useState(null);
    const [queryFiles, setQueryFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [escalationMark, setEscalationMark] = useState(0);
    const [allPriority, setAllPriority] = useState([]);
    const [internalCommentsData, setInternalCommentsData] = useState([]);
    const [campaginCommentData, setCampaginCommentData] = useState([]);
    const [commentInfo, setCommentInfo] = useState([]);
    const [tatScore, setTatScore] = useState(null);
    const [whatsappOptions, setWhatsappOptions] = useState([]);
    const [callOptions, setCallOptions] = useState([]);

    const fetchQueryDetails = async () => {
        const id = sessionStorage.getItem('id');
        const category = sessionStorage.getItem('category');

        const payload = {
            query_id: refId,
            category: category,
            user_id: id
        };

        try {
            const response = await fetch('https://99crm.phdconsulting.in/api/queryDetails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            setQueryInfo(data.queryInfo);
            setEscalationMark(data.queryInfo.escalation_mark);
            setQueryFiles(data.QueryFilesData);
            setLoading(false);
            setAllPriority(data.priorityArr);
            setInternalCommentsData(data.internalCommentData)
            setCampaginCommentData(data.campaginCommentData.comments);
            setTatScore(data.TatScore);
            setTemplateInfo(data.templateInfo);
            setCommentInfo(data.CommentInfo);


        } catch (error) {
            console.error('Error fetching query details:', error);
            setLoading(false);
        } finally {
            fetchWhatsappOptions();
            fetchCallOptions();
        }
    };

    useEffect(() => {

        fetchQueryDetails();
    }, []);

    const fetchWhatsappOptions = async () => {
        try {
            const response = await fetch("https://99crm.phdconsulting.in/api/getwhatsappoptions");
            const data = await response.json();
            if (data.status) {
                setWhatsappOptions(data.options);  // Set the options to state
            } else {
                console.error("Failed to fetch options");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const fetchCallOptions = async () => {
        try {
            const response = await fetch("https://99crm.phdconsulting.in/api/getcalloptions");
            const data = await response.json();
            if (data.status) {
                setCallOptions(data.options);  // Set the options to state
            } else {
                console.error("Failed to fetch options");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };


    // Dummy content for each tab
    const TabContent = () => {
        switch (activeTab) {
            case 1:
                return <div className="text-sm text-gray-700">
                    <QueryInformation refId={refId} queryInfo={queryInfo} queryFiles={queryFiles} loading={loading} allPriority={allPriority} fetchQueryDetails={fetchQueryDetails} />
                </div>;
            case 2:
                return <div className="text-sm text-gray-700">
                    <GeneratePriceQuote refId={refId} />
                </div>;
            case 3:
                return <div className="text-sm text-gray-700">
                    <ShowAttachedFiles refId={refId} crmId={queryInfo.user_id} />
                </div>;
            case 4:
                return <div className="text-sm text-gray-700">
                    <InternalComments internalCommentsData={internalCommentsData} />
                </div>;
            case 5:
                return <div className="text-sm text-gray-700">
                    <CampaignComments campaginCommentData={campaginCommentData} />
                </div>;
            default:
                return <div className="text-sm text-gray-700">Query Information</div>;
        }
    };



    const handleEscalationChange = async (e) => {
        const checked = e.target.checked;
        setEscalationMark(checked);

        // Post data to the API
        const postData = {
            assign_id: refId,
            escalation_mark: checked ? 1 : 0,
            user_id: sessionStorage.getItem("id"),
        };

        try {
            const response = await fetch("https://99crm.phdconsulting.in/api/update-escalation-status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(postData),
            });

            const result = await response.json();
            if (result.status) {
                console.error("Failed to update escalation status", result);
                toast.success("Escalation status updated.");
            }
        } catch (error) {
            console.error("Error posting escalation status:", error);
            alert("An error occurred while updating escalation status.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-gray-50 shadow-md z-50 overflow-y-auto p-6"
        >
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="flex px-5 items-center justify-between theme py-3 rounded-t-lg">
                    <h2 className="text-lg font-semibold">Query Details</h2>
                    <div className='flex items-center'>
                        <div className="flex items-center mr-4 bg-blue-50 rounded-full px-2 py-1 text-blue-600 border hover:border-blue-100 hover:bg-transparent hover:text-green-600">
                            <input
                                type="checkbox"
                                id="escalationMark"
                                checked={escalationMark}
                                onChange={handleEscalationChange}
                                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                            />
                            <label htmlFor="escalationMark" className="ml-2 text-sm  cursor-pointer">
                                Escalation Mark
                            </label>
                        </div>
                        <div className='mr-5' style={{ fontSize: "12px" }}>

                            {tatScore && (
                                tatScore.total_score !== null && tatScore.total_minute !== null ? (
                                    <div className=''>
                                        {/* Format the average TAT (in hours and minutes) */}
                                        {(() => {
                                            const hours = Math.floor(tatScore.total_minute / 60);
                                            const minutes = tatScore.total_minute % 60;
                                            return (
                                                <div className='flex items-center'>
                                                    <p>
                                                        Average TAT: {hours < 10 ? `0${hours}` : hours}h{" "}
                                                        {minutes < 10 ? `0${minutes}` : minutes}m <br />
                                                        Average Score: {tatScore.total_score}
                                                    </p>
                                                    {queryInfo.showBellicon == 1 && (
                                                        <Bell className='text-red-600 mx-3 bg-red-200  rounded-full p-1' size={17} />
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                ) : (
                                    <p></p>
                                )
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500"
                        >
                            <X size={12} />
                        </button>
                    </div>
                </div>

                <div className='row'>
                    <div className=" mt-4 col-md-5 ">
                        <div className="flex space-x-2 border-b px-2">
                            {/* Tab buttons */}
                            <button
                                onClick={() => setActiveTab(1)}
                                style={{ fontSize: "11px" }}
                                className={` font-medium px-2 py-1 rounded-lg transition-colors ${activeTab === 1 ? 'border-b-2 border-green-400 theme' : 'text-gray-500 hover:text-green-600'}`}
                            >
                                Query Information
                            </button>
                            <button
                                onClick={() => setActiveTab(2)}
                                style={{ fontSize: "11px" }}
                                className={` font-medium px-2 py-1 rounded-lg transition-colors ${activeTab === 2 ? 'border-b-2 border-green-400 theme' : 'text-gray-500 hover:text-green-600'}`}
                            >
                                Generate Price
                            </button>
                            <button
                                onClick={() => setActiveTab(3)}
                                style={{ fontSize: "11px" }}
                                className={` font-medium px-2 py-1 rounded-lg transition-colors ${activeTab === 3 ? 'border-b-2 border-green-400 theme' : 'text-gray-500 hover:text-green-600'}`}
                            >
                                Attached Files
                            </button>
                            <button
                                onClick={() => setActiveTab(4)}
                                style={{ fontSize: "11px" }}
                                className={`flex items-center font-medium px-2 py-1 rounded-lg transition-colors ${activeTab === 4 ? 'border-b-2 border-green-400 theme' : 'text-gray-500 hover:text-green-600'}`}
                            >
                                Internal Comments <span className='bg-yellow-500 py-1 px-2 ml-1 rounded-full text-white'>{internalCommentsData.length}</span>
                            </button>
                            <button
                                onClick={() => setActiveTab(5)}
                                style={{ fontSize: "11px" }}
                                className={`flex items-center  font-medium px-2 py-1 rounded-lg transition-colors ${activeTab === 5 ? 'border-b-2 border-green-400 theme' : 'text-gray-500 hover:text-green-600'}`}
                            >
                                Campaign Comments <span className='bg-yellow-500 py-1 px-2 ml-1 rounded-full text-white'>{campaginCommentData.length}</span>
                            </button>
                        </div>
                        <div className="px-1 py-6">
                            <TabContent />
                        </div>
                    </div>
                    {queryInfo && queryInfo != null && (
                        <RightDiv queryInfo={queryInfo} tempateInfo={tempateInfo} commentInfo={commentInfo} whatsappOptions={whatsappOptions} callOptions={callOptions} />
                    )}
                </div>
                
                {/* Tab Content */}

            </div>
        </motion.div>
    );
};

export default QueryDetails;
