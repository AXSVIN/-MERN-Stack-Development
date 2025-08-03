import React, { useEffect, useState } from 'react';
import { Github, Instagram, Linkedin, User, LogOut } from 'lucide-react';



const PortfolioTable = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPortfolio = async () => {
    try {
      const response = await fetch('http://localhost:5000/portfolio');
      const data = await response.json();
      setPortfolio(data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };




  

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredPortfolio = portfolio.filter((stock) =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '16px', backgroundColor: 'black', minHeight: '100vh', color: '#d1d5db' }}>
      {/* Internal CSS */}
      <style>
        {`
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            flex-wrap: wrap;
            gap: 16px;
          }
          .icon-container {
            display: flex;
            gap: 16px;
          }
          .icon-button {
            padding: 8px;
            border-radius: 50%;
            background-color: #1f2937;
            transition: background-color 0.3s ease;
          }
          .icon-button:hover {
            background-color: #374151;
          }
          .search-input {
            padding: 8px;
            width: 320px;
            border-radius: 4px;
            background-color: #1f2937;
            color: white;
            border: 1px solid #4b5563;
          }
          .search-input:focus {
            outline: none;
            box-shadow: 0 0 0 2px #3b82f6;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }
          th, td {
            border: 1px solid #374151;
            padding: 8px;
            text-align: center;
          }
          th {
            background-color: black;
            color: white;
            position: sticky;
            top: 0;
            z-index: 10;
          }
          tbody tr {
            background-color: black;
            transition: background-color 0.3s ease;
          }
          tbody tr:hover {
            background-color: #374151;
          }
          .green {
            color: #34d399;
            font-weight: bold;
          }
          .red {
            color: #f87171;
            font-weight: bold;
          }
          .no-data {
            text-align: center;
            color: #9ca3af;
            padding: 16px;
          }
        `}
      </style>

      {/* Header Section */}
      <div className="header">
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#f1f5f9' }}>📈 PORTFOLIO</h1>

        <div className="icon-container">
          <a href="https://github.com/AXSVIN" target="_blank" rel="noopener noreferrer">
            <div className="icon-button">
              <Github color="#d1d5db" size={24} />
            </div>
          </a>
          <a href="https://www.instagram.com/axxsvin?utm_source=qr&igsh=aGQ3bG1oYXRrYzdq" target="_blank" rel="noopener noreferrer">
            <div className="icon-button">
              <Instagram color="#d1d5db" size={24} />
            </div>
          </a>
          <a href="https://www.linkedin.com/in/ashwin-raja-m-6baa351a8/" target="_blank" rel="noopener noreferrer">
            <div className="icon-button">
              <Linkedin color="#d1d5db" size={24} />
            </div>
          </a>
          <a href="dashborad" target="_blank" rel="noopener noreferrer"> 
            <div className="icon-button">
              <User color="#d1d5db" size={24} />
            </div>
          </a>
           <a href="login" target="_blank" rel="noopener noreferrer">
            <div className="icon-button">
              <LogOut color="#d1d5db" size={24} />
            </div>
          </a>
        </div>

        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Portfolio Table */}
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Particulars</th>
              <th>Purchase Price</th>
              <th>Quantity (Qty)</th>
              <th>Investment</th>
              <th>Portfolio %</th>
              <th>NSE/BSE</th>
              <th>CMP</th>
              <th>Present Value</th>
              <th>Gain/Loss</th>
              <th>P/E Ratio</th>
            </tr>
          </thead>
          <tbody>
            {filteredPortfolio.length > 0 ? (
              filteredPortfolio.map((stock, index) => (
                <tr key={index}>
                  <td>{stock.symbol}</td>
                  <td>{stock.purchase_price.toFixed(2)}</td>
                  <td>{stock.qty}</td>
                  <td>{stock.total_invested.toFixed(2)}</td>
                  <td className={stock.portfolio_percent >= 0 ? 'green' : 'red'}>
                    {stock.portfolio_percent.toFixed(2)}%
                  </td>
                  <td>{stock.exchange}</td>
                  <td>{stock.cmp.toFixed(2)}</td>
                  <td>{stock.total_value.toFixed(2)}</td>
                  <td className={stock.profit_or_loss >= 0 ? 'green' : 'red'}>
                    {stock.profit_or_loss.toFixed(2)}
                  </td>
                  <td>{stock.pe_ratio}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="no-data">No matching stocks found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioTable;
