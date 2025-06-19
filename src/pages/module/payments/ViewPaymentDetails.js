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
            className="fixed top-0 right-0 h-full w-1/3 bg-gray-50 shadow-2xl z-50 overflow-y-auto p-2"
        >
            <div className="rounded-lg bg-white border overflow-hidden">
                <div className="flex px-3 py-2.5 items-center justify-between theme rounded-t-lg">
                    <h2 className="text-md font-semibold">Payment Details</h2>
                    <button
                        onClick={onClose}
                        className="btn btn-danger btn-sm px-1"
                    >
                        <X size={12} />
                    </button>
                </div>
                
                <div className="py-3 px-3 ">
                    <div className="grid grid-cols-2 gap-2 f-13">
                        {/* Payment Information Cards */}
                        <div className="col-span-2 bg-blue-50 rounded-lg p-2 border border-blue-100">
                            <p className="text-sm font-medium text-blue-800 mb-2">Client Information</p>
                            <div className="grid grid-cols-1 gap-1">
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

                        <div className="col-span-2 bg-green-50 rounded-lg p-2 border border-green-100">
                            <p className="text-sm font-medium text-green-800 mb-2">Service Details</p>
                            <div className="grid grid-cols-1 gap-1">
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
                                        <a href={"https://99crm.phdconsulting.in/zend/" + paymentDetails.upload_file} target='_blank' className="text-blue-600 hover:text-blue-800 hover:underline ml-2">
                                            Download File
                                        </a>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="col-span-2 bg-purple-50 rounded-lg p-2 border border-purple-100">
                            <p className="text-sm font-medium text-purple-800 mb-2">Payment Information</p>
                            <div className="grid grid-cols-1 gap-1">
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
                                    <span className={`badge text-dark ${
                                        paymentDetails.status === 1 ? 'bg-gray-200' :
                                        paymentDetails.status === 2 ? 'bg-yellow-200' :
                                        paymentDetails.status === 3 ? 'bg-green-200' :
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
