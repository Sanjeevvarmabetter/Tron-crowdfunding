import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Alert, Spinner, Form, ProgressBar } from 'react-bootstrap';
import { toast } from 'react-toastify';
import './Home.css';

function Home({ contractAddress, contractABI }) {
  const [campaigns, setCampaigns] = useState([]);
  const [donationAmounts, setDonationAmounts] = useState({});  // Changed to object to track multiple inputs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const tron = window.tronLink;
      const tronWeb = tron.tronWeb;
      const contract = await tronWeb.contract(contractABI, contractAddress);
      const allCampaigns = await contract.getCampaigns().call();
      
      // Add index as id to each campaign
      const campaignsWithIds = allCampaigns.map((campaign, index) => ({
        ...campaign,
        id: index
      }));
      
      setCampaigns(campaignsWithIds);
    } catch (error) {
      console.error("Error loading campaigns:", error);
      setError('Failed to load campaigns. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCampaigns();
  }, []);

  const handleDonationChange = (campaignId, value) => {
    setDonationAmounts(prev => ({
      ...prev,
      [campaignId]: value
    }));
  };

  const donateToCampaign = async (campaignId) => {
    const donationAmount = donationAmounts[campaignId];
    const parsedAmount = parseFloat(donationAmount);

    if (!parsedAmount || parsedAmount <= 0 || isNaN(parsedAmount)) {
      toast.error('Please enter a valid donation amount.', { position: 'top-center' });
      return;
    }

    try {
      const tron = window.tronLink;
      if (!tron?.tronWeb) {
        throw new Error('TronLink not found. Please make sure TronLink is installed and connected.');
      }

      const tronWeb = tron.tronWeb;
      const contract = await tronWeb.contract(contractABI, contractAddress);
      
      // Convert donation amount to SUN
      const amountInSun = tronWeb.toSun(parsedAmount);

      // Send transaction
      const tx = await contract.donateToCampaign(campaignId).send({
        callValue: amountInSun,
        shouldPollResponse: true
      });

      console.log('Transaction:', tx);
      toast.success('Donation successful!', { position: 'top-center' });
      
      // Clear only the specific campaign's donation amount
      setDonationAmounts(prev => ({
        ...prev,
        [campaignId]: ''
      }));
        
      // Refresh campaigns to update amounts
      await getCampaigns();

    } catch (error) {
      console.error("Error donating to campaign:", error);
      toast.error(
        `Donation failed. ${error.message || 'Please try again.'}`, 
        { position: 'top-center' }
      );
    }
  };

  // Function to calculate progress percentage
  const calculateProgress = (collected, target) => {
    return (collected / target) * 100;
  };

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <h2 className="text-center mb-4">Campaigns</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {loading ? (
              <div className="text-center mt-5">
                <Spinner animation="border" />
                <p>Loading campaigns...</p>
              </div>
            ) : (
              <Row xs={1} md={2} lg={3} className="g-4">
           {campaigns.map((campaign) => {
  const tronWeb = window.tronLink.tronWeb;
  const collected = tronWeb.fromSun(campaign.amountCollected);
  const target = tronWeb.fromSun(campaign.target);
  const progress = calculateProgress(collected, target);
  const isClosed = collected >= target;
                  return (
                    <Col key={campaign.id} className="d-flex align-items-stretch">
                   <div className="card custom-card">
        <img
          className="card-img-top"
          src={campaign.image}
          alt={campaign.title}
          style={{
            height: '200px',  // Set a fixed height
            objectFit: 'cover', // Maintain aspect ratio
            width: '100%'
          }}
        />
                        <div className="card-body">
                          <h5 className="card-title">{campaign.title}</h5>
                          <p className="card-text">{campaign.description}</p>
                          <p><strong>Target:</strong> {target} TRX</p>
                          <p><strong>Collected:</strong> {collected} TRX</p>
                          <p><strong>Deadline:</strong> {new Date(campaign.deadline * 1000).toLocaleString()}</p>

                          <ProgressBar 
                            now={isClosed ? 100 : progress} 
                            label={isClosed ? 'Campaign Closed' : `${Math.round(progress)}%`} 
                            variant={isClosed ? "danger" : "success"} 
                          />

                          <Form.Control
                            type="number"
                            placeholder="Enter donation amount"
                            value={donationAmounts[campaign.id] || ''}
                            onChange={(e) => handleDonationChange(campaign.id, e.target.value)}
                            className="mb-3 mt-3"
                            disabled={isClosed}
                            min="0"
                            step="0.1"
                          />
                          <Button
                            onClick={() => donateToCampaign(campaign.id)}
                            variant="primary"
                            className="w-100"
                            disabled={isClosed || !donationAmounts[campaign.id]} 
                          >
                            {isClosed ? 'Campaign Closed' : 'Donate'}
                          </Button>
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;