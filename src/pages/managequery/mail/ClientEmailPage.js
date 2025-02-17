import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import 'select2/dist/css/select2.min.css'; // Import Select2 CSS
import 'select2';
import EmailLoader from "./EmailLoader";
import MailDetailsTab from "./MailDetailsTab";
import toast from "react-hot-toast";
import { Mail, MailCheck, MailX } from "lucide-react";
import "daterangepicker/daterangepicker.css"; // Import daterangepicker CSS
import "daterangepicker"; // Import daterangepicker JS
import moment from "moment";

const ClientMailPage = () => {
    const [profileData, setProfileData] = useState([]);
    const [clientMailExternal, setClientMailExternal] = useState([]);
    const [selectedProfileEmail, setSelectedProfileEmail] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedQueries, setSelectedQueries] = useState([]);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [startDate, setStartDate] = useState(moment().subtract(1, "month"));
    const [endDate, setEndDate] = useState(moment());
    const [filterDate, setFilterDate] = useState(
        `${startDate.format("MM/DD/YYYY")} - ${endDate.format("MM/DD/YYYY")}`
    );

    const [selectedMailId, setSelectedMailId] = useState('');

    DataTable.use(DT);
    const tagsRef = useRef(null);

    useEffect(() => {
        // Initialize select2 for Select Team
        $(tagsRef.current).select2({
            placeholder: "Select Profile Email",
            allowClear: true,
        }).on('change', (e) => {
            const selectedValues = $(e.target).val();
            setSelectedProfileEmail(selectedValues);
            fetchData();
        });

        return () => {
            if (tagsRef.current) {
            }
        };

    }, [profileData]);

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
                fetchData(`${start.format("MM/DD/YYYY")} - ${end.format("MM/DD/YYYY")}`);
            }
        );

        // Cleanup function to remove event listeners on component unmount
        return () => {
            $dateInput.data("daterangepicker").remove();
        };
    }, []);

    // Fetch data from the API
    const fetchData = async (date = null) => {
        setIsLoading(true);
        const requestData = {
            user_type: sessionStorage.getItem("user_type"),
            user_id: sessionStorage.getItem("id"),
            team_id: sessionStorage.getItem("team_id"),
            date_filter: date &&  date != null ? date : filterDate, // Replace with dynamic date range if needed
            from_email_id: selectedProfileEmail,
        };

        try {
            const response = await axios.post(
                "https://99crm.phdconsulting.in/api/loadclientmail",
                requestData
            );
            if (response.data.status) {
                setClientMailExternal(response.data.ClientMailExternal);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {


        fetchData();
        fetchTProfiles();
    }, []);

    const fetchTProfiles = async () => {
        try {

            const category = sessionStorage.getItem('category');  // Assuming 'id' is stored in sessionStorage
            const user_type = sessionStorage.getItem('user_type');  // Assuming 'user_type' is stored in sessionStorage



            const payload = {
                user_id: sessionStorage.getItem('id'),
                user_type: sessionStorage.getItem('user_type'),
                team_id: sessionStorage.getItem('team_id')
            }



            const response = await axios.post('https://99crm.phdconsulting.in/api/getuserprofilesemail', payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });


            setProfileData(response.data.profileData ?? []);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    const handleView = (mailid) => {
        setSelectedMailId(mailid);
        setDetailsOpen(true);
    }


    const columns = [
        {
            title: 'Sel',
            data: 'id',
            width: '50px',
            orderable: false,
            render: (data) => {
                const isChecked = selectedQueries.includes(data);
                return `
                <div style="width:30px;">
                    <input
                        class="checkbox"
                        type="checkbox"
                        ${isChecked ? 'checked' : ''}
                        data-id="${data}"
                    />
                </div>
            `;
            },
        },
        {
            title: 'From Email',
            orderable: false,
            data: 'FromEmail',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Subject',
            orderable: false,
            data: 'Subject',
            render: (data, type, row) => {
                const bellIcon = row.Attachments != "" ? '<i class="fa fa-paperclip"></i>' : '';


                // Return the HTML with conditional icons
                return `
        <div style="text-align: left; cursor: pointer;" data-tooltip-id="my-tooltip" data-tooltip-content="${row.name}">
            ${data} ${bellIcon} 
        </div>
    `;
            },
        },

        {
            title: 'Time',
            orderable: false,
            data: 'created_date',
            render: (data, type, row) => {
                if (!data) return '<div style="text-align: left;">-</div>';

                // Convert Unix timestamp to a readable date
                const date = new Date(data * 1000); // Multiply by 1000 if timestamp is in seconds
                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });

                return `<div style="text-align: left;">${formattedDate}</div>`;
            },
        },

    ];
    const handleCheckboxClick = (event) => {
        const id = parseInt(event.target.dataset.id, 10); // Parse the ID to ensure it's a number
        console.log(event.target.value)
        setSelectedQueries((prevSelectedQueries) => {
            if (event.target.checked) {
                // Add the ID to the state if checked
                return [...prevSelectedQueries, id];
            } else {
                // Remove the ID from the state if unchecked
                return prevSelectedQueries.filter((selectedId) => selectedId != id);
            }
        });

    };

    const handleDelete = async () => {
        try {
            if (selectedQueries.length === 0) {
                toast.error("Please select at least one query.");
                return;
            }

            const response = await axios.post("https://99crm.phdconsulting.in/api/deleteclientmail", { mail_id: selectedQueries });
          
          if (response.data.status) {
            setClientMailExternal(prevMails =>
                prevMails.filter(mail => !selectedQueries.includes(mail.id))
            );
            toast.success("Mails deleted successfully.");
        }

        } catch (error) {
          console.error("Error deleting mail:", error);
        }
      };
    
      const handleReadBtnClick = async () => {
        try {
            if (selectedQueries.length === 0) {
                toast.error("Please select at least one query.");
                return;
            }
            
            const response = await axios.post("https://99crm.phdconsulting.in/api/readunreadmail", { 
                mail_id: selectedQueries, 
                type: "read" 
            });
    
            if (response.data.status) {
                setClientMailExternal(prevMails =>
                    prevMails.map(mail => 
                        selectedQueries.includes(mail.id) ? { ...mail, status: 1 } : mail
                    )
                );
                setSelectedQueries([])
                toast.success("Success");
            }
        } catch (error) {
            console.error("Error marking mail as read:", error);
        }
    };
    
    const handleUnreadBtnClick = async () => {
        try {
            if (selectedQueries.length === 0) {
                toast.error("Please select at least one query.");
                return;
            }
            
            const response = await axios.post("https://99crm.phdconsulting.in/api/readunreadmail", { 
                mail_id: selectedQueries, 
                type: "unread" 
            });
    
            if (response.data.status) {
                setClientMailExternal(prevMails =>
                    prevMails.map(mail => 
                        selectedQueries.includes(mail.id) ? { ...mail, status: 0 } : mail
                    )
                );
                setSelectedQueries([])
                toast.success("Success");
            }
        } catch (error) {
            console.error("Error marking mail as unread:", error);
        }
    };
    


    return (
        <div className="p-3 bg-white min-h-screen row">




            {/* Profile Emails Dropdown */}
            <div className={`mb-8 flex items-center justify-between ${detailsOpen ? 'col-md-8' : 'col-md-12'}`}>
                <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Client Mail Page</h1>
                <div className="flex-1 min-w-[150px] mx-3">
                            
                            <input
                                id="filterDate"
                                type="text"
                                className="form-control w-full sm:w-auto py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 "
                                placeholder="From Date - To Date"
                                value={filterDate}
                                readOnly
                            />
                        </div>

                <div className="flex items-center justify-end gap-2 ml-3">
                        <button
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600 flex items-center justify-between space-x-1 text-white px-2 py-1 rounded-md text-sm transition"
                        >
                           <MailX  size={18} className="mr-2"/> Delete
                        </button>
                        <button
                            onClick={handleReadBtnClick}
                            className="bg-green-500 hover:bg-green-600 flex items-center justify-between space-x-1 text-white px-2 py-1 rounded-md text-sm transition"
                        >
                          <MailCheck  size={18} className="mr-2"/>  Mark as Read
                        </button>
                        <button
                            onClick={handleUnreadBtnClick}
                            className="bg-yellow-500 hover:bg-yellow-600 flex items-center justify-between space-x-1 text-white px-2 py-1 rounded-md text-sm transition"
                        >
                           <Mail size={18} className="mr-2"/> Mark as Unread
                        </button>
                    </div>
                    </div>
                <div className=" border p-1 rounded">
                    <select
                        value={selectedProfileEmail}
                        ref={tagsRef}
                        className=" px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none"
                    >
                        <option value="" disabled>
                            Choose an email
                        </option>
                        {profileData.map((profile, index) => (
                            <option key={index} value={profile.website_email}>
                                {profile.website_email}
                            </option>
                        ))}
                    </select>
                </div>
            </div>


            {isLoading ? (
                <EmailLoader />
            ) : (
                <div className={detailsOpen ? 'col-md-8' : 'col-md-12'}>
                    
                    <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
                        <DataTable
                            data={clientMailExternal}
                            columns={columns}
                            options={{
                                pageLength: 50,
                                ordering: false,
                                createdRow: (row, data) => {
                                    // $(row).css('background-color', data.color_code || 'white');
                                    if (data.status == 1) {
                                        $(row).addClass('font-normal');
                                    } else {
                                        $(row).addClass('font-bold');
                                    }
                                    $(row).css('font-size', '12px !important');
                                    $(row).find('.checkbox').on('click', (event) => {
                                        event.stopPropagation(); // Prevent triggering row click
                                        handleCheckboxClick(event);
                                    });
                                    $(row).on('click', () => {
                                        handleView(data.id);
                                    });
                                },
                            }}
                        />
                    </div>
                </div>

            )}
            {detailsOpen && (
                <MailDetailsTab mailid={selectedMailId} onClose={() => { setDetailsOpen(!detailsOpen) }} />
            )}
        </div>
    );
};

export default ClientMailPage;