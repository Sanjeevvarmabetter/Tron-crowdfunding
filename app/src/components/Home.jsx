import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

function Home({ contractAddress, contractABI }) {
  const [campaigns, setCampaigns] = useState([]);
  const [donationAmount, setDonationAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  const tron = window.tronLink;
  const tronWeb = tron.tronWeb;

  const getCampaigns = async () => {
    try {
      const contract = await tronWeb.contract(contractABI, contractAddress);
      const allCampaigns = await contract.getCampaigns().call();
      setCampaigns(allCampaigns);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load campaigns.', { position: 'top-center' });
    }
  };

  useEffect(() => {
    getCampaigns();
  }, []);

  const handleDonationChange = (event) => {
    setDonationAmount(event.target.value);
  };

  const donateToCampaign = async (campaignId) => {
    if (donationAmount <= 0) {
      toast.error('Please enter a valid donation amount.', { position: 'top-center' });
      return;
    }

    try {
      const contract = await tronWeb.contract(contractABI, contractAddress);
      const amountInSun = tronWeb.toSun(donationAmount.toString());
      await contract.donateToCampaign(campaignId).send({ callValue: amountInSun });
      toast.success('Donation successful!', { position: 'top-center' });
    } catch (error) {
      console.error(error);
      toast.error('Donation failed. Please try again.', { position: 'top-center' });
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center">
      <main className="container mx-auto px-4">
        <div className="content text-white shadow-lg rounded-lg border-2 p-4 px-5 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600" style={{ marginTop: '120px' }}>
          <h2 className="text-2xl font-bold mb-4">Campaigns</h2>
          {loading ? (
            <p>Loading campaigns...</p>
          ) : (
            campaigns.map((campaign, index) => (
              <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-700">
                <h3 className="text-xl font-semibold">{campaign.title}</h3>
                <p>{campaign.description}</p>
                <p>Target: {tronWeb.fromSun(campaign.target)} TRX</p>
                <p>Deadline: {new Date(campaign.deadline * 1000).toLocaleString()}</p>
                <input
                  type="number"
                  className="mt-2"
                  placeholder="Enter donation amount"
                  onChange={handleDonationChange}
                />
                <button
                  className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
                  onClick={() => donateToCampaign(campaign.id)}
                >
                  Donate
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;
