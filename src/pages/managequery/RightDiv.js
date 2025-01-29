import React, { act, useState } from "react";
import WhatsappChatArea from "./QueryDetailsComponents/WhatsappChatArea";
import { Twitch } from "lucide-react";
import EmailDiv from "./QueryDetailsComponents/EmailDiv";

const RightDiv = ({ queryInfo, tempateInfo }) => {

    const userType = sessionStorage.getItem('user_type');
    const [activeTab, setActiveTab] = useState('email');

    const handleWhatsAppChat = () => {
        setActiveTab('whatsapp');
    };

    const handleGetAutoComments = () => {
        console.log("Show Conversations triggered");
    };

    const handleEmailMessageArea = () => {
        setActiveTab('email');
    };

    const handleStatusChange = (event) => {
        console.log("Status changed to:", event.target.value);
    };

    return (
        <div className="col-md-7 connectedSortable" id="rightColomnDiv">
            {/* Right Section */}
            <div className="box box-primary direct-chat direct-chat-primary">
                <div className="flex justify-between items-center px-4 py-3 border-b">
                    <h3 className="text-lg font-semibold">
                        Comments
                    </h3>

                    <div className="flex space-x-4">
                        {queryInfo.company_id && queryInfo.interakt_api && queryInfo.company_id != "" && queryInfo.interakt_api != "" && activeTab != "whatsapp" ? (
                            <button
                                className="flex items-center bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                                onClick={handleWhatsAppChat}
                                style={{ fontSize: "10px" }}
                            >
                                <Twitch size={16} className="mr-2" /> WhatsApp Chat
                            </button>
                        ) : ""}
                        {activeTab == "whatsapp" && (
                            <button

                                className="flex items-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                                onClick={handleEmailMessageArea}

                            >
                                <i className="fa fa-envelope mr-2" aria-hidden="true"></i> Email Message
                            </button>
                        )}

                        <button
                            className="flex items-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                            onClick={handleGetAutoComments}
                        >
                            <i className="fa fa-fw fa-refresh mr-2"></i> Show Conversations
                        </button>
                    </div>
                </div>

                {activeTab == "whatsapp" ? (
                    <div className="box-body my-2">
                        <WhatsappChatArea company_id={queryInfo.company_id} refId={queryInfo.assign_id} />
                    </div>
                ) : (

                    <div className="box-body emailBodyArea">
                        <EmailDiv queryInfo={queryInfo} templateInfo={tempateInfo}/>
                    </div>
                )}




            </div>
        </div>
    );
};

export default RightDiv;
