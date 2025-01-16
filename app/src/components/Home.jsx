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
    const value = event.target.value;
    // Ensure the value is a valid number, else set it to 0
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      setDonationAmount(parsedValue);
    }
  };

  const donateToCampaign = async (campaignId) => {
    if (donationAmount <= 0 || isNaN(donationAmount)) {
      toast.error('Please enter a valid donation amount.', { position: 'top-center' });
      return;
    }

    try {
      const contract = await tronWeb.contract(contractABI, contractAddress);
      // Convert donationAmount to Sun (1 TRX = 1,000,000 Sun)
      const amountInSun = tronWeb.toSun(donationAmount.toString());
      if (amountInSun === undefined || amountInSun === null) {
        throw new Error('Invalid donation amount.');
      }

      // Send the donation amount as `callValue`
      await contract.donateToCampaign(campaignId).send({ callValue: amountInSun });
      toast.success('Donation successful!', { position: 'top-center' });
    } catch (error) {
      console.error(error);
      toast.error('Donation failed. Please try again.', { position: 'top-center' });
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-gray-800 to-gray-900">
      <main className="container mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Campaigns</h2>
        {loading ? (
          <p className="text-white text-center">Loading campaigns...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign, index) => (
              <div key={index} className="bg-gray-700 p-6 border-2 border-gray-600 rounded-lg">
                <img 
                  src={campaign.imageUrl || "default_image_url.jpg"} 
                  alt={campaign.title} 
                  className="w-full h-48 object-cover mb-4 rounded-md"
                  style={{ objectFit: 'cover', height: '200px' }} // Adjust height and fit
                />
                <h3 className="text-2xl font-semibold text-white mb-2">{campaign.title}</h3>
                <p className="text-gray-300 mb-2">{campaign.description}</p>
                <p className="text-gray-300 mb-2">Target: {tronWeb.fromSun(campaign.target)} TRX</p>
                <p className="text-gray-300 mb-4">Deadline: {new Date(campaign.deadline * 1000).toLocaleString()}</p>
                <input
                  type="number"
                  className="w-full p-3 mb-4 bg-gray-600 text-white rounded-lg"
                  placeholder="Enter donation amount"
                  onChange={handleDonationChange}
                />
                <button
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                  onClick={() => donateToCampaign(campaign.id)}
                >
                  Donate
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
