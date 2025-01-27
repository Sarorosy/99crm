import React, { useState, useEffect, useRef } from 'react';
import $ from 'jquery';
import 'select2/dist/css/select2.css';
import 'select2';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CircleX } from 'lucide-react';
import CustomLoader from '../../../../components/CustomLoader';
import { Editor } from '@tinymce/tinymce-react';


const EditWebsite = ({ onClose, afterSave, websiteId }) => {
    const [websiteName, setWebsiteName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [logo, setLogo] = useState(null);
    const [newLogo, setNewLogo] = useState('');
    const [senderId, setSenderId] = useState('');
    const [colorCode, setColorCode] = useState('');
    const [webCode, setWebCode] = useState('');
    const [phdPlanner, setPhdPlanner] = useState(0);
    const [paymentData, setPaymentData] = useState([]);
    const [mailContent, setMailContent] = useState('');
    const [mailContentWithoutCoupon, setMailContentWithoutCoupon] = useState('');
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const selectCompanyRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const fetchCompanies = async () => {
        try {
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/companies');
            const data = await response.json();
            if (data.status) {
                setCompanies(data.data); // Assuming data.data contains the companies
            } else {
                console.error('Failed to fetch companies');
            }
        } catch (err) {
            console.error('Error fetching companies:', err);
        }
    };

    // Fetch Team Details
    const fetchWebsiteDetails = async (id) => {
        try {
            setLoading(true)
            const response = await fetch(`https://99crm.phdconsulting.in/99crmwebapi/api/getwebsite/${id}`);
            const data = await response.json();
            if (data.status && data.data) {
                const website = data.data[0]; // Access the first item in the data array

                // Set all state variables based on the fetched data
                setWebsiteName(website.website || '');
                setDisplayName(website.display_name || '');
                setLogo(website.logo || '');
                setSenderId(website.sender_id || '');
                setColorCode(website.color_code || '');
                setWebCode(website.web_code || '');
                setPhdPlanner(website.checkPhdPlanner || 0);
                setPaymentData((website.paymentData) ? JSON.parse(website.paymentData) : [{}]);
                setMailContent(website.mail_content || 0);
                setMailContentWithoutCoupon(website.without_coupon_mail_content || '');
                setSelectedCompany(website.company_id || '');

            } else {
                console.error('Failed to fetch website details');
            }
        } catch (err) {
            console.error('Error fetching website details:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies(); // Call the function to fetch companies

        if (websiteId) {
            fetchWebsiteDetails(websiteId.id); // Call the function to fetch team details
        }
    }, [websiteId]);

    useEffect(() => {
        // Initialize select2 for Select Team
        $(selectCompanyRef.current).select2({
            placeholder: "Select a Company",
            allowClear: true,
        }).on('change', (e) => {
            setSelectedCompany($(e.target).val());
        });
        if (selectedCompany != '') {
            $(selectCompanyRef.current).val(selectedCompany).trigger('change');
        }


        return () => {
            // Destroy select2 when the component unmounts
            if (selectCompanyRef.current) {
                $(selectCompanyRef.current).select2('destroy');
            }
        };
    }, [companies]);

    const handleAddPaymentField = () => {
        setPaymentData([
            ...paymentData,
            { currency_type: '', payment_url: '' },
        ]);
    };

    const handleRemovePaymentField = (index) => {
        const updatedData = [...paymentData];
        updatedData.splice(index, 1);
        setPaymentData(updatedData);
    };

    const handleChangePaymentField = (index, field, value) => {
        const updatedData = [...paymentData];
        updatedData[index][field] = value;
        setPaymentData(updatedData);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    
        if (!websiteName || !selectedCompany) {
            toast.error('Please fill all required fields.');
            return;
        }
    
        // Create a FormData object
        const formData = new FormData();
        formData.append('id',websiteId.id)
        formData.append('website', websiteName);
        formData.append('company_id', selectedCompany);
        formData.append('payment_data', JSON.stringify(paymentData)); // If it's an array, convert it to a string
        formData.append('display_name', displayName);
        formData.append('sender_id', senderId);
        formData.append('color_code', colorCode);
        formData.append('checkPhdPlanner', phdPlanner);
        formData.append('mailContent', mailContent);
        formData.append('mailContentWithoutCoupon', mailContentWithoutCoupon);
    
        // Append the logo file if it exists
        if (logo instanceof File) {
            formData.append('logo', logo);
        }
    
        fetch('https://99crm.phdconsulting.in/editwebsite.php/', {
            method: 'POST',
            body: formData, // Use FormData directly as the body
            //mode: 'no-cors' 
        })
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    toast.success('Website updated successfully');
                    setWebsiteName('');
                    setSelectedCompany('');
                    setTimeout(() => {
                        onClose();
                        afterSave();
                    }, 1000);
                } else {
                    toast.error('Failed to update website');
                }
            })
            .catch(err => toast.error('Error updating website:', err));
    };
    

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-gray-100 shadow-lg z-50 overflow-y-auto p-6"
        >
            <h2 className="text-xl font-semibold mb-4 text-center">Edit Website</h2>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-600 hover:text-red-600 transition-colors cremove"
            >
                <CircleX size={32} />
            </button>
            {loading ? (<CustomLoader />) : (

                <div className='col-md-7 cent add'>
                <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4 p-4 border-t-2 bg-white rounded border-blue-400 shadow-xl">
                    <div className="flex w-full space-x-3 justify-center">
                        {/* Website Name Field */}
                        <div className="form-group w-1/2">
                            <label htmlFor="website_name" className="block text-sm font-medium text-gray-700 mb-2">
                                Website Name
                            </label>
                            <input
                                type="text"
                                id="website_name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-200 cursor-not-allowed"
                                value={websiteName}
                                readOnly
                                disabled
                            />
                        </div>
                        <div className="form-group w-1/2">
                            <label htmlFor="website_name" className="block text-sm font-medium text-gray-700 mb-2">
                                Display Name
                            </label>
                            <input
                                type="text"
                                id="display_name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm "
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex w-full space-x-3 justify-center">
                        {/* Manager Name Field */}
                        <div className="form-group w-1/2 hs">
                            <label htmlFor="company_id" className="block text-sm font-medium text-gray-700 mb-2">
                                Company
                            </label>
                            <select
                                id="company_id"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedCompany}
                                ref={selectCompanyRef}
                            >
                                <option value="">Select a Company</option>
                                {companies.map((company) => (
                                    <option key={company.id} value={company.id}>
                                        {company.company_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group w-1/2">
                            <label htmlFor="sender_id" className="block text-sm font-medium text-gray-700 mb-2">
                                Sender ID
                            </label>
                            <input
                                type="text"
                                id="sender_id"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                value={senderId}
                                onChange={(e) => setSenderId(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Additional Fields */}
                    <div className="flex w-full space-x-3 justify-center">
                        
                        {/* Color Code Field */}
                        <div className="form-group w-1/3 mx-2">
                            <label htmlFor="color_code" className="block text-sm font-medium text-gray-700 mb-2">
                                Color Code
                            </label>
                            <input
                                type="color"
                                id="color_code"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                value={colorCode}
                                onChange={(e) => setColorCode(e.target.value)}
                            />
                        </div>

                        {/* PHD Planner Field */}
                        <div className="form-group w-1/3 mx-2 flex items-center cbl">
                        <input
                                type="checkbox"
                                id="phd_planner"
                                className="ml-2"
                                checked={phdPlanner == 1}
                                onChange={(e) => setPhdPlanner(e.target.checked ? 1 : 0)}
                            />
                            <label htmlFor="phd_planner" className="block text-sm font-medium text-gray-700 mb-2">
                                Check PhD Planner
                            </label>
                        </div>

                        {/* Logo Upload Field */}
                        <div className="form-group w-1/3 mx-2">
                            <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
                                Logo
                            </label>
                            <input
                                type="file"
                                id="logo"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    setLogo(file);
                                }}
                            />
                        </div>
                        {logo && (
                            <div className="form-group w-1/3 mx-2 logimg">
                                <img
                                    src={logo instanceof File ? URL.createObjectURL(logo) : `https://99crm.phdconsulting.in/public/images/logos/${logo}`}
                                    alt="Website Logo"
                                    onLoad={() => logo instanceof File && URL.revokeObjectURL(URL.createObjectURL(logo))} // Free memory for blob URL
                                    className="rounded-md shadow-lg max-w-full"
                                />
                            </div>
                        )}

                    </div>

                    <div className='w-full flex space-x-2 items-center mt-4'>
                    <div>
                        <h3 className="text-lg font-semibold">Payment Information</h3>
                        {(paymentData.length === 0 ? [{}] : paymentData).map((payment, index) => (
                            <div key={index} className="flex items-center justify-start space-x-4 my-2">
                                <div className="w-1/3">
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:outline-none"
                                        value={payment.currency_type || ''}
                                        onChange={(e) => handleChangePaymentField(index, 'currency_type', e.target.value)}
                                    >
                                        <option value="">Select Currency</option>
                                        <option value="INR">INR</option>
                                        <option value="USD">USD</option>
                                        <option value="GBP">GBP</option>
                                        <option value="AUD">AUD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="MYR">MYR</option>
                                        <option value="SGD">SGD</option>
                                        <option value="ZAR">ZAR</option>
                                        <option value="CAD">CAD</option>
                                        <option value="TZS">TZS</option>
                                        <option value="UGX">UGX</option>
                                        <option value="NGN">NGN</option>
                                        <option value="ETB">ETB</option>
                                        <option value="ZMW">ZMW</option>
                                    </select>
                                </div>

                                <div className="w-full">
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        value={payment.payment_url || ''}
                                        onChange={(e) => handleChangePaymentField(index, 'payment_url', e.target.value)}
                                    >
                                        <option value="">Select a Payment URL</option>
                                        <option value="https://www.phdbox.edu.in/razorpay/instacrm-pay.php">
                                            https://www.phdbox.edu.in/razorpay/instacrm-pay.php
                                        </option>
                                        <option value="https://www.regentediting.com/stripe/instacrm-strip.php">
                                            https://www.regentediting.com/stripe/instacrm-strip.php
                                        </option>
                                        <option value="https://www.learchgroup.com/instacrm-strip.php">
                                            https://www.learchgroup.com/instacrm-strip.php
                                        </option>
                                        <option value="https://www.fivevidya.com/instacrm-strip.php">
                                            https://www.fivevidya.com/instacrm-strip.php
                                        </option>
                                        <option value="https://www.fflspl.com/instacrm-razorpay.php">
                                            https://www.fflspl.com/instacrm-razorpay.php
                                        </option>
                                        <option value="https://www.chanakyaresearch.com/instamojo/instacrm.php">
                                            https://www.chanakyaresearch.com/instamojo/instacrm.php
                                        </option>
                                        <option value="https://www.authenu.com/instacrm-strip.php">
                                            https://www.authenu.com/instacrm-strip.php
                                        </option>
                                        <option value="https://webeshop.in/payment/instacrm_razorpay">
                                            https://webeshop.in/payment/instacrm_razorpay
                                        </option>
                                        <option value="https://www.learchgroup.com/instamojo/instacrm-instamojo-elementk.php">
                                            https://www.learchgroup.com/instamojo/instacrm-instamojo-elementk.php
                                        </option>
                                        <option value="https://www.regentresearch.com/razorpay/ti-instacrm-razorpay.php">
                                            https://www.regentresearch.com/razorpay/ti-instacrm-razorpay.php
                                        </option>
                                        <option value="https://emarketzindia.com/instacrm-ccavenue.php">
                                            https://emarketzindia.com/instacrm-ccavenue.php
                                        </option>
                                        <option value="https://www.emarketz.net/razorpay/instacrm-pay.php">
                                            https://www.emarketz.net/razorpay/instacrm-pay.php
                                        </option>
                                    </select>
                                </div>

                                {index === 0 ? (
                                    <button
                                        type="button"
                                        onClick={handleAddPaymentField}
                                        className="ml-4 plus"
                                    >
                                        +
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleRemovePaymentField(index)}
                                        className="ml-4 minus"
                                    >
                                        -
                                    </button>
                                )}
                            </div>
                        ))}

                    </div>
                    </div>

                    <div className='w-full flex space-x-2 items-center mt-4'>
                        <div className="w-1/2 mx-1">
                            <label className="font-medium text-gray-700">Mail Content (With Coupon) </label>
                            <Editor
                                apiKey="2crkajrj0p3qpzebc7qfndt5c6xoy8vwer3qt5hsqqyv8hb8" // Your TinyMCE API Key
                                value={mailContent}
                                init={{
                                    height: 400,
                                    menubar: false,
                                    plugins: ['advlist autolink lists link charmap print preview anchor'],
                                    toolbar: 'undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat',
                                    placeholder: 'Signature',
                                }}
                                onEditorChange={(content) => setMailContent(content)}
                            />
                        </div>
                        <div className="w-1/2 mx-1">
                            <label className="font-medium text-gray-700">Mail Content (Without Coupon)</label>
                            <Editor
                                apiKey="2crkajrj0p3qpzebc7qfndt5c6xoy8vwer3qt5hsqqyv8hb8" // Your TinyMCE API Key
                                value={mailContentWithoutCoupon}
                                init={{
                                    height: 400,
                                    menubar: false,
                                    plugins: ['advlist autolink lists link charmap print preview anchor'],
                                    toolbar: 'undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat',
                                    placeholder: 'Signature',
                                }}
                                onEditorChange={(content) => setMailContentWithoutCoupon(content)}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="text-end buton">
                        <button
                            type="submit"
                            className="mt-3 px-3 py-1 mx-auto bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Update Website
                        </button>
                    </div>
                </form></div>

            )}
            <ToastContainer />
        </motion.div>
    );
};

export default EditWebsite;
