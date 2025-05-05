import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import one from '../assets/1.png';
import two from '../assets/2.png';
import three from '../assets/3.png';
import toast from 'react-hot-toast';

const LeadsUpdateForm = ({finalFunction}) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleCheckboxChange = (value) => {
        setSelectedOption(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = sessionStorage.getItem('id');

        if (!selectedOption || !userId) {
            alert('Please select an option and ensure user is logged in.');
            return;
        }

        try {
            setSubmitting(true);
            const response = await fetch(
                'https://99crm.phdconsulting.in/zend/api/updatedailyworkstatus',
                {
                    method :"POST",
                    headers : {
                        "Content-type" : "application/json"
                    }, body : JSON.stringify({
                        lead_option: selectedOption,
                        userId,
                    })
                    
                }
            );
            const data = await response.json()
            if(data.status){
                toast.success(data.message || "Work Details Added!")
                sessionStorage.setItem('is_workstatus_selected', '1');
                sessionStorage.setItem('workstatus_selected_at', new Date().toISOString());
                console.log("fromm" + new Date().toISOString())
                finalFunction();
            }else{
                toast.error(data.message || "Error")
            }
        } catch (error) {
            console.error('Submission error:', error);
            toast.error('Failed to update status.');
        } finally {
            setSubmitting(false);
        }
    };

    const options = [
        {
            value: '1',
            title: 'Max Fresh Enquiries',
            image: one,
            description: 'I would need max fresh enquiries to work upon (7+ Leads)',
        },
        {
            value: '2',
            title: 'Few Fresh Enquiries',
            image: two,
            description: 'I would need few fresh enquiries to work upon (3+ Leads)',
        },
        {
            value: '3',
            title: 'No More Leads Needed',
            image: three,
            description: 'I have enough work at hand and would not require more leads',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-5xl mx-4"
            >
                <form onSubmit={handleSubmit} className="container">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {options.map((option) => (
                            <label
                                key={option.value}
                                onClick={() => handleCheckboxChange(option.value)}
                                className={`cursor-pointer rounded-2xl border-2 p-6 shadow-md transition-all duration-300 text-center hover:shadow-lg hover:shadow-2xl ${selectedOption === option.value ? 'border-[#257180] ' : 'border-gray-200'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={selectedOption === option.value}
                                    readOnly
                                />
                                <h3 className="text-lg font-semibold mb-4 text-[#257180]">{option.title}</h3>
                                <img src={option.image} alt={option.title} className="h-20 mx-auto mb-4" />
                                <p className="text-sm text-gray-600">{option.description}</p>
                            </label>
                        ))}
                    </div>

                    <div className="text-center mt-4">
                        <button type="submit" className="f-12 px-2 py-1 rounded bg-[#257180]" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default LeadsUpdateForm;
