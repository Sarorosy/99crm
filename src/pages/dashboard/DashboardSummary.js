import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { CircleX } from 'lucide-react';

const DashboardSummary = ({ filterDate, onClose }) => {
    const [data, setData] = useState(null);
    const userId = sessionStorage.getItem("id");
    const userType = sessionStorage.getItem("user_type");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.post("https://99crm.phdconsulting.in/zend/api/dashboardsummary", {
                    date_type: "ass_qr.update_status_date",
                    filter_date: filterDate,
                    user_id: userId,
                    user_type: userType,
                    team_id : sessionStorage.getItem("team_id")
                });
                setData(response.data);
            } catch (error) {
                console.error("Error fetching dashboard summary:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [filterDate, userId, userType]);

    

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
            <div className="bg-white rounded-lg shadow-lg p-4 relative qhpage col-md-6">
                {/* <div className="flex justify-end"> */}
                <button
                    onClick={onClose}
                    className="absolute trx px-2 py-1 text-gray-600 hover:text-red-600 transition-colors cremove"
                >
                    <CircleX size={32} />
                </button>
                {/* </div> */}
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                <div className="w-2xl mx-auto overflow-x-auto rounded-lg mt-2">
                    <table className=" bg-white divide-y divide-gray-200 text-xs mx-auto shadow-md">
                        <thead className="bg-gradient-to-r from-blue-600 to-blue-800">
                            <tr>
                                <th className="px-3 py-2 text-left font-semibold text-white">&nbsp;</th>
                                <th className="px-3 py-2 text-center font-semibold text-white">Total Queries</th>
                                <th className="px-3 py-2 text-center font-semibold text-white">Live Queries</th>
                                <th className="px-3 py-2 text-center font-semibold text-white w-1/5">Conversion Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 border">
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-3 py-2 font-medium text-gray-900">Total Data Conversion</td>
                                <td className="px-3 py-2 text-center text-gray-800">{data.totalQuery}</td>
                                <td className="px-3 py-2 text-center text-gray-800">{data.liveQuery}</td>
                                <td className="px-3 py-2 text-center font-medium text-blue-600">{data.conversionRate.toFixed(2)}%</td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-3 py-2 font-medium text-gray-900">3 Months Conversion Average</td>
                                <td className="px-3 py-2 text-center text-gray-800">{data.totalQuery2}</td>
                                <td className="px-3 py-2 text-center text-gray-800">{data.liveQuery2}</td>
                                <td className="px-3 py-2 text-center font-medium text-blue-600">{data.conversionRate2.toFixed(2)}%</td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-3 py-2 font-medium text-gray-900">90 Days Conversion Average</td>
                                <td className="px-3 py-2 text-center text-gray-800">{data.totalQuery90}</td>
                                <td className="px-3 py-2 text-center text-gray-800">{data.liveQuery90}</td>
                                <td className="px-3 py-2 text-center font-medium text-blue-600">{data.conversionRate90.toFixed(2)}%</td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-3 py-2 font-medium text-gray-900">Current Month Conversion</td>
                                <td className="px-3 py-2 text-center text-gray-800">{data.totalQuery1}</td>
                                <td className="px-3 py-2 text-center text-gray-800">{data.liveQuery1}</td>
                                <td className="px-3 py-2 text-center font-medium text-blue-600">{data.conversionRate1.toFixed(2)}%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                )}
            </div>
        </motion.div>
    );
};

export default DashboardSummary;
