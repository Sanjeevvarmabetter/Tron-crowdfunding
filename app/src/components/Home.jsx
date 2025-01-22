import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Alert, Spinner, Form, ProgressBar } from 'react-bootstrap';
import { toast } from 'react-toastify';
import './Home.css';

function Home({ contractAddress, contractABI }) {
  const [openCampaigns, setOpenCampaigns] = useState([]);
  const [donationAmounts, setDonationAmounts] = useState({}); 
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
      const currentTime = Math.floor(Date.now() / 1000);
      
      const campaignsWithIds = allCampaigns.map((campaign, index) => ({
        ...campaign,
        id: index
      }));
      
      const open = campaignsWithIds.filter(campaign => {
        const collected = tronWeb.fromSun(campaign.amountCollected);
        const target = tronWeb.fromSun(campaign.target);
        return collected < target && campaign.deadline > currentTime;
      });

      setOpenCampaigns(open);
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
      
      const amountInSun = tronWeb.toSun(parsedAmount);

      const tx = await contract.donateToCampaign(campaignId).send({
        callValue: amountInSun,
        shouldPollResponse: true
      });

      toast.success('Donation successful!', { position: 'top-center' });
      getCampaigns();
      setDonationAmounts(prev => ({
        ...prev,
        [campaignId]: ''
      }));

    } catch (error) {
      console.error("Error donating to campaign:", error);
      toast.error(`Donation failed. ${error.message || 'Please try again.'}`, { position: 'top-center' });
    }
  };

  const calculateProgress = (collected, target) => {
    return (collected / target) * 100;
  };

  const getPinataUrl = (hash) => {
    if (!hash) return 'https://via.placeholder.com/200x200?text=No+Image';
    // Using Pinata gateway
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  };

  const renderCampaigns = (campaigns, isClosed) => (
    <Row xs={1} md={2} lg={3} className="g-4">
      {campaigns.map((campaign) => {
        const tronWeb = window.tronLink.tronWeb;
        const collected = tronWeb.fromSun(campaign.amountCollected);
        const target = tronWeb.fromSun(campaign.target);
        const progress = calculateProgress(collected, target);

        return (
          <Col key={campaign.id} className="d-flex align-items-stretch">
            <div className="card custom-card">
              <img
                className="card-img-top"
                src={getPinataUrl(campaign.image)} // Using campaign.image as that's how it's stored in the contract
                alt={campaign.title}
                style={{
                  height: '200px',
                  objectFit: 'cover',
                  width: '100%',
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/200x200?text=Error+Loading+Image';
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
                  variant={isClosed ? 'danger' : 'success'}
                />
  
                {!isClosed && (
                  <>
                    <Form.Control
                      type="number"
                      placeholder="Enter donation amount"
                      value={donationAmounts[campaign.id] || ''}
                      onChange={(e) => handleDonationChange(campaign.id, e.target.value)}
                      className="mb-3 mt-3"
                      min="0"
                      step="0.1"
                    />
                    <Button
                      onClick={() => donateToCampaign(campaign.id)}
                      variant="primary"
                      className="w-100"
                      disabled={!donationAmounts[campaign.id]}
                    >
                      Donate
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Col>
        );
      })}
    </Row>
  );
  
  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <h2 className="text-center mb-4">Open Campaigns</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {loading ? (
              <div className="text-center mt-5">
                <Spinner animation="border" />
                <p>Loading campaigns...</p>
              </div>
            ) : (
              renderCampaigns(openCampaigns, false)
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;