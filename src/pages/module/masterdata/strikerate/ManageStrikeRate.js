import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ManageStrikeRate = () => {
  const [divisions, setDivisions] = useState('');
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStrikeRateRules = async () => {
    try {
      setLoading(true);
      const payload = {
        user_id: sessionStorage.getItem('id'),
        user_type: sessionStorage.getItem('user_type'),
      };

      const response = await axios.post(
        'https://99crm.phdconsulting.in/zend/api/manage-strike-rate',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.status) {
        const parsedRules = (response.data.rules || []).map((rule) => ({
          min_strike_rate: rule.min_strike_rate,
          max_strike_rate: rule.max_strike_rate,
          query_limit: rule.query_limit ?? '',
          no_limit: rule.query_limit === null,
        }));
        setRules(parsedRules);
      } else {
        toast.error('Failed to fetch strike rate rules');
      }
    } catch (error) {
      toast.error(error.message || 'Error fetching CRM strike rate rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrikeRateRules();
  }, []);

  const generateDivisions = () => {
    const count = parseInt(divisions);
    if (!count || count <= 0 || count > 100) {
      alert('Enter a valid number between 1 and 100');
      return;
    }

    const step = 100 / count;
    const newRules = [];

    for (let i = 0; i < count; i++) {
      newRules.push({
        min_strike_rate: (step * i).toFixed(2),
        max_strike_rate: (step * (i + 1)).toFixed(2),
        query_limit: '',
        no_limit: false,
      });
    }

    setRules(newRules);
  };

  const handleChange = (index, field, value) => {
    const updated = [...rules];
    updated[index][field] = value;

    // Auto-update next row's min
    if (field === 'max_strike_rate' && index < rules.length - 1) {
      updated[index + 1].min_strike_rate = parseFloat(value || 0).toFixed(2);
    }

    setRules(updated);
  };

  const handleCheckbox = (index) => {
    const updated = [...rules];
    updated[index].no_limit = !updated[index].no_limit;
    if (updated[index].no_limit) {
      updated[index].query_limit = '';
    }
    setRules(updated);
  };

  const validateAndSubmit = async () => {
    let isValid = true;
    let errorMsg = '';

    for (let i = 0; i < rules.length; i++) {
      const { min_strike_rate, max_strike_rate, query_limit, no_limit } = rules[i];

     if (!no_limit && (query_limit === '' || query_limit === null || query_limit === undefined || isNaN(query_limit))){
        errorMsg += `Row ${i + 1}: Query limit required.\n`;
        isValid = false;
         toast.error(errorMsg);
      return;
      }
      if (parseFloat(min_strike_rate) >= parseFloat(max_strike_rate)) {
        errorMsg += `Row ${i + 1}: Max rate must be greater than Min rate.\n`;
        isValid = false;
         toast.error(errorMsg);
      return;
      }
      if (i === rules.length - 1 && parseFloat(max_strike_rate) > 100) {
        errorMsg += `Row ${i + 1}: Final Max rate cannot exceed 100%.\n`;
        isValid = false;
         toast.error(errorMsg);
        return;
      }
    }

    if (!isValid) {
      toast.error(errorMsg);
      return;
    }

    try {
      const payload = {
        user_id: sessionStorage.getItem('id'),
        user_type: sessionStorage.getItem('user_type'),
        rules: rules.map((r) => ({
          min_rate: r.min_strike_rate,
          max_rate: r.max_strike_rate,
          query_limit: r.no_limit ? null : r.query_limit,
        })),
      };

      const response = await axios.post(
        'https://99crm.phdconsulting.in/zend/api/save-rules',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.status) {
        toast.success('Rules saved successfully!');
        fetchStrikeRateRules();
      } else {
        toast.error('Failed to save rules');
      }
    } catch (error) {
      toast.error('Error saving rules');
    }
  };

  return (
    <div className="container bg-gray-100 w-full p-4">
      <h1 className="text-xl font-bold mb-4">CRM Strike Rate Rules</h1>

      <div className="flex items-center space-x-2 mb-4">
        <input
          type="number"
          min="1"
          max="100"
          className="border px-3 py-1 rounded w-64"
          placeholder="Enter number of divisions"
          value={divisions}
          onChange={(e) => setDivisions(e.target.value)}
        />
        <button
          onClick={generateDivisions}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Generate
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full table-auto border text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-3 py-2 border">#</th>
              <th className="px-3 py-2 border">Min Rate (%)</th>
              <th className="px-3 py-2 border">Max Rate (%)</th>
              <th className="px-3 py-2 border">Query Limit</th>
            </tr>
          </thead>
          <tbody>
            {rules.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-400">
                  No rules found. Use the generator above to add.
                </td>
              </tr>
            ) : (
              rules.map((row, index) => (
                <tr key={index} className="text-center">
                  <td className="border px-2 py-1">{index + 1}</td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="form-input w-20 text-center border rounded px-1"
                      readOnly
                      value={row.min_strike_rate}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      step="0.01"
                      className="form-input w-24 text-center border rounded px-1"
                      value={row.max_strike_rate}
                      onChange={(e) =>
                        handleChange(index, 'max_strike_rate', e.target.value)
                      }
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="number"
                        className="form-input w-24 text-center border rounded px-1"
                        disabled={row.no_limit}
                        value={row.no_limit ? '' : row.query_limit}
                        onChange={(e) =>
                          handleChange(index, 'query_limit', e.target.value)
                        }
                      />
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={row.no_limit}
                          onChange={() => handleCheckbox(index)}
                        />
                        No Limit
                      </label>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-right mt-4">
        <button
          onClick={validateAndSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Save Rules
        </button>
      </div>
    </div>
  );
};

export default ManageStrikeRate;
