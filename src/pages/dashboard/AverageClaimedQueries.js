import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AverageClaimedQueries = ({ websiteId , onClose}) => {
  const [data, setData] = useState({
    websiteInfo: {},
    QueryUsers: [],
    claimedData: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post('https://99crm.phdconsulting.in/api/averageclaimedqueries', {
          user_id: '1',
          user_type: 'admin',
          team_id: '',
          website: websiteId,
        });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching the data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [websiteId]);

  const hoursAndMins = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const { websiteInfo, QueryUsers, claimedData } = data;

  return (
    <div className="col-md-12">
      {loading ? (
        <table className="w-3/5 mx-auto my-3 bg-white shadow-md rounded-lg overflow-hidden text-sm animate-pulse">
          <thead>
            <tr className="bg-blue-50/50">
              <th colSpan="3" className="px-4 py-2">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-6 w-12 bg-gray-200 rounded"></div>
                </div>
              </th>
            </tr>
            
          </thead>
          <tbody>
            
          </tbody>
        </table>
      ) : (
        <table className="w-3/5 mx-auto my-3 bg-white shadow-md rounded-lg overflow-hidden text-sm">
          <thead>
            <tr className="bg-blue-50">
              <th colSpan={QueryUsers.length !== 0 ? 3 : 2} className="px-4 py-2">
                <div className="flex justify-between items-center">
                  <div>
                    Box Queries Received Total : {QueryUsers.length}
                    <span className="text-xs ml-2 text-gray-600">
                      ({new Date(Date.now() - 86400000).toLocaleDateString()} - {new Date().toLocaleDateString()}) {websiteInfo.website}
                    </span>
                  </div>
                  <button 
                    onClick={onClose}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Hide
                  </button>
                </div>
              </th>
            </tr>
            {claimedData.length > 0 && (
              <tr className="bg-gray-50">
                <th className="px-4 py-2 font-medium">CRM Name</th>
                <th className="px-4 py-2 font-medium">Total Claimed Queries</th>
                <th className="px-4 py-2 font-medium">Average Time</th>
              </tr>
            )}
          </thead>
          <tbody>
            {claimedData.map((data, index) => (
              <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2">{data.userName}</td>
                <td className="px-4 py-2 text-center">{data.totalClaimed}</td>
                <td className="px-4 py-2 text-center">{hoursAndMins(data.totalMinuts)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AverageClaimedQueries;
