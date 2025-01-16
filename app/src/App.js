import './App.css';
import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Create from './components/Create.jsx';
import Home from './components/Home.jsx';
import contractData from './contracts/contractData.json';
import Nav from './components/Nav.jsx';

function App() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [marketplace, setMarketplace] = useState(null);
  const [connected, setConnected] = useState(false); 
  const [firstTime, setFirstTime] = useState(false); 

  const checkTronLink = async () => {
    try {
      if (window.tronLink && window.tronLink.tronWeb) {
        const acc = await window.tronLink.request({ method: 'tron_requestAccounts' });
        setAccount(acc.message);
        setConnected(true);
        setFirstTime(true);
        toast.success("Connected to TronLink successfully.", { position: "top-center" });
      } else {
        toast.error("TronLink not found. Please install TronLink extension.", { position: "top-center" });
      }
    } catch (error) {
      console.error("Error connecting to TronLink:", error);
      toast.error("Error connecting to TronLink. Please try again.", { position: "top-center" });
    }
  };

  const initiateContract = async () => {
    try {
      if (window.tronLink && window.tronLink.tronWeb) {
        const tronWeb = window.tronLink.tronWeb;
        const marketplaceContract = await tronWeb.contract(contractData.abi, contractData.address);
        setMarketplace(marketplaceContract);
        setLoading(false);
        toast.success("Contract initialized successfully.", { position: "top-center" });
      } else {
        toast.error("TronLink not available. Please connect TronLink.", { position: "top-center" });
      }
    } catch (error) {
      console.error("Error initiating contract:", error);
      toast.error("Error initiating contract. Please try again.", { position: "top-center" });
    }
  };

  useEffect(() => {
    if (account) {
      initiateContract();
    }
  }, [account]);

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
              <Route path='/create' element={<Create contractAddress={contractData.address} contractABI={contractData.abi} />} />
              <Route path='/' element={<Home contractAddress={contractData.address} contractABI={contractData.abi} />} />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
