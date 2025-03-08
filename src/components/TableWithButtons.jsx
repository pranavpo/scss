import React, { useEffect, useState } from 'react';

const TableWithButtons = ({ data, count, fetchData, isLoading }) => {
  const itemsPerPage = 5;
  const totalPages = Math.ceil(count / itemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageClick = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await fetchData(pageNumber);
  };

  return (
    <div className="w-full max-w-screen-xl">
      {/* Table */}
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b text-center text-green-500">Name</th>
            <th className="px-4 py-2 border-b text-center text-green-500">Date of Birth</th>
            <th className="px-4 py-2 border-b text-center text-green-500">Email</th>
          </tr>
        </thead>
        <tbody>
          {/* Loop through the data and create table rows */}
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2 border-b">{item.fullName}</td>
                <td className="px-4 py-2 border-b">{item.dateOfBirth}</td>
                <td className="px-4 py-2 border-b">{item.email || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr>

              {isLoading ? <td colSpan="3" className="px-4 py-2 border-b text-center">Loading....</td> : <td colSpan="3" className="px-4 py-2 border-b text-center">Please Run Fetch Data</td>}
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={`px-3 py-1 border rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            onClick={() => handlePageClick(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TableWithButtons;
