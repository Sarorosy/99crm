import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Expand, Frown, Loader, Minimize, RefreshCcw } from 'lucide-react';
import { motion } from "framer-motion";
import AddQuoteForm from './AddQuoteForm';
import ServiceDetails from './ServiceDetails';
import EditQuoteForm from './EditQuoteForm';

const UserPriceQuote = ({ refId, after }) => {
    const [quoteData, setQuoteData] = useState([]);
    const [queryInfo, setQueryInfo] = useState(null); 
    const [serviceData, setServiceData] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [expandedService, setExpandedService] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [addFormOpen, setAddFormOpen] = useState(false);

    const [selectedService, setSelectedService] = useState(null);
    const [serviceDetails, setServiceDetails] = useState(null);
    const [mileStoneDetails, setMileStoneDetails] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // Function to fetch the quote data
    const fetchQuoteData = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                'https://99crm.phdconsulting.in/zend/api/userpricequote',
                { ref_id: refId }
            );

            setQuoteData(response.data.quoteData);
            setQueryInfo(response.data.queryInfo);
            setServiceData(response.data.quoteServiceData);
            console.log(response.data);
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
                'https://99crm.phdconsulting.in/zend/api/getservicedetails',
                { service_id: serviceId }
            );
            //setExpandedService(response.data);
            //const data = JSON.parse(response.data);
            if (response.data) {
                setServiceDetails(response.data.serviceInfo);
                setMileStoneDetails(response.data.serviceMilestoneData);
            } else {
                console.error('Service details are missing or invalid');
            }
            console.log(response.data)
        } catch (error) {
            console.error("Error fetching service details:", error);
        }finally{
            setSelectedService(serviceId);
            setDetailsOpen(true);
        }
    };
    
    // Trigger fetch on RefId change or on component mount
    useEffect(() => {
        if (refId) {
            fetchQuoteData();
        }
    }, [refId]);

    const handleViewdetails = (service) => {
        fetchServiceDetails(service);
    }

    const [editFormOpen, setEditFormOpen] = useState(false);
    const [selectedServiceId, setSelectedServiceId] = useState(null);
    const [selectedRefId, setSelectedRefId] = useState(null);
    const EditAndAddServicePrice = (service_id, ref_id) => {
        setDetailsOpen(false);
        setAddFormOpen(false);
        setEditFormOpen(true);
        setSelectedServiceId(service_id);
        setSelectedRefId(ref_id);
    }

    return (
        <div className="relative">
            <motion.div
                initial={{ opacity: 0.8, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`overflow-hidden bg-white  ${isExpanded ? "fixed inset-0 w-full h-full z-40" : "relative "
                    }`}
            >
                <div className='d-flex justify-end mb-2'>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="bg-blue-50 text-blue-800 p-1 rounded-md  z-50 "
                    >
                        {isExpanded ? <Minimize size={18} className='${isExpanded ? "fixed inset-0 w-full h-full z-40" : "relative "
                    }'/> : <Expand size={18} />}
                    </button>
                </div>
                {loading ? (
                    <>
                        <div className="flex justify-center items-center h-screen">
                            <Loader size={50} color="#4CAF50" />
                        </div>
                    </>
                ) : (
                    
                    <div className='bg-light p-3 relative overflow-x-hidden custom-scrollbar h-full'>
                    <div className='overflow-x-hidden custom-scrollbar h-full'>
                        {(quoteData && quoteData.length == 0 && queryInfo ) ? (
                            sessionStorage.getItem("user_type") == "user" ? 
                            <AddQuoteForm QueryInfo={queryInfo} serviceData={serviceData} expandStatus={isExpanded} closeable={false} after={fetchQuoteData} />
                            : <p className='text-red-500'>No Price Quote Found</p>
                        ) : (
                            <div className="overflow-x-auto ">
                                <table className="w-full border-collapse border border-gray-200 text-[11px] shadow-md">
                                    <thead>
                                        <tr className="bg-gray-100 text-gray-700">
                                            <th className="border border-gray-300 px-1 py-2">Service Name</th>
                                            <th className="border border-gray-300 px-1 py-2">Total Price</th>
                                            <th className="border border-gray-300 px-1 py-2">Created Date</th>
                                            <th className="border border-gray-300 px-1 py-2">Status</th>
                                            {sessionStorage.getItem('user_type') === 'user' && <th className="border border-gray-300 px-1 py-2">Action</th>}
                                            <th className="border border-gray-300 px-1 py-2">Visit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quoteData.map((service, index) => (
                                            <React.Fragment key={service.id}>
                                                <tr className="border border-gray-300 hover:bg-gray-50 transition cursor-pointer" onClick={() => handleViewdetails(service.id)}>
                                                    <td className="border border-gray-300 px-1 py-2">{service.service_name}</td>
                                                    <td className="border border-gray-300 px-1 py-2">
                                                        {(() => {
                                                            let currencyType, totalPrice;
                                                            try {
                                                                currencyType = JSON.parse(service.currency_type);
                                                                totalPrice = JSON.parse(service.total_price);
                                                            } catch (error) {
                                                                currencyType = service.currency_type;
                                                                totalPrice = service.total_price;
                                                            }

                                                            if (typeof currencyType === 'object' && typeof totalPrice === 'object') {
                                                                return Object.keys(currencyType).map((key, index) => {
                                                                    const currency = currencyType[key];
                                                                    const price = totalPrice[key];
                                                                    const isRecommended = service.recommended_plan === key.charAt(0).toUpperCase() + key.slice(1);

                                                                    return (
                                                                        <div key={index} className="flex items-start flex-col">
                                                                            <strong className="mr-1 flex items-start">{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {currency} {price}
                                                                            {isRecommended && <span className="bg-green-200 text-green-700 px-1 rounded">Recommended</span>}
                                                                        </div>
                                                                    );
                                                                });
                                                            } else {
                                                                return <>{currencyType} {totalPrice}</>;
                                                            }
                                                        })()}
                                                    </td>

                                                    <td className="border border-gray-300 px-1 py-2">
                                                        {new Date(service.created_date * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="border border-gray-300 px-1 py-2">
                                                        {service.status === 1 ? (
                                                            <span className="text-white rounded-sm  px-1 py-0.5 bg-orange-600">Draft</span>
                                                        ) : service.status === 2 ? (
                                                            <span className="text-white rounded-sm  px-1 py-0.5 bg-red-600">Approval Awaiting</span>
                                                        ) : service.status === 3 ? (
                                                            <span className="text-white rounded-sm  px-1 py-0.5 bg-yellow-600">Approved</span>
                                                        ) : service.status === 4 ? (
                                                            <span className="text-white rounded-sm  px-1 py-0.5 bg-green-600">Published</span>
                                                        ) : service.status === 5 ? (
                                                            <span className="text-white rounded-sm  px-1 py-0.5 bg-green-700 font-semibold">Paid</span>
                                                        ) : null}
                                                    </td>
                                                    {sessionStorage.getItem('user_type') === 'user' && (
                                                        <td className="border border-gray-300 px-1 py-2">
                                                            {service.status === 1 && (
                                                                <div className="flex gap-2">
                                                                    <a href="javascript:void(0);" className="text-red-500 hover:underline">{/* onClick={() => DeleteService(service.id)} */}<i className="fa fa-trash-o"></i></a>
                                                                    <a href="javascript:void(0);" className="text-blue-500 hover:underline">{/* onClick={() => EditAndAddServicePrice(service.id)} */}<i className="fa fa-edit"></i></a>
                                                                </div>
                                                            )}
                                                        </td>
                                                    )}
                                                    <td className="border border-gray-300 px-1 py-2  font-medium"><span className='text-white bg-yellow-600 px-1 py-0.5'>{service.checkoutVsit}</span></td>
                                                </tr>
                                                <tr className="hidden" id={`ServiceDiv${service.id}`}>
                                                    <td colSpan="6" className="border border-gray-300 p-3 bg-gray-50">
                                                        <div id={`ServiceContent${service.id}`}></div>
                                                    </td>
                                                </tr>
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>

                                <div className='w-full flex items-center justify-end'>
                                    {!addFormOpen && sessionStorage.getItem('user_type') == 'user' && (
                                        <button className='bg-yellow-500 text-white px-2 py-1 rounded-sm mt-2' onClick={() => setAddFormOpen(true)}>
                                            + Add New
                                        </button>
                                    )}
                                
                                </div>
                                {detailsOpen && selectedService && (
                                    <ServiceDetails serviceId={selectedService} queryInfo={queryInfo} serviceInfo={serviceDetails} serviceMilestoneData={mileStoneDetails}  onClose={() => setDetailsOpen(false)} after={handleViewdetails} EditAndAddServicePrice={EditAndAddServicePrice} finalFunction={fetchQuoteData} onComplete={after}/>
                                )}
                            </div>


                        )
                        }
                        {addFormOpen && queryInfo && <AddQuoteForm QueryInfo={queryInfo} serviceData={serviceData} mileStoneDetails={mileStoneDetails} expandStatus={isExpanded} closable={true} onClose={()=>{setAddFormOpen(false)}} after={fetchQuoteData} />}
                        {editFormOpen && queryInfo && <EditQuoteForm QueryInfo={queryInfo} serviceData={serviceData} mileStoneDetails={mileStoneDetails} expandStatus={isExpanded} closable={true} selectedServiceId={selectedServiceId} onClose={()=>{setEditFormOpen(false)}} after={fetchQuoteData} />}
                    </div>
                    </div>
                )}
            </motion.div>
        </div>

    );
};

export default UserPriceQuote;
