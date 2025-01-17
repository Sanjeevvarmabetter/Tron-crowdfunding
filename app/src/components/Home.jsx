import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Alert, Spinner, Form, ProgressBar } from 'react-bootstrap';
import { toast } from 'react-toastify';
import './Home.css';
function Home({ contractAddress, contractABI }) {
  const [campaigns, setCampaigns] = useState([]);
  const [donationAmount, setDonationAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tron = window.tronLink;
  const tronWeb = tron.tronWeb;

  const getCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const contract = await tronWeb.contract(contractABI, contractAddress);
      const allCampaigns = await contract.getCampaigns().call();
      setCampaigns(allCampaigns);
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

  const handleDonationChange = (event) => {
    setDonationAmount(event.target.value);
  };

  const donateToCampaign = async (campaignId) => {
    if (donationAmount <= 0 || isNaN(donationAmount)) {
      toast.error('Please enter a valid donation amount.', { position: 'top-center' });
      return;
    }

    try {
      const contract = await tronWeb.contract(contractABI, contractAddress);
      const amountInSun = tronWeb.toSun(donationAmount.toString());
      if (amountInSun === undefined || amountInSun === null) {
        throw new Error('Invalid donation amount.');
      }

      await contract.donateToCampaign(campaignId).send({ callValue: amountInSun });
      toast.success('Donation successful!', { position: 'top-center' });
      setDonationAmount(''); // Clear the input after successful donation
    } catch (error) {
      console.error("Error donating to campaign:", error);
      setError('Donation failed. Please try again.');
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
                {campaigns.map((campaign, index) => {
                  const collected = tronWeb.fromSun(campaign.amountCollected);
                  const target = tronWeb.fromSun(campaign.target);
                  const progress = calculateProgress(collected, target);
                  const isClosed = collected >= target;

                  return (
                    <Col key={index} className="d-flex align-items-stretch">
                      <div className="card custom-card">
                        <img
                          className="card-img-top"
                          src={campaign.image || "default_image_url.jpg"}
                          alt={campaign.title}
                        />
                        <div className="card-body">
                          <h5 className="card-title">{campaign.title}</h5>
                          <p className="card-text">{campaign.description}</p>
                          <p><strong>Target:</strong> {target} TRX</p>
                          <p><strong>Deadline:</strong> {new Date(campaign.deadline * 1000).toLocaleString()}</p>

                          {/* Progress Bar with "Campaign Closed" message if target is met */}
                          <ProgressBar 
                            now={isClosed ? 100 : progress} 
                            label={isClosed ? 'Campaign Closed' : `${Math.round(progress)}%`} 
                            variant={isClosed ? "danger" : "success"} 
                          />

                          <Form.Control
                            type="number"
                            placeholder="Enter donation amount"
                            value={donationAmount}
                            onChange={handleDonationChange}
                            className="mb-3"
                            disabled={isClosed} // Disable input when the campaign is closed
                          />
                          <Button
                            onClick={() => donateToCampaign(campaign.id)}
                            variant="primary"
                            aria-label={`Donate to ${campaign.title}`}
                            disabled={isClosed} // Disable donate button if the campaign is closed
                          >
                            {isClosed ? 'Closed' : 'Donate'}
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
