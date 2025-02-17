import React, { useEffect, useState } from "react";
import axios from "axios";
import CustomLoader from "../../components/CustomLoader";
import { RefreshCcw } from "lucide-react";

const AddQuerySideDetails = ({ TodayCreatedQuery }) => {
    const [todayTask, setTodayTask] = useState([]);
    const [todayCreatedQuery, setTodayCreatedQuery] = useState([]);
    const category = sessionStorage.getItem('category');
    const [loading, setLoading] = useState(false);
    const fetchDetails = async () => {
        try {
            setLoading(true);
            const currentDate = new Date().toLocaleDateString("en-US"); // Format: mm/dd/yyyy
            const todayDate = new Date().toISOString().slice(0, 10) + " 08:00:00"; // Format: yyyy-mm-dd 08:00:00

            // Convert the date to seconds (Zend payload format)
            const currentDateInSeconds = Math.floor(Date.parse(currentDate) / 1000);
            const todayDateInSeconds = Math.floor(Date.parse(todayDate) / 1000);

            // API calls
            const [pendingTaskResponse, createdQueryResponse] = await Promise.all([
                axios.post("https://99crm.phdconsulting.in/99crmwebapi/api/userpendingtodaytask", {
                    currentDate: currentDateInSeconds,  // Send in seconds
                    category: category, // Replace with appropriate category
                }),
                axios.post("https://99crm.phdconsulting.in/99crmwebapi/api/todaycreatedquery", {
                    currentDate: todayDateInSeconds, // Send in seconds
                }),
            ]);

            // Set data
            setTodayTask(pendingTaskResponse.data.data || []);
            setTodayCreatedQuery(createdQueryResponse.data.data || []);
        } catch (error) {
            console.error("Error fetching details:", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {


        fetchDetails();
    }, []);

    // Calculate total pending tasks
    const totalPendingTask = todayTask.reduce((total, task) => total + parseInt(task.total_pending, 10), 0);


    return (
        <>

            <div className="flex items-center flex-col justify-between space-y-2 ">
                {/* Today Pending Task */}
                <div className=" rounded p-4 border-t-2 border-blue-400 bg-white shadow-xl">
                    <h3 className="font-bold  border-b pb-2 mb-3 flex items-center justify-between space-x-1 text-sm">Today Pending Task for Users <button className="bg-gray-100 rounded" onClick={fetchDetails}><RefreshCcw size={12} /></button></h3>
                    {loading ? (<CustomLoader />) : (
                        <>
                            <div style={{ overflowY: 'auto', maxHeight: '19.2rem' }}>
                                <table className="table-auto w-full border-collapse border border-gray-200 iqt table-responsive sptid">
                                    <thead>
                                        <tr>
                                            <th className="border border-gray-300 px-2 py-1 text-sm">User Name</th>
                                            <th className="border border-gray-300 px-2 py-1 text-sm">Total Pending</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {todayTask.map((user, index) => (
                                            <tr key={index}>
                                                <td className="border border-gray-300 px-2" style={{ fontSize: '13px' }}>
                                                    {user.user_name}
                                                </td>
                                                <td className="border border-gray-300 px-2" style={{ fontSize: '13px' }}>
                                                    {user.total_pending}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="font-bold text-red-500 text-md">
                                            <td className="border border-gray-300 px-2"><small>Total Pending Task</small></td>
                                            <td className="border border-gray-300 px-2 text-md"><small>{totalPendingTask}</small></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                        </>
                    )}
                </div>

                {TodayCreatedQuery == 1 && (
                    <div className="border-t-2 border-blue-400 bg-white shadow-xl rounded px-4 py-3">
                        <h3 className="font-bold text-sm border-b pb-2 mb-2">Today Created Query</h3>
                        <table className="table-auto w-full border-collapse border border-gray-200 dataTable">
                            <thead>
                                <tr>
                                    <th className="border border-gray-300 px-2 py-1 text-sm">User Name</th>
                                    <th className="border border-gray-300 px-2 py-1 text-sm">Profile</th>
                                    <th className="border border-gray-300 px-4 py-1 text-sm">CRM Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {todayCreatedQuery.map((user, index) => (
                                    <tr key={index}>
                                        <td className="border border-gray-300 px-2 " style={{ fontSize: "13px" }}>{user.name}</td>
                                        <td className="border border-gray-300 px-2 " style={{ fontSize: "13px" }}>
                                            {user.website_name} ({user.profile_name})
                                        </td>
                                        <td className="border border-gray-300 px-2 " style={{ fontSize: "13px" }}>{user.user_name}</td>
                                    </tr>
                                ))}
                                <tr className="font-bold text-red-500">
                                    <td className="border border-gray-300 px-2 text-md">Total Query</td>
                                    <td className="border border-gray-300 px-2 text-md" colSpan={2}>
                                        {todayCreatedQuery.length}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>



        </>
    );
};

export default AddQuerySideDetails;
