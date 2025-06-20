import { X } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";

const HistoryComponent = ({ queryInfo }) => {
    const [callHistoryData, setCallHistoryData] = useState([]);
    const [whatsappHistoryData, setWhatsappHistoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    // Fetch Call History
    const fetchCallHistory = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://99crm.phdconsulting.in/zend/api/getcalloptvaluehistory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ assign_id: queryInfo.assign_id }),
            });
            const data = await response.json();
            if (data.status) {
                setCallHistoryData(data.calloptvaluehistoryData);
                setShowHistory(true); // Show history after data is fetched
            } else {
                toast.error("Error fetching call history!");
            }
            setWhatsappHistoryData([])
        } catch (error) {
            toast.error("Error fetching call history!");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch WhatsApp History
    const fetchWhatsappHistory = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://99crm.phdconsulting.in/zend/api/getwhatsappoptvaluehistory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ assign_id: queryInfo.assign_id }),
            });
            const data = await response.json();
            if (data.status) {
                setWhatsappHistoryData(data.whatsappoptvaluehistoryData);
                setShowHistory(true); // Show history after data is fetched
            } else {
                toast.error("Error fetching WhatsApp history!");
            }
            setCallHistoryData([])
        } catch (error) {
            toast.error("Error fetching WhatsApp history!");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };



    const renderHistoryTable = (data, type) => {
        return (
            <table className="min-w-full table-auto border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2">Option</th>
                        <th className="border border-gray-300 px-4 py-2">Sub Option</th>
                        <th className="border border-gray-300 px-4 py-2">Date</th>
                    </tr>
                </thead>
                <tbody style={{fontSize:"11px"}}>
                    {data.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">{item.option_val}</td>
                            <td className="border border-gray-300 px-4 py-2">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            type === "call"
                                                ? item.call_sub_option + item.call_sub_sub_option
                                                : item.whatsapp_sub_option + item.whatsapp_sub_sub_option,
                                    }}
                                ></div>

                            </td>
                            <td className="border border-gray-300 px-4 py-2">{new Date(item.date * 1000).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <>
        <div className="mt-3 px-2 rounded">
            <div className="flex space-x-4 mb-3">
                <button
                    onClick={fetchCallHistory}
                    type="button"
                    className="bg-blue-600 text-white px-2 py-1 fssx rounded-md hover:bg-blue-500 transition"
                >
                    Call History
                </button>
                <button
                    onClick={fetchWhatsappHistory}
                    type="button"
                    className="bg-green-600 text-white px-2 py-1 fssx rounded-md hover:bg-green-700 transition"
                >
                    WhatsApp History
                </button>
            </div>
            {loading && (<div className="animate-pulse space-y-4 mt-2">
                <div className="h-12 bg-gray-300 rounded w-full"></div>
                <div className="h-12 bg-gray-300 rounded w-full"></div>
                <div className="h-12 bg-gray-300 rounded w-full"></div>
                <div className="h-12 bg-gray-300 rounded w-full"></div>
            </div>
            )}
            {/* Toggle History Visibility */}
            {showHistory && !loading && (
                <div className="">

                    


                    {callHistoryData.length > 0 && (
                        <div className="bg-gray-100 border p-2 rounded">
                            <div className="flex justify-between mb-2 px-2">
                                <h3 className="text-sm font-semibold">Call History</h3>
                                <button
                                    onClick={() => setShowHistory(false)}
                                    className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                            <div>
                                {renderHistoryTable(callHistoryData, "call")}
                            </div>
                        </div>
                    )}

                    {/* WhatsApp History Table */}
                    {whatsappHistoryData.length > 0 && (
                        <div className="bg-gray-100 border p-2 rounded">
                            <div className="flex justify-between mb-2 px-2">
                                <h3 className="text-sm font-semibold">WhatsApp History</h3>
                                <button
                                    onClick={() => setShowHistory(false)}
                                    className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                                >
                                    <X size={12} />
                                </button>
                                
                            </div>
                            <div>
                                {renderHistoryTable(whatsappHistoryData, "whatsapp")}
                            </div>
                        </div>
                    )}

                    


                </div>
            )}
        </div></>
    );
};

export default HistoryComponent;
