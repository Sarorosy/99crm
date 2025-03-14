import React, { useEffect, useState, useRef } from 'react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import { RefreshCw, X } from 'lucide-react';
import CustomLoader from '../../components/CustomLoader';
import toast from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { motion } from 'framer-motion';

const SpecificTransferredQueries = ({ onClose }) => {
    DataTable.use(DT);

    const [queries, setQueries] = useState([]);
    const [websites, setWebsites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setselectedTemplate] = useState(null);

    const [profileName, setProfileName] = useState('');
    const [websiteId, setWebsiteId] = useState('');
    const [websiteEmail, setWebsiteEmail] = useState('');
    const [signature, setSignature] = useState('');

    const fetchQueries = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://99crm.phdconsulting.in/api/loadspecifictransferredqueries', {
                method: 'POST',
                body: JSON.stringify({ user_id: sessionStorage.getItem('id'), user_type: sessionStorage.getItem('user_type') }),
            });

            const data = await response.json();
            if (!response.status) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setQueries(data.queryData);
        } catch (error) {
            console.error('Error fetching Email templates:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueries();
    }, []);

    const columns = [
        {
            title: 'Ref Id.',
            data: 'ref_id',
            orderable: false,
            width: "80px",
            render: (data, type, row, meta) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Name',
            orderable: false,
            data: 'name',
            width: "200px",
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Email ID',
            orderable: false,
            data: 'email_id',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Reason',
            orderable: false,
            data: 'reason',
            width: "250px",
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Comments',
            orderable: false,
            data: 'comment',
            width: "100px",
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Created Date',
            orderable: false,
            data: 'addedon',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Actions',
            data: null,
            orderable: false,
            width: "150px",
            render: (data, type, row) => {
                const userType = sessionStorage.getItem('user_type');
        
                if (userType == 'user' && row.req_status == "Specific Transferred") {
                    return `
                        <button style="font-size:10px" class="send-req-btn bg-orange-400 text-white p-1 rounded  flex mx-1 fsm" data-id="${row.id}">
                            Send Reclaim Request
                        </button>
                    `;
                } else if ((userType == 'admin' || userType == 'Data Manager') && row.req_status == 'Request Sent') {
                    return `
                        <button class="approve-btn bg-orange-400 text-white p-1 rounded  flex mx-1 fsm" data-id="${row.id}">
                            Approve
                        </button>
                    `;
                }
        
                return '';
            }
        },
        
    ];


    const handleRefresh = () => {
        fetchQueries();
    };

    const reclaimQueryBack = async (reqId) => {
        if (!window.confirm("Are you sure you want to send request to reclaim this query!")) return;
    
        setLoading(true);
        
        try {
          const response = await fetch(`https://99crm.phdconsulting.in/api/reclaimqueryback`, {
            method: "POST",
            body: JSON.stringify({ user_id : sessionStorage.getItem('id'), user_name : sessionStorage.getItem('name') ,req_id: reqId }),
          });
    
          const result = await response.json();
    
          if (result.status) {
            toast.success("Request sent successfully");
            fetchQueries();
          } else {
            toast.error("Request already sent");
          }
        } catch (error) {
          toast.error(error.message);
        } finally {
          setLoading(false);
        }
      };
    
      const approveReclaimQuery = async (reqId) => {
        if (!window.confirm("Are you sure you want to approve this query!")) return;
    
        setLoading(true);
    
        try {
          const response = await fetch(`https://99crm.phdconsulting.in/api/approvereclaimquery`, {
            method: "POST",
            body: JSON.stringify({user_id : sessionStorage.getItem('id'), user_name : sessionStorage.getItem('name'), req_id: reqId }),
          });
    
          const result = await response.json();
    
          if (result.status) {
            toast.success("Query approved successfully");
            fetchQueries();
          } else {
            toast.error(result.message || "Request already sent");
          }
        } catch (error) {
          toast.error(error.message);
        } finally {
          setLoading(false);
        }
      };

  



    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-gray-100 shadow-md z-50 overflow-y-auto p-3"
        >
            <div className="my-3 flex justify-between ">
                <h1 className="text-md font-bold">Specific Transferred Queries</h1>
                <div className='flex space-x-2'>


                    <button
                        onClick={handleRefresh}
                        className="text-gray-500 py-1 px-1 rounded hover:bg-gray-300"
                    >
                        <RefreshCw size={15} />
                    </button>

                    <button
                        onClick={onClose}
                        className="text-red-500 py-1 px-1 border border-red-500 rounded-full hover:bg-red-600 hover:text-white"
                    >
                        <X size={15} />
                    </button>

                </div>
            </div>
            {loading ? (
                <CustomLoader />
            ) : (
                <div className="w-[90%] bg-white p-2 rounded mx-auto overflow-x-auto">
                    <DataTable
                        data={queries}
                        columns={columns}
                        options={{
                            pageLength: 50,
                            autoWidth: true, // Ensure automatic width
                            responsive: true, // Enable responsiveness
                            createdRow: (row, data) => {
                                $(row).find('.approve-btn').on('click', (e) => { approveReclaimQuery(data.req_id) });
                                $(row).find('.send-req-btn').on('click', (e) => { reclaimQueryBack(data.req_id) });
                            },
                        }}
                    />
                </div>

            )}



        </motion.div>
    );
};

export default SpecificTransferredQueries;
