import React, { useEffect, useState } from 'react';
import TableWithButtons from './components/TableWithButtons';
import Button from './components/Button';
import './App.css'

const App = () => {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = async (page = 1) => {
    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:5000/scrape-jwt/${page}`);
      if (response.ok) {
        const result = await response.json();
        console.log('Fetched data:', result);
        setData(result.data.rowData);
        setCount(result.data.lastRow);
      } else {
        console.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }finally{
      setIsLoading(false)
    }
  };

  const handleDeleteToken = async () => {
    try {
      const response = await fetch('http://localhost:5000/delete-token', { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        console.log('Auth token deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting token:', error);
    }
  };

  // useEffect(() => {
  //   fetchData();
  // }, []);

  return (
    <>
      <div className="fixed top-4 right-4 flex space-x-4 z-10">
        <Button label="Fetch Data" color="primary" onClick={() => fetchData(1)} />
        <Button label="Delete Auth Token" onClick={handleDeleteToken} />
      </div>

      {/* Table Component, taking full width below buttons */}
      <div className="h-screen flex justify-center items-center px-4">
        <div className="w-full max-w-screen-xl ">
          <TableWithButtons data={data} count={count} fetchData={fetchData} isLoading={isLoading}/>
        </div></div>
    </>
  );
};

export default App;
