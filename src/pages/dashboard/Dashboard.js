// Dashboard.js

import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import $ from 'jquery';
import axios from "axios";
import "daterangepicker/daterangepicker.css"; // Import daterangepicker CSS
import "daterangepicker"; // Import daterangepicker JS
import moment from "moment";
import { FilterIcon, Search } from "lucide-react";
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
import DashboardSummary from "./DashboardSummary";
import AverageClaimedQueries from "./AverageClaimedQueries";
import TodaysTasks from "./TodayTasks";
import SpecificTransferredQueries from "./SpecificTransferredQueries";
import { getSocket } from "../../Socket";
import TransferredOpenTasks from "./TransferredOpenTasks";

const Dashboard = () => {

    const socket = getSocket(); // Initialize socket connection
    // State for the filter inputs
    const [endDate, setEndDate] = useState(moment());
    const [startDate, setStartDate] = useState(moment().subtract(7, "days"));

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
    const[transferredOpenTasks,setTransferredOpenTasks]=useState([]);
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
    const [todayTasks, setTodayTasks] = useState([]);
    const [delayData, setDelayData] = useState([]);
    const [delayCount, setDelayCount] = useState(0);
    const [internalCommentPendingData, setInternalCommentPendingData] = useState([]);
    const [internalCommentResolvedData, setInternalCommentResolvedData] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [showConversationSummary, setShowConversationSummary] = useState(false);
    const [showAverageClaimedQueries, setShowAverageClaimedQueries] = useState(false);

    const [showSpecificTransferredQueries, setShowSpecificTransferredQueries] = useState(false);
    const [reconnectSetquery, setReconnectSetquery] = useState([]);
    const [showReconnectQueries, setShowReconnectQueries] = useState(false);


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


            const response = await axios.post('https://99crm.phdconsulting.in/zend/99crmwebapi/api/teams', payload, {
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
                user_id: sessionStorage.getItem("id"),
                user_type: sessionStorage.getItem("user_type"),
                team_id: sessionStorage.getItem("team_id"),
                date_type: "ass_qr.update_status_date",
                filter_date: filterDate,
                teamid: teamId,
                ref_id: refId,
                userid: userId
            };

            const response = await axios.post(
                "https://99crm.phdconsulting.in/zend/api/dashboardqueries",
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.status !== 200) {
                throw new Error("Failed to fetch dashboard data");
            }

            const {
                openTask,
                transferredOpenTasks,
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
                todayTask,
                DelayData,
                DelayCount,
                internalCommentPendingData,
                internalCommentResolvedData
            } = response.data;

            // Set fetched data into states
            setOpenTasks(openTask || []);
             setTransferredOpenTasks(transferredOpenTasks || []);
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
            setTodayTasks(todayTask || []);
            setDelayData(DelayData || []);
            setDelayCount(DelayCount || 0);
            setInternalCommentPendingData(internalCommentPendingData || []);
            setInternalCommentResolvedData(internalCommentResolvedData || []);
            setReconnectSetquery(response.data.reconnectSetquery || []);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error(error.message || "Error fetching dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboardQueriesForSocket = async () => {
        try {

            const payload = {
                user_id: sessionStorage.getItem("id"),
                user_type: sessionStorage.getItem("user_type"),
                team_id: sessionStorage.getItem("team_id"),
                date_type: "ass_qr.update_status_date",
                filter_date: filterDate,
                teamid: teamId,
                userid: userId
            };

            const response = await axios.post(
                "https://99crm.phdconsulting.in/zend/api/dashboardqueries",
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.status !== 200) {
                throw new Error("Failed to fetch dashboard data");
            }

            const {
                openTask,
                transferredOpenTasks,
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
                todayTask,
                DelayData,
                DelayCount,
                internalCommentPendingData,
                internalCommentResolvedData
            } = response.data;

            // Set fetched data into states
            setOpenTasks(openTask || []);
            setTransferredOpenTasks(transferredOpenTasks || []);
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
            setTodayTasks(todayTask || []);
            setDelayData(DelayData || []);
            setDelayCount(DelayCount || 0);
            setInternalCommentPendingData(internalCommentPendingData || []);
            setInternalCommentResolvedData(internalCommentResolvedData || []);
            setReconnectSetquery(response.data.reconnectSetquery || []);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error(error.message || "Error fetching dashboard data");
        } finally {
            setLoading(false);
        }
    };
    ////////////////////////////////////////////////////////////
    useEffect(() => {
        socket.on('new_query_emit', (data) => {
            console.log("Socket data received:", data);
            if (sessionStorage.getItem('user_type') == "admin" || sessionStorage.getItem('user_type') == "Data Manager" || sessionStorage.getItem('user_type') == "sub-admin") {
                fetchDashboardQueriesForSocket();
            } else if (sessionStorage.getItem('user_type') == "user" && data.user_id == sessionStorage.getItem('id')) {
                fetchDashboardQueriesForSocket();
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
                await fetchDashboardQueriesForSocket(); // Await the async function
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


            const response = await axios.post('https://99crm.phdconsulting.in/zend/99crmwebapi/api/phdwebsites', payload, {
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



            const response = await axios.post('https://99crm.phdconsulting.in/zend/99crmwebapi/api/tags', payload, {
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
            <div className="bg-gray-100 rounded-lg px-2 py-2 mb-2">
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-md flex items-center gap-2">Dashboard <button className="btn btn-primary btn-sm px-1" onClick={() => setShowFilter(!showFilter)}><FilterIcon size={12} className="" /></button></h2>

                    <div className="flex items-center">
                        <button className="bg-[#cfe1e5] text-[#02313a] rounded px-2 py-1 ml-3 fssx" onClick={() => setShowConversationSummary(!showConversationSummary)}>
                            Show Conversion Summary
                        </button>
                        <button className="bg-[#cfe1e5] text-[#02313a] rounded px-2 py-1 ml-3 fssx" onClick={() => setShowAverageClaimedQueries(!showAverageClaimedQueries)}>
                            Show Average Claimed Queries
                        </button>
                       
                            <button className="bg-[#139cbb] text-white rounded px-2 py-1 ml-3 fssx" onClick={() => setShowReconnectQueries(!showReconnectQueries)}>
                                Reconnect Queries
                            </button>
                        

                        <button className="bg-[#e68414] text-[#ffffff] rounded px-2 py-1 ml-3 fssx" onClick={() => setShowSpecificTransferredQueries(!showSpecificTransferredQueries)}>
                            Specific Transferred Queries
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSearch} className="mt-2 p-2 border bg-white rounded" style={{ display: showFilter ? 'block' : 'none' }}>
                    {/* Flex container for form fields */}
                    <div className="flex gap-2">

                        <div className="">
                            <input
                                id="filterDate"
                                type="text"
                                className="form-control form-control-sm f-12"
                                placeholder="From Date - To Date"
                                value={filterDate}
                                readOnly
                            />
                        </div>

                        {/* Team Dropdown */}
                        <div className="" style={{ display: (sessionStorage.getItem("user_type") != "user" && sessionStorage.getItem("user_type") != "Operations Manager") ? 'block' : 'none' }}>
                            <select
                                value={teamId}
                                ref={teamsRef}
                                onChange={(e) => setTeamId(e.target.value)}
                                className="form-select form-select-sm f-12"
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
                        <div className="flex-1" style={{ display: (sessionStorage.getItem("user_type") != "user" && sessionStorage.getItem("user_type") != "Operations Manager") ? 'block' : 'none' }}>
                            <select
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="form-select form-select-sm f-12 "
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
                        <div className="">
                            <input
                                type="text"
                                value={refId}
                                onChange={(e) => setRefId(e.target.value)}
                                placeholder="Enter Ref ID"
                                className="form-control form-control-sm f-12"
                            />
                        </div>

                        {/* Keywords */}
                        <div className="flex-1">
                            <input
                                type="text"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                placeholder="Enter keywords"
                                className="form-control form-control-sm f-12"
                            />
                        </div>

                        {/* Website Dropdown */}
                        <div className="flex-1">
                            <select
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                className="form-select form-select-sm f-12"
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
                        <div className="flex-1">
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
                                className="form-select form-select-sm f-12"
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
                                className="btn btn-primary btn-sm f-11 flex gap-1 items-center"
                            >
                                <Search size={14} className="" /> Search
                            </button>
                        </div>
                        {/* Search Button */}
                    </div>
                    

                </form>

            </div>

            <AnimatePresence>
                {showConversationSummary && (
                    <DashboardSummary filterDate={filterDate} onClose={() => setShowConversationSummary(false)} />
                )}
                {showAverageClaimedQueries && (
                    <AverageClaimedQueries websiteId={website} onClose={() => setShowAverageClaimedQueries(false)} />
                )}
                {showSpecificTransferredQueries && (
                    <SpecificTransferredQueries onClose={() => { setShowSpecificTransferredQueries(false) }} />
                )}
                {showReconnectQueries && (
                    reconnectSetquery && reconnectSetquery.length > 0 ?
                    <div className="mt-2 flex flex-wrap gap-2 bg-gray-100 max-w-xl mx-auto p-2 rounded-lg">
                        {reconnectSetquery.map((item, index) => (
                            <span
                                key={index}
                                className="bg-orange-500 text-white px-1 py-0.5 rounded elevenpx"
                            >
                                {item.assign_id}
                            </span>
                        ))}
                    </div>
                    :
                    <p className="text-danger bg-red-100 f-12 py-2 px-3 rounded mb-1 fw-bold">No Queries Found</p>
                )}
            </AnimatePresence>

            <div className=" px-2 row items-start justify-between">
                {(sessionStorage.getItem("user_type") == "admin" || sessionStorage.getItem("user_type") == "sub-admin") ? (
                    <Escalation queries={escalationTask} loading={loading} fetchDashboardQueriesForSocket={fetchDashboardQueriesForSocket} />
                ) : (
                    <TodaysTasks queries={todayTasks} loading={loading} fetchDashboardQueriesForSocket={fetchDashboardQueriesForSocket} />
                )}

                <OpenTasks queries={openTasks} loading={loading}  fetchDashboardQueriesForSocket={fetchDashboardQueriesForSocket}/>
                <TransferredOpenTasks queries={transferredOpenTasks} loading={loading}  fetchDashboardQueriesForSocket={fetchDashboardQueriesForSocket} />
                <LeadIn queries={leadsData} loading={loading} fetchDashboardQueriesForSocket={fetchDashboardQueriesForSocket} />
                <BucketList queries={delayData} loading={loading}  fetchDashboardQueriesForSocket={fetchDashboardQueriesForSocket}/>
                <ContactMade queries={contactMadeData} loading={loading} fetchDashboardQueriesForSocket={fetchDashboardQueriesForSocket} />
                
                <Quoted queries={quotedData} loading={loading} fetchDashboardQueriesForSocket={fetchDashboardQueriesForSocket} />
                <Converted queries={convertedData} loading={loading} fetchDashboardQueriesForSocket={fetchDashboardQueriesForSocket} />
                <ClientNotInterested queries={notInterestedData} loading={loading} fetchDashboardQueriesForSocket={fetchDashboardQueriesForSocket} />
                <LostDeals queries={lostDealsData} loading={loading} fetchDashboardQueriesForSocket={fetchDashboardQueriesForSocket} />
                <ContactNotMade queries={contactNotMadeData} loading={loading} fetchDashboardQueriesForSocket={fetchDashboardQueriesForSocket} />
            </div>


        </div>
    );
};

export default Dashboard;
