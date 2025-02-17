// Dashboard.js

import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import $ from 'jquery';
import axios from "axios";
import "daterangepicker/daterangepicker.css"; // Import daterangepicker CSS
import "daterangepicker"; // Import daterangepicker JS
import moment from "moment";
import { Search } from "lucide-react";
import OpenTasks from "./OpenTasks";
import Escalation from "./Escalation";
import LeadIn from "./LeadIn";
import BucketList from "./BucketList";
import ContactMade from "./ContactMade";
import ContactNotMade from "./ContactNotMade";
import Quoted from "./Quoted";
import Converted from "./Converted";
import ClientNotInterested from "./ClientNotInterested";
import LostDeals from "./LostDeals";
import { AnimatePresence } from "framer-motion";
import QueryDetails from "../managequery/QueryDetails";
const Dashboard = () => {
    // State for the filter inputs
    const [startDate, setStartDate] = useState(moment().subtract(1, "month"));
    const [endDate, setEndDate] = useState(moment());
    const [filterDate, setFilterDate] = useState(
        `${startDate.format("MM/DD/YYYY")} - ${endDate.format("MM/DD/YYYY")}`
    );
    const [teamId, setTeamId] = useState(null);
    const [userId, setUserId] = useState("");
    const [refId, setRefId] = useState("");
    const [keywords, setKeywords] = useState("");
    const [website, setWebsite] = useState("");
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [loading, setLoading] = useState(false)

    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [websites, setWebsites] = useState([]);
    const teamsRef = useRef(null);
    const websiteRef = useRef(null);
    const tagsRef = useRef(null);

    const [openTasks, setOpenTasks] = useState([]);
    const [leads, setLeads] = useState([]);
    const [fileAttachedUnread, setFileAttachedUnread] = useState([]);
    const [leadsData, setLeadsData] = useState([]);
    const [leadsCount, setLeadsCount] = useState(0);
    const [contactMadeData, setContactMadeData] = useState([]);
    const [contactMadeCount, setContactMadeCount] = useState(0);
    const [contactNotMadeData, setContactNotMadeData] = useState([]);
    const [contactNotMadeCount, setContactNotMadeCount] = useState(0);
    const [quotedData, setQuotedData] = useState([]);
    const [quotedCount, setQuotedCount] = useState(0);
    const [convertedData, setConvertedData] = useState([]);
    const [convertedCount, setConvertedCount] = useState(0);
    const [notInterestedData, setNotInterestedData] = useState([]);
    const [notInterestedCount, setNotInterestedCount] = useState(0);
    const [lostDealsData, setLostDealsData] = useState([]);
    const [lostDealsCount, setLostDealsCount] = useState(0);
    const [escalationTask, setEscalationTask] = useState([]);
    const [delayData, setDelayData] = useState([]);
    const [delayCount, setDelayCount] = useState(0);
    const [internalCommentPendingData, setInternalCommentPendingData] = useState([]);
    const [internalCommentResolvedData, setInternalCommentResolvedData] = useState([]);

    


    const fetchTeams = async () => {
        try {

            const team_id = sessionStorage.getItem('team_id');  // Assuming 'id' is stored in sessionStorage
            const user_type = sessionStorage.getItem('user_type');  // Assuming 'user_type' is stored in sessionStorage

            let whereStr = '';
            if (user_type != 'admin' && team_id) {
                whereStr = `team_id IN (${team_id})`; // Example: "team_id IN (1, 2, 3)"
            }

            const payload = {
                whereStr,
            };


            const response = await axios.post('https://99crm.phdconsulting.in/99crmwebapi/api/teams', payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch teams');
            }

            setTeams(response.data.data);
        } catch (error) {
            console.error('Error fetching teams:', error);
            toast.error(error.message || 'Error fetching Teams');
        } 
    };

   const fetchDashboardQueries = async () => {
        try {
            setLoading(true);

            const payload = {
                user_id: sessionStorage.getItem("user_id"),
                user_type: sessionStorage.getItem("user_type"),
                team_id: sessionStorage.getItem("team_id"),
                date_type: "ass_qr.update_status_date",
                filter_date: filterDate,
                teamid:teamId,
                userid: userId
            };

            const response = await axios.post(
                "https://99crm.phdconsulting.in/api/dashboardqueries",
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.status !== 200) {
                throw new Error("Failed to fetch dashboard data");
            }

            const {
                openTask,
                leads,
                fileAttachedUnread,
                LeadsData,
                LeadsCount,
                ContactMadeData,
                ContactMadeCount,
                ContactNotMadeData,
                ContactNotMadeCount,
                QuotedData,
                QuotedCount,
                ConvertedData,
                ConvertedCount,
                NotInterestedData,
                NotInterestedCount,
                LostDealsData,
                LostDealsCount,
                escalationTask,
                DelayData,
                DelayCount,
                internalCommentPendingData,
                internalCommentResolvedData
            } = response.data;
            
            // Set fetched data into states
            setOpenTasks(openTask || []);
            setLeads(leads || []);
            setFileAttachedUnread(fileAttachedUnread || []);
            setLeadsData(LeadsData || []);
            setLeadsCount(LeadsCount || 0);
            setContactMadeData(ContactMadeData || []);
            setContactMadeCount(ContactMadeCount || 0);
            setContactNotMadeData(ContactNotMadeData || []);
            setContactNotMadeCount(ContactNotMadeCount || 0);
            setQuotedData(QuotedData || []);
            setQuotedCount(QuotedCount || 0);
            setConvertedData(ConvertedData || []);
            setConvertedCount(ConvertedCount || 0);
            setNotInterestedData(NotInterestedData || []);
            setNotInterestedCount(NotInterestedCount || 0);
            setLostDealsData(LostDealsData || []);
            setLostDealsCount(LostDealsCount || 0);
            setEscalationTask(escalationTask || []);
            setDelayData(DelayData || []);
            setDelayCount(DelayCount || 0);
            setInternalCommentPendingData(internalCommentPendingData || []);
            setInternalCommentResolvedData(internalCommentResolvedData || []);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error(error.message || "Error fetching dashboard data");
        } finally {
            setLoading(false);
        }
    };


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
                        "https://99crm.phdconsulting.in/99crmwebapi/api/getallusersbyteamid",
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
        // Initialize select2 for Select Team
        $(websiteRef.current).select2({
            placeholder: "Select Website",
            allowClear: true,
        }).on('change', (e) => {
            const selectedValues = $(e.target).val(); // Use select2's value retrieval method
            setWebsite(selectedValues);
        });


        return () => {
            // Destroy select2 when the component unmounts
            if (websiteRef.current) {
                //$(websiteRef.current).select2('destroy');
            }
        };
    }, [websites]);

    useEffect(() => {
        const $dateInput = $("#filterDate");

        // Initialize Date Range Picker
        $dateInput.daterangepicker(
            {
                locale: { format: "MM/DD/YYYY" },
                startDate: startDate,
                endDate: endDate,
                ranges: {
                    Today: [moment(), moment()],
                    Yesterday: [
                        moment().subtract(1, "days"),
                        moment().subtract(1, "days"),
                    ],
                    "Last 7 Days": [moment().subtract(6, "days"), moment()],
                    "Last 15 Days": [moment().subtract(14, "days"), moment()],
                    "Last 30 Days": [moment().subtract(29, "days"), moment()],
                    "This Month": [moment().startOf("month"), moment().endOf("month")],
                    "Last Month": [
                        moment().subtract(1, "month").startOf("month"),
                        moment().subtract(1, "month").endOf("month"),
                    ],
                },
            },
            function (start, end) {
                setFilterDate(`${start.format("MM/DD/YYYY")} - ${end.format("MM/DD/YYYY")}`);
                setStartDate(start);
                setEndDate(end);
            }
        );

        // Cleanup function to remove event listeners on component unmount
        return () => {
            $dateInput.data("daterangepicker").remove();
        };
    }, []);


    const fetchCategoryWebsites = async () => {
        try {

            const category = sessionStorage.getItem('category');  // Assuming 'id' is stored in sessionStorage
            const user_type = sessionStorage.getItem('user_type');  // Assuming 'user_type' is stored in sessionStorage

            let whereStr = '';
            if (user_type != 'admin' && category) {
                whereStr = `${category}`; // Example: "team_id IN (1, 2, 3)"
            }

            const payload = { whereStr }


            const response = await axios.post('https://99crm.phdconsulting.in/99crmwebapi/api/phdwebsites', payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch teams');
            }

            setWebsites(response.data.data);
        } catch (error) {
            console.error('Error fetching teams:', error);
            toast.error(error.message || 'Error fetching Teams');
        } 
    };
    const fetchTags = async () => {
        try {


            const category = sessionStorage.getItem('category');  // Assuming 'id' is stored in sessionStorage
            const user_type = sessionStorage.getItem('user_type');  // Assuming 'user_type' is stored in sessionStorage

            let whereStr = '';
            if (user_type != 'admin' && category) {
                whereStr = `${category}`; // Example: "team_id IN (1, 2, 3)"
            }

            const payload = { whereStr }



            const response = await axios.post('https://99crm.phdconsulting.in/99crmwebapi/api/tags', payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch tags');
            }

            setTags(response.data.data);
        } catch (error) {
            console.error('Error fetching teams:', error);
            toast.error(error.message || 'Error fetching tags');
        }
    };
    useEffect(() => {
        // Initialize select2 for Select Team
        $(tagsRef.current).select2({
            placeholder: "Select Tags",
            allowClear: true,
            multiple: true,
        }).on('change', (e) => {
            const selectedValues = $(e.target).val(); // Use select2's value retrieval method
            setSelectedTags(selectedValues);
        });


        return () => {
            // Destroy select2 when the component unmounts
            if (tagsRef.current) {
                $(tagsRef.current).select2('destroy');
            }
        };
    }, [tags]);

    useEffect(() => {
        fetchTeams();
        fetchTags();
        fetchCategoryWebsites();
        fetchDashboardQueries();
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
            const response = await fetch("https://99crm.phdconsulting.in/api/dashboardqueries", {
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
        <div className="px-2 py-1">
            {/* Filter Section */}
            <div className="bg-white rounded-lg px-2 py-3 mb-6">
            <h2 className="text-blue-950 font-semibold ml-2 my-1 text-xl">Dashboard</h2>
                <form onSubmit={handleSearch}>
                    {/* Flex container for form fields */}
                    <div className="grid grid-cols-5 gap-1">
                    
                        <div className="flex-1 min-w-[150px]">
                            
                            <input
                                id="filterDate"
                                type="text"
                                className="form-control w-full sm:w-auto py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 "
                                placeholder="From Date - To Date"
                                value={filterDate}
                                readOnly
                            />
                        </div>

                        {/* Team Dropdown */}
                        <div className="flex-1 min-w-[150px]">
                            <select
                                value={teamId}
                                ref={teamsRef}
                                onChange={(e) => setTeamId(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 "
                            >
                                <option value="">Select Team</option>
                                {teams.map((team) => (
                                    <option key={team.id} value={team.id}>
                                        {team.team_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* User Dropdown */}
                        <div className="flex-1 min-w-[150px]">
                            <select
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 "
                            >
                                <option value="">Select User</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Ref ID */}
                        <div className="flex-1 min-w-[150px]">
                            <input
                                type="text"
                                value={refId}
                                onChange={(e) => setRefId(e.target.value)}
                                placeholder="Enter Ref ID"
                                className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 "
                            />
                        </div>

                        {/* Keywords */}
                        <div className="flex-1 min-w-[150px]">
                            <input
                                type="text"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                placeholder="Enter keywords"
                                className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 "
                            />
                        </div>

                        {/* Website Dropdown */}
                        <div className="flex-1 min-w-[150px]">
                            <select
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 "
                            >
                                <option value="">Select Website</option>
                                {websites.map((site) => (
                                    <option key={site.id} value={site.id}>
                                        {site.website}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tags Multi-select */}
                        <div className="flex-1 min-w-[150px]">
                            <select
                                multiple
                                value={selectedTags}
                                ref={tagsRef}
                                onChange={(e) => {
                                    const selectedOptions = Array.from(
                                        e.target.selectedOptions,
                                        (option) => option.value
                                    );
                                    setSelectedTags(selectedOptions);
                                }}
                                className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 "
                            >
                                <option value="">Select Tags</option>
                                {tags.map((tag) => (
                                    <option key={tag.id} value={tag.id}>
                                        {tag.tag_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="">
                            <button
                                type="button"
                                onClick={fetchDashboardQueries}
                                className="bg-[#257180] flex items-center hover:bg-[#1a545f] text-white py-1 px-2 rounded "
                            >
                               <Search size={18}className="mr-2" /> Search
                            </button>
                        </div>
                    </div>

                    {/* Search Button */}

                </form>



            </div>
        
        <div className=" px-2 row items-start">

            <Escalation queries={escalationTask} loading={loading} />
            <OpenTasks queries={openTasks} loading={loading} />
            <LeadIn queries={leadsData} loading={loading} />
            <BucketList queries={delayData} loading={loading} />      
            <ContactMade queries={contactMadeData} loading={loading} />
            <div className="mb-2 w-full "></div>   
            <Quoted queries={quotedData} loading={loading} />  
            <Converted queries={convertedData} loading={loading} />  
            <ClientNotInterested queries={notInterestedData} loading={loading} />    
            <LostDeals queries={lostDealsData} loading={loading} /> 
            <ContactNotMade queries={contactNotMadeData} loading={loading} />                      
        </div>

        
        </div>
    );
};

export default Dashboard;
