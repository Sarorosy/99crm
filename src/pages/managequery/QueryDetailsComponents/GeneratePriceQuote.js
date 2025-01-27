import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCcw } from 'lucide-react';

const GeneratePriceQuote = ({ refId }) => {
    const [quoteData, setQuoteData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedService, setExpandedService] = useState(null); // Store expanded service details

    // Function to fetch the quote data
    const fetchQuoteData = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                'https://99crm.phdconsulting.in/api/userpricequote',
                { ref_id: refId }
            );
            setQuoteData(response.data.quoteData);
        } catch (error) {
            console.error("Error fetching quote data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch service details on row click
    const fetchServiceDetails = async (serviceId) => {
        try {
            const response = await axios.post(
                'https://99crm.phdconsulting.in/api/getservicedetails',
                { service_id: serviceId }
            );
            //setExpandedService(response.data);
            //const data = JSON.parse(response.data);
            if (response.data?.serviceInfo) {
                console.log(response.data.serviceInfo.id);
                setExpandedService(response.data);
            } else {
                console.error('Service details are missing or invalid');
            }
            console.log(response.data)
        } catch (error) {
            console.error("Error fetching service details:", error);
        }
    };

    // Trigger fetch on RefId change or on component mount
    useEffect(() => {
        if (refId) {
            fetchQuoteData();
        }
    }, [refId]);

    // Render quote details
    const renderQuoteDetails = () => {
        if (loading) {
            return <p>Loading...</p>;
        }
        if (quoteData.length === 0) {
            return <p>No quote data available</p>;
        }

        return (
            <div className=" bg-gray-50 px-1 py-2 rounded-lg shadow-md col-md-3 " style={{fontSize: "11px"}}>
                <table className="table-auto w-[80%] border-collapse ">
                    <thead className="bg-blue-600 text-white space-x-0">
                        <tr>
                            <th className="py-2 px-1 text-left">Service Name</th>
                            <th className="py-2 px-1 text-left">Total Price</th>
                            <th className="py-2 px-1 text-left">Created Date</th>
                            <th className="py-2 px-1 text-left">Status</th>
                            <th className="py-2 px-1 text-left">Visit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quoteData.map((service, index) => (
                            <React.Fragment key={index}>
                                <tr
                                    className="cursor-pointer hover:bg-gray-200 transition duration-200"
                                    onClick={() => fetchServiceDetails(service.id)} // Expand row on click
                                >
                                    <td className="py-2 px-4">{service.service_name}</td>
                                    <td className="py-2 px-4">{service.currency_type} {service.total_price}</td>
                                    <td className="py-2 px-4">{new Date(service.created_date * 1000).toLocaleDateString()}</td>
                                    <td className="py-2 px-4">
                                        {service.status === 1 && <span className="bg-yellow-300 text-yellow-900 py-1 px-2 rounded-full text-xs">Draft</span>}
                                        {service.status === 2 && <span className="bg-red-500 text-white py-1 px-2 rounded-full text-xs">Approval Awaiting</span>}
                                        {service.status === 3 && <span className="bg-yellow-300 text-yellow-900 py-1 px-2 rounded-full text-xs">Approved</span>}
                                        {service.status === 4 && <span className="bg-green-500 text-white py-1 px-2 rounded-full text-xs">Published</span>}
                                        {service.status === 5 && <span className="bg-green-500 text-white py-1 px-2 rounded-full text-xs">Paid</span>}
                                    </td>
                                    <td className="py-2 px-4">
                                        <span className="bg-yellow-300 text-yellow-900 py-1 px-2 rounded-full text-xs">{service.checkoutVsit}</span>
                                    </td>
                                </tr>

                                {/* Display expanded service details if this row is clicked */}
                                {expandedService && expandedService.serviceInfo.id === service.id && (
                                    <tr>
                                        <td colSpan="5" className="bg-gray-100 py-4 px-2">
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-800">Quotation ID: {expandedService.serviceInfo.quotation_id}</h4>
                                                <p className="text-sm mt-2"><strong>Service Name:</strong> {expandedService.serviceInfo.service_name}</p>
                                                <p className="text-sm"><strong>Total Amount:</strong> {expandedService.serviceInfo.currency_type} {expandedService.serviceInfo.total_price}</p>
                                                <p className="text-sm"><strong>Payment Url:</strong> <a href={expandedService.serviceInfo.payment_url} className="text-blue-500">{expandedService.serviceInfo.payment_url}</a></p>
                                                <p className="text-sm"><strong>Expiry Date:</strong> {new Date(expandedService.serviceInfo.expiry_date * 1000).toLocaleDateString()}</p>
                                                <p className="text-sm"><strong>Online Payment:</strong> {expandedService.serviceInfo.notSendOnlinePayment === 1 ? "No" : "Yes"}</p>

                                                <h5 className="text-sm font-semibold mt-4">Payment Details</h5>
                                                <p className="text-xs" dangerouslySetInnerHTML={{ __html: expandedService.serviceInfo.payment_details }} />


                                                <h5 className="text-sm font-semibold mt-4">Milestone Details</h5>
                                                <table className="table-auto w-full mt-2">
                                                    <thead className="bg-blue-500 text-white">
                                                        <tr>
                                                            <th className="py-2 px-1 text-left">#</th>
                                                            <th className="py-2 px-1 text-left">Milestone Name</th>
                                                            <th className="py-2 px-1 text-left">Milestone Price</th>
                                                            <th className="py-2 px-1 text-left">Discounted Price</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {expandedService.serviceMilestoneData.map((milestone, idx) => (
                                                            <React.Fragment key={idx}>
                                                                {/* Milestone Row */}
                                                                <tr className="border-b border-gray-200">
                                                                    <td className="py-2 px-1">{idx + 1}.</td>
                                                                    <td className="py-2 px-1">{milestone.milestone_name}</td>
                                                                    <td className="py-2 px-1">{milestone.milestone_price}</td>
                                                                    <td className="py-2 px-1">{milestone.milestone_price}</td>
                                                                </tr>

                                                                {/* Remarks and Status */}
                                                                <tr>
                                                                    <td colSpan="4" className="py-2 px-1 text-left">
                                                                        <p><strong>Remarks:</strong> {milestone.milestone_remark}</p>
                                                                        <p><strong>Status:</strong> {milestone.status === 0 ? "Pending" : "Completed"}</p>
                                                                    </td>
                                                                </tr>

                                                                {/* Sub Milestones */}
                                                                {milestone.subMilestoneData?.parameters?.map((param, subIdx) => (
                                                                    <tr key={`subMilestone-${subIdx}`} className="bg-gray-100">
                                                                        <td colSpan="4" className="py-2 px-1 text-left">
                                                                            <strong>Parameters</strong>: {param} <br />
                                                                            <strong>No. of Words</strong>: {milestone.subMilestoneData.no_of_words[subIdx]} <br />
                                                                            <strong>Time Frame</strong>: {milestone.subMilestoneData.time_frame[subIdx]}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </React.Fragment>
                                                        ))}
                                                    </tbody>
                                                </table>


                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>


        );
    };

    return (
        <div className="box-group col-md-5 overflow-hidden bg-white rounded-lg shadow-md" id="accordion">
            <div className="box">
                <div className="box-header with-border bg-blue-600 text-white flex items-center justify-between px-2 py-2 rounded-t-lg">
                    <h2 className=" text-lg font-semibold">
                        <a href="#" className="hover:underline">Price Quote</a>
                    </h2>
                    <button
                        className="btn btn-default text-white bg-gray-600 hover:bg-gray-700 p-1 rounded-full"
                        onClick={fetchQuoteData}
                        id="expandDiv">
                        <RefreshCcw size={18} />
                    </button>
                </div>

                {/* Rendered Quote Details */}
                <div className="px-1 pb-4">
                    {renderQuoteDetails()}
                </div>

                {/* New Price Form - Hidden if there are existing quotes */}
                <div id="AddNewPriceDiv" className={`${quoteData.length === 0 ? 'block' : 'hidden'} flex mx-auto`}>
                    {/* Additional content or form for adding new price quotes */}
                    <div className="mt-4">
                        <p className="text-sm text-gray-600">Add new price quote details here.</p>
                        {/* Add form elements or any additional content */}
                    </div>
                </div>
            </div>
        </div>

    );
};

export default GeneratePriceQuote;
