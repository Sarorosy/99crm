import React, { useState } from "react";
import { motion } from 'framer-motion';
import { X } from "lucide-react";
import toast from "react-hot-toast";
const AddPayment = ({onClose, finalFunction}) => {
    const [formData, setFormData] = useState({
        clientType: "",
        refId: "",
        quotationId: "",
        name: "",
        email: "",
        serviceName: "",
        upload_file: null, 
        clientAddress: "",
        pincode: "",
        currency: "",
        amount: "",
        dealAmount: "",
        terms: "",
        mode: "",
        bankName: "",
        bankAccount: "",
        paymentUrl: "",
        paymentDate: "",
        includeSubscriptionPrice: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;  // Add files to destructuring
        setFormData((prev) => ({
            ...prev,
            [name]: type === "file" ? files[0] : type === "checkbox" ? checked : value,  // Handle file input
        }));
    };

    const validateForm = () => {
        if (!formData.clientType) {
            toast.error("Please select client type");
            return false;
        }
        if (formData.clientType === "Existing Client" && !formData.refId) {
            toast.error("Please enter ref id");
            return false;
        }
        if (!formData.quotationId) {
            toast.error("Please enter quotation id");
            return false;
        }
        if (!formData.name) {
            toast.error("Please enter client name");
            return false;
        }
        if (!formData.upload_file) {
            toast.error("Please Select a file");
            return false;
        }
        if (!formData.email) {
            toast.error("Please enter client email");
            return false;
        }
        if (!formData.serviceName) {
            toast.error("Please enter service name");
            return false;
        }
        if (!formData.clientAddress) {
            toast.error("Please enter client address");
            return false;
        }
        if (!formData.pincode) {
            toast.error("Please enter pin code");
            return false;
        }
        if (!formData.currency) {
            toast.error("Please select currency");
            return false;
        }
        if (!formData.amount) {
            toast.error("Please enter amount");
            return false;
        }
        if (!formData.dealAmount) {
            toast.error("Please enter deal amount");
            return false;
        }
        if (!formData.mode) {
            toast.error("Please select payment mode");
            return false;
        }
        if (formData.mode === "Bank") {
            if (!formData.bankName) {
                toast.error("Please enter bank name");
                return false;
            }
            if (!formData.bankAccount) {
                toast.error("Please enter bank account");
                return false;
            }
        }
        if (formData.mode === "Online" && !formData.paymentUrl) {
            toast.error("Please enter payment url");
            return false;
        }
        if (!formData.paymentDate) {
            toast.error("Please select payment date");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const formDataToSend = new FormData();
                
                // Append all form fields to FormData
                formDataToSend.append('client_type', formData.clientType);
                formDataToSend.append('refId', formData.refId);
                formDataToSend.append('quotation_id', formData.quotationId);
                formDataToSend.append('name', formData.name);
                formDataToSend.append('email', formData.email);
                formDataToSend.append('service_name', formData.serviceName);
                formDataToSend.append('client_address', formData.clientAddress);
                formDataToSend.append('pincode', formData.pincode);
                formDataToSend.append('currency', formData.currency);
                formDataToSend.append('amount', formData.amount);
                formDataToSend.append('deal_amount', formData.dealAmount);
                formDataToSend.append('terms', formData.terms);
                formDataToSend.append('mode', formData.mode);
                formDataToSend.append('bank_name', formData.bankName);
                formDataToSend.append('bank_account', formData.bankAccount);
                formDataToSend.append('payment_url', formData.paymentUrl);
                formDataToSend.append('payment_date', formData.paymentDate);
                formDataToSend.append('include_subscription_price', formData.includeSubscriptionPrice);
                formDataToSend.append('user_id', sessionStorage.getItem('id'));

                // Append file if it exists
                if (formData.upload_file) {
                    formDataToSend.append('upload_file', formData.upload_file);
                }

                const response = await fetch('https://99crm.phdconsulting.in/api/addpayment', {
                    method: 'POST',
                    body: formDataToSend,
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const result = await response.json();
                if(result.status){
                    toast.success("Payment added successfully!");
                    onClose(); // Close the form after successful submission
                    finalFunction();
                }
               
            } catch (error) {
                console.error('Error:', error);
                toast.error("Failed to add payment. Please try again.");
            }
        }
    };

   


    return (
        <motion.div
            initial={{ opacity: 0, }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 right-0 h-full w-full bg-gray-50 shadow-2xl z-50 overflow-y-auto"
        >
            <div className="bg-white rounded-lg shadow-lg m-6">
                <div className="flex px-6 items-center justify-between bg-gradient-to-r from-[#0A5EB0] to-[#0A47B0] text-white py-2 rounded-t-lg">
                    <h2 className="text-xl font-semibold tracking-wide">Add Payment</h2>
                    <button
                        onClick={onClose}
                        className="text-white p-1 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-200"
                    >
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Client Type *</label>
                        <select name="clientType" value={formData.clientType} onChange={handleChange} 
                            className="w-full border rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                            <option value="">Select Client Type</option>
                            <option value="New Client">New Client</option>
                            <option value="Existing Client">Existing Client</option>
                        </select>
                    </div>

                    {formData.clientType === "Existing Client" && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Ref Id *</label>
                            <input type="text" name="refId" value={formData.refId} onChange={handleChange} 
                                className="w-full border rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Quotation Id *</label>
                        <input type="text" name="quotationId" value={formData.quotationId} onChange={handleChange} 
                            className="w-full border  rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Client Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border  rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Client Email *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border  rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Service Name *</label>
                        <input type="text" name="serviceName" value={formData.serviceName} onChange={handleChange} className="w-full border  rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Upload File</label>
                        <input 
                            type="file" 
                            name="upload_file" 
                            onChange={handleChange}
                            className="w-full border rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-1.5" 
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Client Address *</label>
                        <input type="text" name="clientAddress" value={formData.clientAddress} onChange={handleChange} className="w-full border rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Pin Code *</label>
                        <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full border  rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Currency *</label>
                        <select name="currency" value={formData.currency} onChange={handleChange} className="w-full border  rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                            <option value="">Select Currency</option>
                            <option value="USD">USD</option>
                            <option value="INR">INR</option>
                            <option value="GBP">GBP</option>
                            <option value="MYR">MYR</option>
                            <option value="EURO">EURO</option>
                            <option value="ZAR">ZAR</option>
                            <option value="SGD">SGD</option>
                            <option value="AED">AED</option>
                            <option value="AUD">AUD</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Amount *</label>
                        <input type="text" name="amount" value={formData.amount} onChange={handleChange} className="w-full border  rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Deal Amount *</label>
                        <input type="text" name="dealAmount" value={formData.dealAmount} onChange={handleChange} className="w-full border  rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Payment Terms *</label>
                        <input type="text" name="terms" value={formData.terms} onChange={handleChange} className="w-full border  rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Payment Mode *</label>
                        <select name="mode" value={formData.mode} onChange={handleChange} className="w-full border  rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                            <option value="">Select Mode</option>
                            <option value="Bank">Bank</option>
                            <option value="Online">Online</option>
                        </select>
                    </div>

                    {formData.mode === "Bank" && (
                        <>
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700">Bank Name *</label>
                                <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} 
                                    className="w-full border rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700">Bank Account *</label>
                                <input type="text" name="bankAccount" value={formData.bankAccount} onChange={handleChange} 
                                    className="w-full border rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                            </div>
                        </>
                    )}

                    {formData.mode === "Online" && (
                        <div className="space-y-1 md:col-span-4">
                            <label className="text-sm font-medium text-gray-700">Payment Url *</label>
                            <input type="text" name="paymentUrl" value={formData.paymentUrl} onChange={handleChange} 
                                className="w-full border rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                        </div>
                    )}

                    <div className="space-y-1 ">
                        <label className="text-sm font-medium text-gray-700">Payment Date *</label>
                        <input type="date" name="paymentDate" value={formData.paymentDate} onChange={handleChange} className="w-full border  rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>

                    <div className="md:col-span-4 flex items-center space-x-2">
                        <input type="checkbox" id="includeSubscriptionPrice" name="includeSubscriptionPrice" 
                            checked={formData.includeSubscriptionPrice} 
                            onChange={handleChange}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        <label htmlFor="includeSubscriptionPrice" className="text-sm font-medium text-gray-700">Subscription Amount Included</label>
                    </div>

                    <div className="md:col-span-4 flex justify-end">
                        <button type="submit" 
                            className="w-48 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200">
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default AddPayment;
