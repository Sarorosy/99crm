import React, { useState , useRef} from 'react';
import { motion } from 'framer-motion';
import { CircleX } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../../../../components/CustomLoader';


const AddFollowupSetting = ({onClose, afterSave}) => {
    const [priorityName, setPriorityName] = useState('');
    const [settings, setSettings] = useState([{ days: '', contactBy: '' }]);
    const [posting, setposting] = useState(false);
    const formRef = useRef(null);
    
    const handleAddGroup = () => {
        setSettings([...settings, { days: '', contactBy: '' }]);
    };

    const handleRemoveGroup = (index) => {
        const updatedSettings = settings.filter((_, i) => i !== index);
        setSettings(updatedSettings);
    };

    const handleInputChange = (index, field, value) => {
        const updatedSettings = [...settings];
        updatedSettings[index][field] = value;
        setSettings(updatedSettings);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setposting(true);
        
        // Extract days and contactBy values as arrays
        const daysArray = settings.map(group => group.days).join(',');
        const contactByArray = settings.map(group => group.contactBy).join(',');
        

        const formData = new FormData();
        formData.append('priorityName', priorityName);
        formData.append('days', daysArray);          // Send comma-separated days
        formData.append('contactBy', contactByArray); // Send comma-separated contactBy
    
        try {
            // POST request to the API
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/createpriority', {
                method: 'POST',
                body: formData,
            });
    
            const data = await response.json();
    
            if (response.ok) {
                console.log('Success:', data);
                formRef.current.reset();
                toast.success("Priority added sucessfully")
                setTimeout(()=>{
                    onClose();
                    afterSave();
                })
            } else {
                console.error('Error:', data);
                toast.error("Error occured while creating")
            }
        } catch (error) {
            console.error('Error during API call:', error);
            toast.error("Error occured while creating")
        }finally{
           setposting(false)
        }
    };
    
      

    return (
        <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 right-0 h-full w-full bg-gray-100 shadow-lg z-50 overflow-y-auto p-6"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-gray-600 hover:text-red-600 transition-colors"
      >
        <CircleX size={32} />
      </button>

      <h2 className="text-xl font-bold mb-6 text-center">Add Follow-Up Setting</h2>

<div className='col-md-6 cent add'>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 p-4 bg-white border-t-2 rounded border-blue-400">
        {/* Priority Name */}
        <div>
        <div className='my-4'>
          <label htmlFor="priorityName" className="block text-gray-700 font-medium mb-2">
            Priority Name *
          </label>
          <input
            type="text"
            id="priorityName"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={priorityName}
            onChange={(e) => setPriorityName(e.target.value)}
            required
          />
        </div>

        {/* Dynamic Groups */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Follow-Up Settings *</label>
          {settings.map((group, index) => (
            <div key={index} className="flex items-center space-x-4 mb-2">
              {/* No. of Days */}
              <input
                type="number"
                placeholder="No. of Days"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={group.days}
                onChange={(e) => handleInputChange(index, 'days', e.target.value)}
                required
                min={1}
              />
              {/* Contact By */}
              <select
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={group.contactBy}
                onChange={(e) => handleInputChange(index, 'contactBy', e.target.value)}
                required
              >
                <option value="">Contact By</option>
                <option value="Phone">Phone</option>
                <option value="Email">Email</option>
                <option value="Chat">Chat</option>
              </select>
              {/* Add/Remove Buttons */}
              {settings.length > 1 && (
                <button
                  type="button"
                  className="text-red-600 hover:text-red-800 transition-colors text-xl"
                  onClick={() => handleRemoveGroup(index)}
                >
                  -
                </button>
              )}
              {index === settings.length - 1 && (
                <button
                  type="button"
                  className="text-green-600 hover:text-green-800 transition-colors text-xl"
                  onClick={handleAddGroup}
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>
        </div>
        {/* Submit Button */}
        <div className="text-end">
          <button
            type="submit"
            disabled={posting}
            className="px-2 py-1 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors"
          >
            {posting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form></div>

      {posting && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white px-6 py-3 rounded-lg shadow-lg text-center">
          <CustomLoader className='h-24' />
          <p className="mt-1 text-lg font-semibold">Saving your changes...</p>
        </div>
      </div>
      )}
      <ToastContainer />
    </motion.div>
    );
};

export default AddFollowupSetting;
