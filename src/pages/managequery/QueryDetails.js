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
import UserPriceQuote from '../module/pricequote/UserPriceQuote';
import ShowHoldQuery from './QueryDetailsComponents/ShowHoldQuery';
import { getSocket } from '../../Socket';

const QueryDetails = ({ refId, onClose, fetchDashboardQueriesForSocket }) => {
    const socket = getSocket();
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
            const response = await fetch('https://99crm.phdconsulting.in/zend/api/queryDetails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            setQueryInfo(data.queryInfo);
            setEscalationMark(data.queryInfo?.escalation_mark);
            setQueryFiles(data.QueryFilesData);
            setLoading(false);
            setAllPriority(data.priorityArr);
            setInternalCommentsData(data.internalCommentData)
            setCampaginCommentData(data.campaginCommentData?.comments);
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

    const fetchQueryDetailsForSocket = async () => {
        setLoading(false);
        console.log("fetching query details from socket")
        const id = sessionStorage.getItem('id');
        const category = sessionStorage.getItem('category');

        const payload = {
            query_id: refId,
            category: category,
            user_id: id
        };

        try {
            const response = await fetch('https://99crm.phdconsulting.in/zend/api/queryDetails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            setQueryInfo(data.queryInfo);
            setEscalationMark(data.queryInfo?.escalation_mark);
            setQueryFiles(data.QueryFilesData);
            setLoading(false);
            setAllPriority(data.priorityArr);
            setInternalCommentsData(data.internalCommentData)
            setCampaginCommentData(data.campaginCommentData?.comments);
            setTatScore(data.TatScore);
            setTemplateInfo(data.templateInfo);
            setCommentInfo(data.CommentInfo);


        } catch (error) {
            console.error('Error fetching query details:', error);
            
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        fetchQueryDetails();
    }, []);

    const fetchWhatsappOptions = async () => {
        try {
            const response = await fetch("https://99crm.phdconsulting.in/zend/api/getwhatsappoptions");
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
            const response = await fetch("https://99crm.phdconsulting.in/zend/api/getcalloptions");
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

    

    useEffect(() => {
        const handleSocketDataa = async (data) => {
    
          if (refId == data.query_id) {
            await fetchQueryDetailsForSocket(); // Await the async function
          }
        };
    
        socket.on("query_status_updated_emit", handleSocketDataa);
    
        return () => {
          socket.off("query_status_updated_emit", handleSocketDataa); // Clean up properly
        };
      }, []);

    useEffect(() => {
        socket.on('query_edited_emit', (data) => {
         console.log("Socket data received for query_edited_emit: data :", data );
            if (refId == data.query_id) {
                fetchQueryDetailsForSocket();
            }
        });

        return () => {
            socket.off('query_edited_emit');  // Clean up on component unmount
        };
    }, []);

    useEffect(() => {
        socket.on('query_hold_updated_emit', (data) => {
            console.log("Socket data received:", data);
            if (data.query_id == refId) {
                fetchQueryDetailsForSocket();
            }
        });

        return () => {
            socket.off('query_hold_updated_emit');  // Clean up on component unmount
        };
    }, []);

    // Dummy content for each tab
    const TabContent = () => {
        switch (activeTab) {
            case 1:
                return <div className="text-sm text-gray-700 p-2">
                    <QueryInformation refId={refId} queryInfo={queryInfo} queryFiles={queryFiles} loading={loading} allPriority={allPriority} fetchQueryDetails={fetchQueryDetails} fetchSocket={fetchQueryDetailsForSocket} />
                </div>;
            case 2:
                return <div className="text-sm text-gray-700 p-2">
                    <UserPriceQuote refId={refId} after={fetchQueryDetails}/>
                </div>;
            case 3:
                return <div className="text-sm text-gray-700 p-2">
                    <ShowAttachedFiles refId={refId} crmId={queryInfo.user_id} />
                </div>;
            case 4:
                return <div className="text-sm text-gray-700 p-2">
                    <InternalComments internalCommentsData={internalCommentsData} />
                </div>;
            case 5:
                return <div className="text-sm text-gray-700 p-2">
                    <CampaignComments campaginCommentData={campaginCommentData} />
                </div>;
            case 6:
                return <div className="text-sm text-gray-700 p-2">
                    <ShowHoldQuery queryInfo={queryInfo} finalFunction={fetchQueryDetails}/>
                </div>;
            default:
                return <div className="text-sm text-gray-700 p-2">Query Information</div>;
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
            const response = await fetch("https://99crm.phdconsulting.in/zend/api/update-escalation-status", {
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

    const currentTime = Math.floor(Date.now() / 1000); // current UNIX timestamp in seconds
    const expiryTime = parseInt(queryInfo?.inConversationMarkExpiry, 10) || 0;

    const shouldShowHoldQuery =
        ((queryInfo?.hold_query == 1 || queryInfo?.hold_query == 3) && sessionStorage.getItem("crmRoleType") == 'opsuser') ||
        ((queryInfo?.hold_query != 1 && queryInfo?.hold_query != 3) &&
            sessionStorage.getItem("user_type") == 'Data Manager' &&
            (!expiryTime || expiryTime <= currentTime)) ||
        sessionStorage.getItem("user_type") == 'admin';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-gray-50 z-50 overflow-y-scroll p-2"
        >
            <div className="rounded-lg bg-white border overflow-hidden">
                {/* Header */}
                <div className="flex px-3 items-center justify-between theme py-2 rounded-t-lg">
                    <h2 className="text-md font-semibold">Query Details</h2>
                    <div className='flex items-center gap-2'>
                         <div className='f-12'>

                            {tatScore && (
                                tatScore.total_score !== null && tatScore.total_minute !== null ? (
                                    <div className=''>
                                        {/* Format the average TAT (in hours and minutes) */}
                                        {(() => {
                                            const hours = Math.floor(tatScore.total_minute / 60);
                                            const minutes = tatScore.total_minute % 60;
                                            return (
                                                <div className='flex items-center gap-2'>
                                                    <p>
                                                        Average TAT: {hours < 10 ? `0${hours}` : hours}h{" "}
                                                        {minutes < 10 ? `0${minutes}` : minutes}m </p>
                                                    <p>
                                                        Average Score: {tatScore.total_score}
                                                    </p>
                                                    {queryInfo.showBellicon == 1 && (
                                                        <Bell className='text-red-600 bg-red-200  rounded-full p-1' size={23} />
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
                        <div className="flex items-center bg-blue-50 rounded px-2 py-1 text-blue-600 border hover:border-blue-100 hover:bg-transparent hover:text-green-600">
                            <input
                                type="checkbox"
                                id="escalationMark"
                                checked={escalationMark}
                                onChange={handleEscalationChange}
                                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                            />
                            <label htmlFor="escalationMark" className="ml-2 f-13  cursor-pointer">
                                Escalation Mark
                            </label>
                        </div>
                       
                        <button
                            onClick={onClose}
                            className="btn btn-danger btn-sm px-1"
                        >
                            <X size={12} />
                        </button>
                    </div>
                </div>

                <div className='p-2'>
                    <div className='row'>
                        <div className="col-md-6 flex">
                            <div className='p-2 bg-light border w-100'>
                                <div className="flex bg-white">
                                    {/* Tab buttons */}
                                    <button
                                        onClick={() => setActiveTab(1)}
                                        style={{ fontSize: "11px" }}
                                        className={` inact font-medium px-2 py-1 transition-colors ${activeTab === 1 ? 'border-b-2 border-green-400 theme' : ''}`}
                                    >
                                        Query Information
                                    </button>
                                    {queryInfo && queryInfo != null && queryInfo.hold_query != 1 && queryInfo.hold_query != 3 && (
                                        <>

                                            <button
                                                onClick={() => setActiveTab(2)}
                                                style={{ fontSize: "11px" }}
                                                className={`inact font-medium px-2 py-1 transition-colors ${activeTab === 2 ? 'border-b-2 border-green-400 theme' : 'text-gray-500 hover:text-green-600'}`}
                                            >
                                                Generate Price
                                            </button>
                                            <button
                                                onClick={() => setActiveTab(3)}
                                                style={{ fontSize: "11px" }}
                                                className={`inact font-medium px-2 py-1 transition-colors ${activeTab === 3 ? 'border-b-2 border-green-400 theme' : 'text-gray-500 hover:text-green-600'}`}
                                            >
                                                Attached Files
                                            </button>
                                            <button
                                                onClick={() => setActiveTab(4)}
                                                style={{ fontSize: "11px" }}
                                                className={` inact flex items-center font-medium px-2 py-1 transition-colors ${activeTab === 4 ? 'border-b-2 border-green-400 theme' : 'text-gray-500 hover:text-green-600'}`}
                                            >
                                                Internal Comments <span className='bg-yellow-500 py-1 px-2 ml-1 rounded-full text-white'>{internalCommentsData.length}</span>
                                            </button>
                                            <button
                                                onClick={() => setActiveTab(5)}
                                                style={{ fontSize: "11px" }}
                                                className={`inact flex items-center  font-medium px-2 py-1  transition-colors ${activeTab === 5 ? 'border-b-2 border-green-400 theme' : 'text-gray-500 hover:text-green-600'}`}
                                            >
                                                Campaign Comments <span className='bg-yellow-500 py-1 px-2 ml-1 rounded-full text-white'>{campaginCommentData.length}</span>
                                            </button>
                                        </>
                                    )}
                                    {shouldShowHoldQuery && (
                                        <button
                                            onClick={() => setActiveTab(6)} // assuming you want to make this the 6th tab
                                            style={{ fontSize: "11px" }}
                                            className={`inact font-medium px-2 py-1 transition-colors ${activeTab === 6 ? 'border-b-2 border-green-400 theme' : 'text-gray-500 hover:text-green-600'}`}
                                        >
                                            Hold Query
                                        </button>
                                    )}


                                </div>
                                <div className="">
                                    <TabContent />
                                </div>
                            </div>
                        </div>
                        {queryInfo && queryInfo != null && queryInfo.hold_query != 1 && queryInfo.hold_query != 3 && (
                            <RightDiv queryInfo={queryInfo} tempateInfo={tempateInfo} commentInfo={commentInfo} whatsappOptions={whatsappOptions} callOptions={callOptions} after={fetchQueryDetails} onClose={onClose} fetchDashboardQueriesForSocket={fetchDashboardQueriesForSocket} />
                        )}
                    </div>
                </div>

                {/* Tab Content */}

            </div>
        </motion.div>
    );
};

export default QueryDetails;
