import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { X } from "lucide-react";
const DashboardSummary = ({ filterDate, onClose }) => {
    const [data, setData] = useState(null);
    const userId = sessionStorage.getItem("id");
    const userType = sessionStorage.getItem("user_type");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.post("https://99crm.phdconsulting.in/api/dashboardsummary", {
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
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-2/3 w-full bg-gray-100 shadow-lg z-50 overflow-y-auto "
        >
            <div className="col-md-12">
                <div className="flex px-5 py-3 justify-end">
                <button
                    onClick={onClose}
                    className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500"
                >
                    <X size={12} />
                </button>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                <div className="w-2xl mx-auto overflow-x-auto rounded-lg ">
                    <table className=" bg-white divide-y divide-gray-200 text-xs mx-auto shadow-md">
                        <thead className="bg-gradient-to-r from-blue-600 to-blue-800">
                            <tr>
                                <th className="px-3 py-2 text-left font-semibold text-white">&nbsp;</th>
                                <th className="px-3 py-2 text-center font-semibold text-white">Total Queries</th>
                                <th className="px-3 py-2 text-center font-semibold text-white">Live Queries</th>
                                <th className="px-3 py-2 text-center font-semibold text-white w-1/5">Conversion Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
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
