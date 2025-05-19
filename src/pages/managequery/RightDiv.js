import React, { act, useState } from "react";
import WhatsappChatArea from "./QueryDetailsComponents/WhatsappChatArea";
import { Twitch } from "lucide-react";
import EmailDiv from "./QueryDetailsComponents/EmailDiv";
import { AnimatePresence } from "framer-motion";
import CommentDiv from "./QueryDetailsComponents/CommentDiv";

const RightDiv = ({ queryInfo, tempateInfo, commentInfo, whatsappOptions, callOptions, after,onClose , fetchDashboardQueriesForSocket}) => {
    const userType = sessionStorage.getItem('user_type');
    const [activeTab, setActiveTab] = useState('email');
    const [commentsDivVisible, setCommentsTabVisible] = useState(false);

    const handleWhatsAppChat = () => {
        setActiveTab('whatsapp');
    };

    const handleGetAutoComments = async () => {
        setCommentsTabVisible(true); // Show the comments tab when this is clicked.
    };

    const handleEmailMessageArea = () => {
        setActiveTab('email');
    };

    const handleStatusChange = (event) => {
        console.log("Status changed to:", event.target.value);
    };

    return (
        <div className="col-md-6 connectedSortable bg-white rounded shadow-md" id="rightColomnDiv">
            {/* Right Section */}
            <div className="box box-primary direct-chat direct-chat-primary p-2 pe-3">
                <div className="flex justify-between items-center px-0 py-3 border-b">
                    <h3 className="text-lg font-semibold">
                        Comments
                    </h3>

                    <div className="flex space-x-4">
                        {queryInfo.company_id && queryInfo.interakt_api && queryInfo.company_id !== "" && queryInfo.interakt_api !== "" && activeTab !== "whatsapp" && !commentsDivVisible ? (
                            <button
                                className="flex items-center bg-green-500 text-white py-1 px-2 rounded-md hover:bg-green-600"
                                onClick={handleWhatsAppChat}
                                style={{ fontSize: "10px" }}
                            >
                                <Twitch size={14} className="mr-2" /> WhatsApp Chat
                            </button>
                        ) : ""}

                        {activeTab === "whatsapp" && !commentsDivVisible && (
                            <button
                                className="flex items-center bg-blue-500 text-white py-1 px-2 rounded-md hover:bg-blue-600"
                                onClick={handleEmailMessageArea}
                            >
                                <i className="fa fa-envelope mr-2" aria-hidden="true"></i> Email Message
                            </button>
                        )}

                        <button
                            className="flex items-center bg-blue-500 text-white py-1 px-2 rounded-md hover:bg-blue-600"
                            onClick={handleGetAutoComments}
                        >
                            <i className="fa fa-fw fa-refresh mr-2"></i> Show Conversations
                        </button>
                    </div>
                </div>

                {/* Conditional Rendering for WhatsappChatArea, EmailDiv, and CommentDiv */}
                {!commentsDivVisible && (
                    <>
                        {activeTab === "whatsapp" ? (
                            <div className="box-body my-2">
                                <WhatsappChatArea company_id={queryInfo.company_id} refId={queryInfo.assign_id} />
                            </div>
                        ) : (
                            <div className="box-body emailBodyArea">
                                <EmailDiv queryInfo={queryInfo} templateInfo={tempateInfo} commentInfo={commentInfo} whatsappOptions={whatsappOptions} callOptions={callOptions} after={after} onClose={onClose} fetchDashboardQueriesForSocket={fetchDashboardQueriesForSocket}/>
                            </div>
                        )}
                    </>
                )}

                {/* Show CommentDiv when commentsDivVisible is true */}
                <AnimatePresence>
                    {commentsDivVisible && (
                        <CommentDiv assignId={queryInfo.assign_id} commentInfo={commentInfo} onClose={() => { setCommentsTabVisible(false) }} after={after}/>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};


export default RightDiv;
