import './App.css';
import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Create from './components/Create.jsx';
import Home from './components/Home.jsx';
import Closed from './components/Closed.jsx';
import contractData from './contracts/contractData.json';
import Nav from './components/Nav.jsx';

function App() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [marketplace, setMarketplace] = useState(null);
  const [connected, setConnected] = useState(false);
  const [firstTime, setFirstTime] = useState(false);

  // Function to check if TronLink is available and to request accounts
  const checkTronLink = async () => {
    try {
      const tron = window.tronLink;
      const tronWeb = tron.tronWeb;
      setConnected(true); // Changed connecteds to connected
      console.log("Inside checkTronLink");

      const acc = await window.tronLink.request({ method: 'tron_requestAccounts' });
      console.log("acc msg: ", acc.message);

      setAccount(acc);
      setFirstTime(true); // Ensure you're setting the firstTime state correctly
      console.log("This is ACC", acc);
    } catch (error) {
      console.error("Error connecting to TronLink:", error);
    }
  };

  const checkAccount = async () => {
    if (!account) {
      console.log("Check running inside checkAccount");
      await checkTronLink();
    }
  };

  useEffect(() => {
    if (account !== null) {
      initiateContract();
      console.log("Instead of initContract");
    }
  }, [account]);

  const initiateContract = async () => {
    try {
      const tron = window.tronLink;
      const tronWeb = tron.tronWeb;
      let marketplaceContract = await tronWeb.contract(contractData.abi, contractData.address);
      setMarketplace(marketplaceContract);
      setLoading(false);
    } catch (error) {
      console.error("Error connecting to TronLink:", error);
    }
  };
  return (
    <BrowserRouter>
      <ToastContainer />
      <div className="App font-jersey-25">
        <div className="gradient-bg-welcome">
          <Nav account={account} checkTronLink={checkTronLink} loading={loading} />
          {loading && !firstTime ? (
            <div>Loading...</div>
          ) : (
            <Routes>
              <Route
                path='/create'
                element={<Create contractAddress={contractData.address} contractABI={contractData.abi} />}
              />
              <Route
                path='/' // open campaigns route
                element={<Home contractAddress={contractData.address} contractABI={contractData.abi} />}
              />
              <Route
                path='/closed' // closed or completed campaigns route
                element={<Closed contractAddress={contractData.address} contractABI={contractData.abi} />}
              />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;