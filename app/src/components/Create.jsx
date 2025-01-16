import { useEffect, useState } from 'react';
import { Button, Form, Row } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import "../App.css";

const Create = ({ contractAddress, contractABI }) => {
  const [processing, setProcessing] = useState(false);
  const [nftImage, setNFTImage] = useState(null);
  const [formInfo, setFormInfo] = useState({
    title: "",
    description: "",
    target: 0,
    deadline: 0,
  });

  const tron = window.tronLink;
  const tronWeb = tron.tronWeb;

  useEffect(() => {
    document.title = "Create Campaign";
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormInfo((prevState) => ({ ...prevState, [name]: value }));
  };

  const changeHandler = (event) => {
    if (event.target.files && event.target.files[0]) {
      setNFTImage(event.target.files[0]);
    }
  };

  const handleEvent = async (e) => {
    e.preventDefault();

    if (formInfo.target <= 0) {
      toast.error('Target must be greater than 0', { position: "top-center" });
      return;
    }

    if (formInfo.deadline < Date.now() / 1000) {
      toast.error('Deadline must be a future date', { position: "top-center" });
      return;
    }

    setProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', nftImage);

      const resFile = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
          pinata_api_key: `20a1ac93e10b67f081c5`,
          pinata_secret_api_key: `2b3680b650e07a507c4df5a9649b9b6438d7f8e4c3cc0cfab22a73bb968d02d7`,
          "Content-Type": "multipart/form-data",
        },
      });

      const ImgHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
      const info = { ...formInfo, image: ImgHash };

      const resJson = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', info, {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: `20a1ac93e10b67f081c5`,
          pinata_secret_api_key: `2b3680b650e07a507c4df5a9649b9b6438d7f8e4c3cc0cfab22a73bb968d02d7`,
        },
      });

      createCampaign(`https://gateway.pinata.cloud/ipfs/${resJson.data.IpfsHash}`);
    } catch (error) {
      console.error(error);
      toast.error("Error creating campaign", { position: "top-center" });
    }

    setProcessing(false);
  };

  const createCampaign = async (meta) => {
    try {
      const contract = await tronWeb.contract(contractABI, contractAddress);
      await contract.createCampaign(
        tronWeb.defaultAddress.base58,
        formInfo.title,
        formInfo.description,
        tronWeb.toSun(formInfo.target.toString()),
        formInfo.deadline,
        meta
      ).send();
      toast.success("Campaign created successfully", { position: "top-center" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create campaign", { position: "top-center" });
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-gray-800 to-gray-900">
      <main className="container mx-auto px-6 py-8">
        <div className="bg-gray-800 shadow-lg rounded-lg p-6 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Campaign</h2>
          <Row className="g-4">
            <Form.Group className="w-full">
              <Form.Label className="text-lg text-white">Upload Image</Form.Label>
              <Form.Control
                type="file"
                required
                name="image"
                accept="image/*"
                onChange={changeHandler}
                className="bg-gray-700 text-white"
              />
            </Form.Group>

            <Form.Control
              onChange={handleChange}
              name="title"
              required
              type="text"
              placeholder="Title"
              className="w-full p-3 my-2 bg-gray-700 text-white rounded-lg"
            />
            <Form.Control
              onChange={handleChange}
              name="description"
              required
              as="textarea"
              placeholder="Description"
              className="w-full p-3 my-2 bg-gray-700 text-white rounded-lg"
            />
            <Form.Control
              onChange={handleChange}
              name="target"
              required
              type="number"
              placeholder="Target Amount"
              className="w-full p-3 my-2 bg-gray-700 text-white rounded-lg"
            />
            <Form.Control
              onChange={handleChange}
              name="deadline"
              required
              type="number"
              placeholder="Deadline (Unix Timestamp)"
              className="w-full p-3 my-2 bg-gray-700 text-white rounded-lg"
            />

            <div className="flex justify-center mt-6">
              <Button onClick={handleEvent} variant="primary" size="lg" disabled={processing} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500">
                {processing ? 'Creating...' : 'Create Campaign'}
              </Button>
            </div>
          </Row>
        </div>
      </main>
    </div>
  );
}

export default Create;
