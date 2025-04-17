import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const ViewPaymentDetails = ({ paymentDetails, onClose , finalFunction}) => {
    const [updateStatus, setUpdateStatus] = useState('');
    const [comments, setComments] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if(!updateStatus || !comments) {
                toast.error('Please fill all the fields');
                return;
            }
            const response = await fetch('https://99crm.phdconsulting.in/zend/api/updatepayment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    payment_id: paymentDetails.id,
                    status: updateStatus,
                    comments: comments
                })
            });

            const data = await response.json();
            
            if (data.status) {
                toast.success('Payment status updated successfully');
                finalFunction();
                onClose();
            } else {
                toast.error(data.message || 'Failed to update payment status');
            }
        } catch (error) {
            console.error('Error updating payment status:', error);
            toast.error('Failed to update payment status');
        }
    };

    if (!paymentDetails) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, x: 500 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 500 }} 
            className="fixed top-0 right-0 h-full w-2/3 bg-gray-50 shadow-2xl z-50 overflow-y-auto"
        >
            <div className="bg-white rounded-lg shadow-lg m-6">
                <div className="flex px-6 items-center justify-between bg-gradient-to-r from-[#0A5EB0] to-[#0A47B0] text-white py-2 rounded-t-lg">
                    <h2 className="text-xl font-semibold tracking-wide">Payment Details</h2>
                    <button
                        onClick={onClose}
                        className="text-white p-1 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-200"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-2 gap-2">
                        {/* Payment Information Cards */}
                        <div className="col-span-2 bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <p className="text-lg font-medium text-blue-800 mb-3">Client Information</p>
                            <div className="grid grid-cols-2 gap-1">
                                <p className="flex items-center"><span className="font-medium text-gray-700 min-w-32">Client Type:</span> 
                                    <span className="text-gray-600 ml-2">{paymentDetails.client_type}</span>
                                </p>
                                {paymentDetails.client_type === 'Existing Client' && (
                                    <p className="flex items-center"><span className="font-medium text-gray-700 min-w-32">Ref ID:</span>
                                        <span className="text-gray-600 ml-2">{paymentDetails.refId}</span>
                                    </p>
                                )}
                                <p className="flex items-center"><span className="font-medium text-gray-700 min-w-32">Client Name:</span>
                                    <span className="text-gray-600 ml-2">{paymentDetails.name}</span>
                                </p>
                                <p className="flex items-center"><span className="font-medium text-gray-700 min-w-32">Client Email:</span>
                                    <span className="text-gray-600 ml-2">{paymentDetails.email}</span>
                                </p>
                            </div>
                        </div>

                        <div className="col-span-2 bg-green-50 rounded-lg p-4 border border-green-100">
                            <p className="text-lg font-medium text-green-800 mb-3">Service Details</p>
                            <div className="grid grid-cols-2 gap-1">
                                <p className="flex items-center"><span className="font-medium text-gray-700 min-w-32">Service Name:</span>
                                    <span className="text-gray-600 ml-2">{paymentDetails.service_name}</span>
                                </p>
                                <p className="flex items-center"><span className="font-medium text-gray-700 min-w-32">Quotation ID:</span>
                                    <span className="text-gray-600 ml-2">{paymentDetails.quotation_id}</span>
                                </p>
                                {paymentDetails.confirmation_id && (
                                    <p className="flex items-center"><span className="font-medium text-gray-700 min-w-32">Confirmation ID:</span>
                                        <span className="text-gray-600 ml-2">{paymentDetails.confirmation_id}</span>
                                    </p>
                                )}
                                {paymentDetails.upload_file && (
                                    <p className="flex items-center"><span className="font-medium text-gray-700 min-w-32">Upload File:</span>
                                        <a href={"https://99crm.phdconsulting.in/" + paymentDetails.upload_file} target='_blank' className="text-blue-600 hover:text-blue-800 hover:underline ml-2">
                                            Download File
                                        </a>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="col-span-2 bg-purple-50 rounded-lg p-4 border border-purple-100">
                            <p className="text-lg font-medium text-purple-800 mb-3">Payment Information</p>
                            <div className="grid grid-cols-2 gap-1">
                                <p className="flex items-center"><span className="font-medium text-gray-700 min-w-32">Amount:</span>
                                    <span className="text-gray-600 ml-2">{paymentDetails.currency} {paymentDetails.amount}</span>
                                </p>
                                <p className="flex items-center"><span className="font-medium text-gray-700 min-w-32">Total Deal Amount:</span>
                                    <span className="text-gray-600 ml-2">{paymentDetails.currency} {paymentDetails.deal_amount}</span>
                                </p>
                                <p className="flex items-center"><span className="font-medium text-gray-700 min-w-32">Payment Terms:</span>
                                    <span className="text-gray-600 ml-2">{paymentDetails.terms}</span>
                                </p>
                                <p className="flex items-center"><span className="font-medium text-gray-700 min-w-32">Payment Mode:</span>
                                    <span className="text-gray-600 ml-2">{paymentDetails.mode}</span>
                                </p>
                                {paymentDetails.mode === 'Bank' && (
                                    <>
                                        <p className="flex items-center"><span className="font-medium text-gray-700 min-w-32">Bank Name:</span>
                                            <span className="text-gray-600 ml-2">{paymentDetails.bank_name}</span>
                                        </p>
                                        <p className="flex items-center"><span className="font-medium text-gray-700 min-w-32">Bank Account:</span>
                                            <span className="text-gray-600 ml-2">{paymentDetails.bank_account}</span>
                                        </p>
                                    </>
                                )}
                                {paymentDetails.mode === 'Online' && (
                                    <p className="flex items-center"><span className="font-medium text-gray-700 min-w-32">Payment URL:</span>
                                        <span className="text-gray-600 ml-2">{paymentDetails.payment_url}</span>
                                    </p>
                                )}
                                <p className="flex items-center"><span className="font-medium text-gray-700 min-w-32">Status:</span>
                                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                                        paymentDetails.status === 1 ? 'bg-gray-200 text-gray-700' :
                                        paymentDetails.status === 2 ? 'bg-yellow-200 text-yellow-700' :
                                        paymentDetails.status === 3 ? 'bg-green-200 text-green-700' :
                                        'bg-red-200 text-red-700'
                                    }`}>
                                        {paymentDetails.status === 1 ? 'Pending' :
                                         paymentDetails.status === 2 ? 'On Hold' :
                                         paymentDetails.status === 3 ? 'Confirmed' : 'Rejected'}
                                    </span>
                                </p>
                                <p className="flex items-center"><span className="font-medium text-gray-700 min-w-32">Payment Date:</span>
                                    <span className="text-gray-600 ml-2">{paymentDetails.payment_date}</span>
                                </p>
                                <p className="flex items-center"><span className="font-medium text-gray-700 min-w-32">Created Date:</span>
                                    <span className="text-gray-600 ml-2">{new Date(paymentDetails.craeted_date * 1000).toLocaleString()}</span>
                                </p>
                                {/* Payment Status Update Form */}
                                {paymentDetails.status == 1 && sessionStorage.getItem('user_type') === 'Accountant' && (
                                    <div className="col-span-2 mt-4">
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-center">
                                                    <span className="font-medium text-gray-700 min-w-32">Update Status:</span>
                                                    <select 
                                                        name="status" 
                                                        value={updateStatus}
                                                        onChange={(e) => setUpdateStatus(e.target.value)}
                                                        className="ml-2 form-select rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                        
                                                    >
                                                        <option value="" label="Status">Select Status</option>
                                                        <option value="1">Pending</option>
                                                        <option value="2">On Hold</option>
                                                        <option value="3">Confirm</option>
                                                        <option value="4">Reject</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="font-medium text-gray-700 min-w-32">Comments:</span>
                                                    <textarea
                                                        name="comments"
                                                        value={comments}
                                                        onChange={(e) => setComments(e.target.value)}
                                                        className=" border ml-2 form-textarea p-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full"
                                                        rows="2"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
                                                >
                                                    Submit
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                                
                                {paymentDetails.status !== 1 && paymentDetails.comments && (
                                    <div className="col-span-2 mt-4 space-y-3">
                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-700 min-w-32">Comments:</span>
                                            <span className="text-gray-600 ml-2">{paymentDetails.comments}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-700 min-w-32">Updated Date:</span>
                                            <span className="text-gray-600 ml-2">
                                                {new Date(paymentDetails.updatedDate * 1000).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ViewPaymentDetails;
