// Dashboard.js

import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import $ from 'jquery';
import axios from "axios";
import "daterangepicker/daterangepicker.css"; // Import daterangepicker CSS
import "daterangepicker"; // Import daterangepicker JS
import moment from "moment";
import { FilterIcon, Search } from "lucide-react";

import { getSocket } from "../../Socket";

const Dashboard = () => {

    const socket = getSocket(); 
  
    
    const [keywords, setKeywords] = useState("");
   
    const [loading, setLoading] = useState(false)
const [refId, setRefId] = useState("");
const [showFilter, setShowFilter] = useState(false);
const [teamId, setTeamId] = useState("");
const [filterDate, setFilterDate] = useState("");
const [userId, setUserId] = useState(sessionStorage.getItem("id") || "");

const [last2Hrs, setLast2Hrs] = useState([]);
const [last12Hrs, setLast12Hrs] = useState([]);
const [last24Hrs, setLast24Hrs] = useState([]);
const [last2Days, setLast2Days] = useState([]);
const [last7Days, setLast7Days] = useState([]);
const [above7Days, setAbove7Days] = useState([]);

 

    const fetchOpenQueries = async () => {
    try {
        setLoading(true);
        const payload = {
            user_id: sessionStorage.getItem("id"),
            user_type: sessionStorage.getItem("user_type"),
            team_id: sessionStorage.getItem("team_id"),
            date_type: "ass_qr.update_status_date",
            userid: userId
        };

        const response = await axios.post(
            "https://99crm.phdconsulting.in/zend/api/openqueries",
            payload,
            { headers: { "Content-Type": "application/json" } }
        );

        if (response.status !== 200) {
            throw new Error("Failed to fetch dashboard data");
        }

        const {
            zeorToTwoHrs,
            twoToTwelveHrs,
            twelveToTwentyfourHrs,
            onedayToTwodays,
            twodaysToSevendays,
            aboveSevendays
        } = response.data;

        setLast2Hrs(zeorToTwoHrs || []);
        setLast12Hrs(twoToTwelveHrs || []);
        setLast24Hrs(twelveToTwentyfourHrs || []);
        setLast2Days(onedayToTwodays || []);
        setLast7Days(twodaysToSevendays || []);
        setAbove7Days(aboveSevendays || []);
    } catch (error) {
        console.error("Error fetching open query data:", error);
        toast.error(error.message || "Error fetching open query data");
    } finally {
        setLoading(false);
    }
};


    const fetchOpenQueriesForSocket = async () => {
        try {

            const payload = {
                user_id: sessionStorage.getItem("id"),
                user_type: sessionStorage.getItem("user_type"),
                team_id: sessionStorage.getItem("team_id"),
                date_type: "ass_qr.update_status_date",
              
             
                userid: userId
            };

            const response = await axios.post(
                "https://99crm.phdconsulting.in/zend/api/openqueries",
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.status !== 200) {
                throw new Error("Failed to fetch dashboard data");
            }

                const {
            zeorToTwoHrs,
            twoToTwelveHrs,
            twelveToTwentyfourHrs,
            onedayToTwodays,
            twodaysToSevendays,
            aboveSevendays
        } = response.data;

        setLast2Hrs(zeorToTwoHrs || []);
        setLast12Hrs(twoToTwelveHrs || []);
        setLast24Hrs(twelveToTwentyfourHrs || []);
        setLast2Days(onedayToTwodays || []);
        setLast7Days(twodaysToSevendays || []);
        setAbove7Days(aboveSevendays || []);


        } catch (error) {
            console.error("Error fetching open query data:", error);
            toast.error(error.message || "Error fetching open query data");
        } finally {
            setLoading(false);
        }
    };
    ////////////////////////////////////////////////////////////
    useEffect(() => {
        socket.on('new_query_emit', (data) => {
            console.log("Socket data received:", data);
            if (sessionStorage.getItem('user_type') == "admin" || sessionStorage.getItem('user_type') == "Data Manager" || sessionStorage.getItem('user_type') == "sub-admin") {
                fetchOpenQueriesForSocket();
            } else if (sessionStorage.getItem('user_type') == "user" && data.user_id == sessionStorage.getItem('id')) {
                fetchOpenQueriesForSocket();
            }
        });
    
        return () => {
          socket.off('new_query_emit');  // Clean up on component unmount
        };
      }, []);

      useEffect(() => {
        const handleSocketData = async (data) => {
            console.log("Socket data received for status update:", data);
    
            const sessionUserId = sessionStorage.getItem('id');
            const userType = sessionStorage.getItem('user_type');
    
            if (
                sessionUserId == data.user_id ||
                userType === "admin" ||
                userType === "Data Manager" ||
                userType === "sub-admin"
            ) {
                await fetchOpenQueriesForSocket(); // Await the async function
            }
        };
    
        socket.on('query_status_updated_emit', handleSocketData);
    
        return () => {
            socket.off('query_status_updated_emit', handleSocketData); // Clean up properly
        };
    }, []);
    
      ////////////////////////////////////////////////////////////

    useEffect(() => {
        // Initialize select2 for Select Team
        $(teamsRef.current).select2({
            placeholder: "Select Team",
            allowClear: true,
        }).on('change', async (e) => {
            const selectedValues = $(e.target).val(); // Use select2's value retrieval method
            setTeamId(selectedValues);
            if (selectedValues) {
                try {
                    const response = await fetch(
                        "https://99crm.phdconsulting.in/zend/99crmwebapi/api/getallusersbyteamid",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ team_id: selectedValues }),
                        }
                    );

                    const data = await response.json();
                    setUsers(data.data || []); // Ensure it sets an array
                } catch (error) {
                    console.error("Error fetching users:", error);
                }
            }
        });


        return () => {
            // Destroy select2 when the component unmounts
            if (teamsRef.current) {
                //$(teamsRef.current).select2('destroy');
            }
        };
    }, [teams]);
  

   


  
  
    useEffect(() => {
        fetchTeams();
      
        fetchOpenQueries();
    }, []);


    const handleSearch = async (e) => {
        e.preventDefault();

        const payload = {
            user_id: sessionStorage.getItem("id") || "1", // default to "1" if not set
            user_type: sessionStorage.getItem("user_type") || "admin",
            team_id: teamId,
            date_type: "ass_qr.update_status_date",
            filter_date: filterDate,
        };

        try {
            const response = await fetch("https://99crm.phdconsulting.in/zend/api/dashboardqueries", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || "Dashboard queries retrieved successfully!");
                // Process data as needed...
            } else {
                toast.error(data.message || "Failed to retrieve dashboard queries.");
            }
        } catch (error) {
            toast.error("An error occurred while retrieving dashboard queries.");
            console.error("Error:", error);
        }
    };

    return (
        <div className="py-1">
            {/* Filter Section */}
            <div className="bg-gray-50 rounded-lg px-2 py-2 mb-6">
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold ml-2 my-1 text-xl mt-0 flex items-center">Open <button className="bg-[#cfe1e5] text-[#02313a] rounded px-2 py-1 ml-3" onClick={() => setShowFilter(!showFilter)}><FilterIcon size={14} className="" /></button></h2>

                  
                </div>

                <form onSubmit={handleSearch} className="dashboardinput" style={{ display: showFilter ? 'block' : 'none' }}>
                    {/* Flex container for form fields */}
                    <div className="flex gap-2">

                        

                      

                     
                        {/* Ref ID */}
                        <div className="spwdashboardinput">
                            <input
                                type="text"
                                value={refId}
                                onChange={(e) => setRefId(e.target.value)}
                                placeholder="Enter Ref ID"
                                className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 "
                            />
                        </div>

                        {/* Keywords */}
                        <div className="flex-1  col-span-1 col-md-3">
                            <input
                                type="text"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                placeholder="Enter keywords"
                                className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 "
                            />
                        </div>

                    
                    </div>
                    <div className="col-md-12 spdbut">
                        <button
                            type="button"
                            onClick={fetchDashboardQueries}
                            className="btn btn-primary text-white rounded-md  flex items-center py-1 px-2 "
                        >
                            <Search size={14} className="mr-2" /> Search
                        </button>
                    </div>
                    {/* Search Button */}

                </form>

            </div>

          
            <div className=" px-2 row items-start justify-between">
               

               <Last2Hrs queries={last2Hrs} loading={loading} fetchDashboardQueriesForSocket={fetchOpenQueriesForSocket} />
<Last12Hrs queries={last12Hrs} loading={loading} fetchDashboardQueriesForSocket={fetchOpenQueriesForSocket} />
<Last24Hrs queries={last24Hrs} loading={loading} fetchDashboardQueriesForSocket={fetchOpenQueriesForSocket} />
<Last2Days queries={last2Days} loading={loading} fetchDashboardQueriesForSocket={fetchOpenQueriesForSocket} />
<Last7Days queries={last7Days} loading={loading} fetchDashboardQueriesForSocket={fetchOpenQueriesForSocket} />
<Above7Days queries={above7Days} loading={loading} fetchDashboardQueriesForSocket={fetchOpenQueriesForSocket} />

            </div>


        </div>
    );
};

export default OpenQuery;
