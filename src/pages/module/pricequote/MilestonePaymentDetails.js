import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const MilestonePaymentDetails = ({ paymentDetails, onClose, finalFunction }) => {
    const [updateStatus, setUpdateStatus] = useState('');
    const [comments, setComments] = useState('');
    const [milestoneInfo, setMilestoneInfo] = useState(null);
    const [phdPlannerPaid, setPhdPlannerPaid] = useState([]);
    const [paymentComments, setPaymentComments] = useState('');
    const [isPhdPlannerChecked, setIsPhdPlannerChecked] = useState(false);

    // Function to calculate discounted price
    const calculateDiscount = (milestoneInfo) => {
        let discountPrice = milestoneInfo.milestone_price;
        if (milestoneInfo.discount_type !== 'None') {
            if (milestoneInfo.discount_type === 1) {
                discountPrice = roundToTwo(milestoneInfo.milestone_price - (milestoneInfo.milestone_price * milestoneInfo.discount_value / 100));
            } else if (milestoneInfo.discount_type === 2) {
                discountPrice = roundToTwo(milestoneInfo.milestone_price - (milestoneInfo.discount_value / milestoneInfo.milestone));
            }
        }
        return discountPrice;
    };
    const discountPrice = calculateDiscount(paymentDetails);

    // Function to round price to two decimal places
    const roundToTwo = (num) => {
        return Math.round(num * 100) / 100;
    };

    // Fetch milestone details based on paymentDetails.id
    useEffect(() => {
        const fetchMilestoneDetails = async () => {
            if (paymentDetails?.id) {
                try {
                    const response = await fetch(`https://99crm.phdconsulting.in/api/milestonedetails`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            m_id: paymentDetails.id
                        })
                    });

                    const data = await response.json();
                    if (data?.milestoneInfo) {
                        setMilestoneInfo(data.milestoneInfo);
                        setPhdPlannerPaid(data.phdPlannerPaid);
                    } else {
                        toast.error('Failed to fetch milestone details');
                    }
                } catch (error) {
                    console.error('Error fetching milestone details:', error);
                    toast.error('Failed to fetch milestone details');
                }
            }
        };

        fetchMilestoneDetails();
    }, [paymentDetails?.id]);

    const formatDate = (timestamp) => {
        if (timestamp) {
            const date = new Date(timestamp * 1000); // Convert from Unix timestamp
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }
        return '-';
    };

    const PaymentConfirm = async (mid, status) => {
        if (!paymentComments) {
            toast.error("Please enter comments");
            return;
        }

        try {
            const response = await fetch('https://99crm.phdconsulting.in/api/confirmpayment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mid: mid,
                    status: status,
                    payment_comments: paymentComments,
                    PhdPlanerPayment: document.querySelector('[name="PhdPlanerPayment"]')?.checked ? 1 : 0
                })
            });

            const data = await response.json();
            if (data.status) {
                // Refresh milestone details
                const updatedResponse = await fetch(`https://99crm.phdconsulting.in/api/milestonedetails`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ m_id: mid })
                });
                const updatedData = await updatedResponse.json();
                if (updatedData?.milestoneInfo) {
                    setMilestoneInfo(updatedData.milestoneInfo);
                    setPhdPlannerPaid(updatedData.phdPlannerPaid);
                    toast.success('Payment status updated successfully');
                }
            } else {
                toast.error('Failed to update payment status');
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

                <div className="p-6 space-y-4">
                    <div className='text-sm' id="formComment">
                        <div className="grid grid-cols-1 gap-4">
                            {/* Ref ID */}
                            <div className="flex">
                                <div className="w-5/12"><label className="font-medium">Ref Id</label></div>
                                <div className="w-7/12">{milestoneInfo?.ref_id}</div>
                            </div>

                            {/* Client Name */}
                            <div className="flex">
                                <div className="w-5/12"><label className="font-medium">Client Name</label></div>
                                <div className="w-7/12">{milestoneInfo?.name}</div>
                            </div>

                            {/* Client Email */}
                            <div className="flex">
                                <div className="w-5/12"><label className="font-medium">Client Email</label></div>
                                <div className="w-7/12">{milestoneInfo?.email_id}</div>
                            </div>

                            {/* CRM Name */}
                            <div className="flex">
                                <div className="w-5/12"><label className="font-medium">CRM Name</label></div>
                                <div className="w-7/12">{milestoneInfo?.crm_name}</div>
                            </div>

                            {/* Service Name */}
                            <div className="flex">
                                <div className="w-5/12"><label className="font-medium">Service Name</label></div>
                                <div className="w-7/12">{milestoneInfo?.service_name}</div>
                            </div>

                            {/* Milestone Price */}
                            <div className="flex">
                                <div className="w-5/12"><label className="font-medium">Milestone Price</label></div>
                                <div className="w-7/12">{milestoneInfo?.currency_type} {milestoneInfo?.milestone_price}</div>
                            </div>

                            {/* Discount Price (if applicable) */}
                            {milestoneInfo?.discount_type !== 'None' && (
                                <>
                                    <div className="flex">
                                        <div className="w-5/12"><label className="font-medium">Discount Value</label></div>
                                        <div className="w-7/12">{milestoneInfo?.discount_value} {milestoneInfo?.discount_type == 1 ? "%" : ""}</div>
                                    </div>
                                    <div className="flex">
                                        <div className="w-5/12"><label className="font-medium">Discounted Price</label></div>
                                        <div className="w-7/12">{milestoneInfo?.currency_type} {discountPrice}</div>
                                    </div>
                                </>
                            )}

                            {/* PhD Planner Payment */}
                            {milestoneInfo?.PhdPlanerPayment === 1 && (
                                <>
                                    <div className="flex">
                                        <div className="w-5/12"><label className="font-medium">Received PhD Planner Payment</label></div>
                                        <div className="w-7/12">{milestoneInfo?.currency_type} 1430</div>
                                    </div>
                                    <div className="flex">
                                        <div className="w-5/12"><label className="font-medium">Total Amount Received</label></div>
                                        <div className="w-7/12">{milestoneInfo?.currency_type} {discountPrice + 1430}</div>
                                    </div>
                                </>
                            )}

                            {/* Milestone Name */}
                            <div className="flex">
                                <div className="w-5/12"><label className="font-medium">Milestone Name</label></div>
                                <div className="w-7/12">{milestoneInfo?.milestone_name}</div>
                            </div>

                            {/* Milestone Paid Date */}
                            {milestoneInfo?.paid_date && (
                                <div className="flex">
                                    <div className="w-5/12"><label className="font-medium">Milestone Paid</label></div>
                                    <div className="w-7/12">{formatDate(milestoneInfo?.paid_date)}</div>
                                </div>
                            )}

                            {/* Address */}
                            {milestoneInfo?.complete_address && (
                                <div className="flex">
                                    <div className="w-5/12"><label className="font-medium">Address</label></div>
                                    <div className="w-7/12">{milestoneInfo?.complete_address}</div>
                                </div>
                            )}

                            {/* Upload File */}
                            {milestoneInfo?.uplaoded_file && (
                                <div className="flex">
                                    <div className="w-5/12"><label className="font-medium">Upload File</label></div>
                                    <div className="w-7/12">
                                        <a download href={`/UploadFolder/${milestoneInfo?.uplaoded_file}`}><i className="fa fa-download"></i> Download</a>
                                    </div>
                                </div>
                            )}

                            {/* Payment Status */}
                            <div className="flex">
                                <div className="w-5/12"><label className="font-medium">Payment Status</label></div>
                                <div className="w-7/12">
                                    {milestoneInfo?.status === 0 && <span className="text-sm px-2 py-1 rounded bg-yellow-500 text-white">Pending</span>}
                                    {milestoneInfo?.status === 1 && <span className="text-sm px-2 py-1 rounded bg-yellow-500 text-white">Paid</span>}
                                    {milestoneInfo?.status === 2 && <span className="text-sm px-2 py-1 rounded bg-green-500 text-white">Confirmed</span>}
                                    {milestoneInfo?.status === 3 && <span className="text-sm px-2 py-1 rounded bg-red-500 text-white">Rejected</span>}
                                </div>
                            </div>

                            {/* Comments */}
                            {milestoneInfo?.status > 1 && milestoneInfo?.comments && (
                                <div className="flex">
                                    <div className="w-5/12"><label className="font-medium">Comments</label></div>
                                    <div className="w-7/12">{milestoneInfo?.comments}</div>
                                </div>
                            )}

                            {milestoneInfo?.subscription_code && (
                                <div className="flex">
                                    <div className="w-5/12"><label className="font-medium">Subscription Code</label></div>
                                    <div className="w-7/12">{milestoneInfo?.subscription_code}</div>
                                </div>
                            )}

                            {/* Payment Comments and Actions Section */}
                            {milestoneInfo?.status == 1 && (
                                <>
                                    <div className="flex">
                                        <div className="w-5/12"><label className="font-medium">Comments</label></div>
                                        <div className="w-7/12">
                                            <textarea
                                                className="form-control"
                                                name="payment_comments"
                                                value={paymentComments}
                                                onChange={(e) => setPaymentComments(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* PhD Planner Payment Checkbox */}
                                    {milestoneInfo?.currency_type === 'INR' && phdPlannerPaid.length === 0 && (
                                        <div className="flex">
                                            <div className="w-5/12"></div>
                                            <div className="w-7/12">
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        name="PhdPlanerPayment"
                                                        checked={isPhdPlannerChecked}
                                                        onChange={(e) => setIsPhdPlannerChecked(e.target.checked)}
                                                        className="form-checkbox"
                                                    />
                                                    <span>Receive PhD Planner Payment (INR 1430)</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex justify-end mt-4">

                                        <div className="space-x-4">
                                            <button
                                                type='button'
                                                className="bg-red-600 hover:bg-red-700 p-1 text-sm rounded text-white"
                                                onClick={() => PaymentConfirm(milestoneInfo.id, 3)}
                                            >
                                                Payment Rejected
                                            </button>
                                            <button
                                                type='button'
                                                className="bg-green-600 hover:bg-green-700 text-sm p-1 rounded text-white"
                                                onClick={() => PaymentConfirm(milestoneInfo.id, 2)}
                                            >
                                                Payment Confirm
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}


                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MilestonePaymentDetails;
