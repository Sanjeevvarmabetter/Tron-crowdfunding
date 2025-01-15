import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

function Home({ contractAddress, contractABI}) {
  const [campaigns, setCampaigns] = useState([]);
  const [donationAmount, setDonationAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const tron = window.tronLink;
  const tronWeb = tron.tronLink;
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
    //   const tronWeb = window.tronLink.tronWeb;
      const contract = await tronWeb.contract(contractABI, contractAddress);
      const amountInSun = tronWeb.toSun(donationAmount.toString());
      await contract.donateToCampaign(campaignId).send({ callValue: amountInSun });

      toast.success(`Successfully donated ${donationAmount} TRX!`, { position: 'top-center' });
      setDonationAmount(0); // Clear donation input
    } catch (error) {
      console.error(error);
      toast.error('Donation failed. Please try again.', { position: 'top-center' });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-6">Crowdfunding Campaigns</h2>
      {loading ? (
        <p className="text-center">Loading campaigns...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign, idx) => (
            <div key={idx} className="bg-white shadow-lg rounded-lg p-4">
              <h3 className="text-xl font-bold">{campaign.title}</h3>
              <p>{campaign.description}</p>
              <p>Target: {tronWeb.fromSun(campaign.target.toString())} TRX</p>
              <p>Deadline: {new Date(campaign.deadline * 1000).toLocaleString()}</p>
              <input type="number" value={donationAmount} onChange={handleDonationChange} placeholder="Donation Amount (TRX)" />
              <button onClick={() => donateToCampaign(idx)} className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2">Donate</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
