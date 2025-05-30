import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import 'select2/dist/css/select2.min.css'; // Import Select2 CSS
import 'select2';
import { PlusCircle, RefreshCw, Pencil, Trash2, SearchIcon, Plus } from 'lucide-react';
import CustomLoader from '../../components/CustomLoader';
import toast from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { AnimatePresence, motion } from 'framer-motion';
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
import 'daterangepicker/daterangepicker.css'; // Import daterangepicker CSS
import 'daterangepicker'; // Import daterangepicker JS
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import BoxQueryDetails from './BoxQueryDetails';


const BoxQuery = () => {
    DataTable.use(DT);

    const [tags, setTags] = useState([]);
    const [teamUsers, setTeamUsers] = useState([])
    const [reports, setReports] = useState([]);
    const [websites, setWebsites] = useState([]);
    const [status, setStatus] = useState([]);
    const [users, setUsers] = useState([]);
    const [states, setStates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [selectedQueries, setSelectedQueries] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterDate, setFilterDate] = useState('');
    const [startDate, setStartDate] = useState(null); // Store start date
    const [endDate, setEndDate] = useState(null); // Store end date
    const [searchTeamId, setSearchTeamId] = useState([]);
    const [searchKeywords, setSearchKeywords] = useState("");
    const [refId, setRefId] = useState("");
    const [selectedWebsites, setSelectedWebsites] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [updateStatus, setUpdateStatus] = useState("");
    const [iconFilter, setIconFilter] = useState("");
    const [transferType, setTransferType] = useState("");
    const [selectedState, setSelectedState] = useState('');
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('')
    const userType = sessionStorage.getItem('user_type');
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);



    const websiteRef = useRef(null);
    const tagsRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        // Initialize select2 for Select Team
        $(websiteRef.current).select2({
            placeholder: "Select Website",
            allowClear: true,
            multiple: true,
        }).on('change', (e) => {
            const selectedValues = $(e.target).val(); // Use select2's value retrieval method
            setSelectedWebsites(selectedValues);
        });


        return () => {
            // Destroy select2 when the component unmounts
            if (websiteRef.current) {
                //$(websiteRef.current).select2('destroy');
            }
        };
    }, [websites]);
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
                //$(tagsRef.current).select2('destroy');
            }
        };

    }, [tags]);



    useEffect(() => {
        // Calculate dynamic date range (last 1 month)
        const start = moment().subtract(1, 'month'); // 1 month ago
        const end = moment(); // Today

        setStartDate(start);
        setEndDate(end);

        // Initialize the date range picker with the dynamic date range
        $('#filterDate').daterangepicker(
            {
                locale: {
                    format: 'MM/DD/YYYY',
                },
                startDate: start,
                endDate: end,
            },
            function (start, end, label) {
                setFilterDate(start.format('MM/DD/YYYY') + ' - ' + end.format('MM/DD/YYYY'));
                setStartDate(start);  // Update state with selected start date
                setEndDate(end);      // Update state with selected end date

            }
        );
    }, []);



    const fetchQueries = async () => {
        try {
            setLoading(true);

            const payload = {
                user_id: sessionStorage.getItem('id'),
                user_type: sessionStorage.getItem('user_type')
            };

            const response = await axios.post('https://99crm.phdconsulting.in/zend/api/loadboxquery', payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch reports');
            }

            setReports(response.data.queryData);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error(error.message || 'Error fetching reports');
        } finally {
            setLoading(false);
        }
    };


    const fetchCategoryWebsites = async () => {
        try {
            setLoading(true);

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
        } finally {
            setLoading(false);
        }
    };

    const fetchTags = async () => {
        try {
            setLoading(true);

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
        } finally {
            setLoading(false);
        }
    };







    useEffect(() => {
        fetchQueries();
        fetchCategoryWebsites();
        fetchTags();
    }, []);




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
            title: 'Name',
            orderable: false,
            data: 'name',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Email ID',
            orderable: false,
            data: 'email_id',
            render: (data, type, row) => {
                const bellIcon = row.showBellicon == 1 ? '<i class="fa fa-bell"></i>' : '';
                const dollarIcon = row.update_status == 3 ? '<i class="fa fa-dollar"></i>' : '';

                // Return the HTML with conditional icons
                return `
            <div style="text-align: left; cursor: pointer;" data-tooltip-id="my-tooltip" data-tooltip-content="${row.name}">
                ${data} ${bellIcon} ${dollarIcon}
            </div>
        `;
            },
        },
        {
            title: 'Website',
            orderable: false,
            data: 'website',
            render: (data, type, row) => {
                return `<div style="text-align: left;">${data ? data : 'Generic Query'}</div>`;
            },
        },

        {
            title: 'Box Tags',
            width: '30rem',
            orderable: false,
            data: 'box_tag_names',
            render: (data, type, row) => {
                if (Array.isArray(data)) {
                    return data.map(tag => `<span style="font-size:10px" class=" px-2 py-1 bg-gray-200 text-gray-800 rounded-full mr-1">${tag}</span>`).join(' ');
                }
                return `<div style="text-align: left;">No Tags</div>`;
            },
        },

        {
            title: 'Created Date',
            orderable: false,
            data: 'created_on',
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
         {
            title: 'Action',
            orderable: false,
            data: 'if_generic_query',
            render: (data, type, row) => {
                if(sessionStorage.getItem('user_type') == "user"){
                return `<div style="text-align: left;">
                ${data == "yes" ? (
                        `<button class="details-btn" style="background-color: #f97316; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-right: 0.5rem; display: flex; align-items: center; cursor: pointer; hover:background-color: #ea580c;">
                            Details
                        </button>`
                    ) : (
                        `<button class="claim-btn" style="background-color: #f97316; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-right: 0.5rem; display: flex; align-items: center; cursor: pointer; hover:background-color: #ea580c;">
                            Claim
                        </button>`
                    )}
                    </div>`;
                }else{
                    return ``;
                }
            },
        } 


    ];



    const handleCheckboxClick = (event) => {
        const id = parseInt(event.target.dataset.id, 10); // Parse the ID to ensure it's a number

        setSelectedQueries((prevSelectedQueries) => {
            if (event.target.checked) {
                // Add the ID to the state if checked
                return [...prevSelectedQueries, id];
            } else {
                // Remove the ID from the state if unchecked
                return prevSelectedQueries.filter((selectedId) => selectedId != id);
            }
        });

        // State updates are asynchronous, so this may not reflect the latest value immediately
    };

    // Refresh button handler
    const handleRefresh = () => {
        fetchQueries();
    };



    const handleDelete = () => {
        if (selectedQueries.length === 0) {
            toast.error("Please select at least one query to delete.");
            return;
        }
        setIsModalOpen(true);
    };

    const onConfirmDelete = async () => {
        try {
            // Constructing the request body with the selected reports IDs
            const response = await fetch('https://99crm.phdconsulting.in/zend/99crmwebapi/api/deleteboxquery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedQueries }),
            });


            if (!response.ok) {
                throw new Error('Failed to delete Reports');
            }

            const data = await response.json();

            setReports(reports.filter((setting) => !selectedQueries.includes(setting.id)));
            toast.success('Query(s) deleted successfully!');
            setTimeout(() => {
                fetchQueries();
            }, 1000)

        } catch (error) {
            toast.error(error.message || 'An error occurred while deleting queries.');
        } finally {

            setIsModalOpen(false);
            setSelectedQueries([]);


            document.querySelectorAll(".checkbox").forEach((checkbox) => {
                checkbox.checked = false;
            });
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            const payload = {
                filter_date: filterDate,
                website: selectedWebsites,
                tags: selectedTags,
                search_keywords: searchKeywords,
                user_id: sessionStorage.getItem('id'),
                user_type: sessionStorage.getItem('user_type')

            };

            const response = await fetch('https://99crm.phdconsulting.in/zend/api/loadboxquery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch reports, status: ${response.status}`);
            }

            const responseData = await response.json();
            setReports(responseData.queryData);
        } catch (error) {
            console.error('Error fetching reports:', error);

        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setSearchKeywords('');
        setSelectedWebsites([]);
        setSelectedTags([]);
        setFilterDate('');
        setStartDate(null);
        setEndDate(null);
        $(websiteRef.current).val(null).trigger('change');
        $(tagsRef.current).val(null).trigger('change');

        fetchQueries();
    };
    const handleAddQuery = () => {
        navigate('/addboxquery');
    }

    const handleDetailsClick = ( row) => {
        setSelectedQuery(row.id);
        setIsDetailsOpen(true);
    }
    const handleClaimClick = async (row) => {
       try{
        const payload = {
            query_id: row.id,
            user_id: sessionStorage.getItem('id'),
            user_type: sessionStorage.getItem('user_type'),
            user_name: sessionStorage.getItem('name'),
            team_id: sessionStorage.getItem('team_id'),

        }
        const response = await fetch('https://99crm.phdconsulting.in/zend/api/claimboxquery', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error(`Failed to claim query, status: ${response.status}`);
        }
        const data = await response.json();
        if(data.status){
            if (data.value == "1") {
                toast.success("Query claimed successfully");
                navigate('/queryhistory');
            } else {
                toast.error("Query already exists on the company with this email");
            }

        }else{
            toast.error('Failed to claim query.');
        }
        
       }catch(error){
        toast.error(error.message || 'An error occurred while claiming queries.');
       }
    }



    return (
        <div>
            <div className="my-3 flex justify-between flex-col mx-auto">
                <div className='flex w-full justify-between px-1'>
                    <h1 className="text-md font-bold ml-1">Box Query</h1>
                </div>
                <div className="flex items-center space-x-2 my-2 bg-white p-2 rounded gap-2 px-2 pt-2 qhpage" id="filterDiv">

                    {/* Date Range Picker */}
                    <input
                        id="filterDate"
                        type="text"
                        className="form-control w-full sm:w-auto py-2 px-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="From Date - To Date"
                        value={filterDate}
                        readOnly
                    />

                    {/* Keyword Search */}
                    <input
                        type="text"
                        name="search_keywords"
                        id="search_keywords"
                        className="form-control w-full sm:w-auto py-2 px-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter Keywords Name or Email or Phone"
                        value={searchKeywords}
                        onChange={(e) => setSearchKeywords(e.target.value)}
                    />

                    <div className='col-md-3'>
                        {/* Website Selection */}
                        <select
                            name="website"
                            id="website"
                            className="form-control w-full sm:w-auto py-2 px-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            multiple
                            value={selectedWebsites}

                            ref={websiteRef}
                        >
                            <option value="">Select Website</option>
                            {websites.map((website) => (
                                <option key={website.id} value={website.id}>
                                    {website.website}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='col-md-3'>
                        {/* Tags Selection */}
                        <select
                            name="tags"
                            id="tags"
                            className="form-select select2 w-full sm:w-auto py-2 px-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            multiple
                            value={selectedTags}

                            ref={tagsRef}
                        >
                            <option value="">Select Tags</option>
                            {tags.map((tag) => (
                                <option key={tag.id} value={tag.id}>
                                    {tag.tag_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='last'>
                        <button
                            onClick={handleSubmit}
                            className="bg-blue-400 text-white py-1 px-2 rounded-md hover:bg-blue-600 mr-2 flex items-center"
                        >
                            <SearchIcon className="mr-2" size={14} />
                            Search
                        </button>
                        <button
                            onClick={resetFilters}
                            className="text-gray-500 py-1 px-1 rounded hover:bg-gray-300"
                        >
                            <RefreshCw size={15} />
                        </button>

                    </div>
                </div>
            </div>



            {loading ? (
                <CustomLoader />
            ) : (
                <div className='bg-white p-3 shadow-xl border-t-2 border-green-400 rounded mx-auto'>
                    {(sessionStorage.getItem('user_type') == "admin" || sessionStorage.getItem('user_type') == "Data Manager") && (
                        <div className='w-full flex items-center justify-end mb-1'>
                            <button
                                onClick={handleDelete}
                                className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 mr-3 flex items-center"
                            >
                                <Trash2 className='' size={12} />
                            </button>
                            <button
                                onClick={handleAddQuery}
                                className="btn btn-success text-white py-1 px-2 rounded flex items-center"
                            >
                                <Plus className='mr-1' size={12} />  Add Box query
                            </button>

                        </div>
                    )}
                    <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
                        <DataTable
                            data={reports}
                            columns={columns}
                            options={{
                                pageLength: 50,
                                ordering: false,
                                createdRow: (row, data) => {
                                    // $(row).css('background-color', data.color_code || 'white');
                                    $(row).css('font-size', '12px !important');
                                    $(row).find('.checkbox').on('click', handleCheckboxClick);
                                    $(row).find('.details-btn').on('click', () => handleDetailsClick(data));
                                    $(row).find('.claim-btn').on('click', () => handleClaimClick(data));
                                },
                            }}
                        />
                    </div>
                </div>

            )}
            {isModalOpen && (
                <ConfirmationModal
                    context={{
                        title: 'Confirm Deletion',
                        message: `Are you sure you want to delete ${selectedQueries.length} query(s)?`,
                    }}
                    onConfirm={onConfirmDelete}
                    isReversible={false}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            <AnimatePresence>
                {isDetailsOpen && <BoxQueryDetails onClose={() => setIsDetailsOpen(false)} queryId={selectedQuery} />}
            </AnimatePresence>
            <Tooltip id="my-tooltip" />
        </div>
    );
};

export default BoxQuery;
