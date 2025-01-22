import { useEffect, useState } from 'react';
import { Button, Form, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import "../App.css";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Create = ({ contractAddress, contractABI }) => {
  const [processing, setProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formInfo, setFormInfo] = useState({
    title: "",
    description: "",
    target: 0,
    deadline: 0,
    imageHash: "" // Replacing image URL with imageHash
  });

  const handleDateChange = (date) => {
    setSelectedDate(date);
    handleChange({
      target: {
        name: 'deadline',
        value: Math.floor(date.getTime() / 1000),
      },
    });
  };

  const tron = window.tronLink;
  const tronWeb = tron.tronWeb;

  useEffect(() => {
    document.title = "Create Campaign";
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormInfo((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const headers = {
      'Content-Type': 'multipart/form-data',
      pinata_api_key: "20a1ac93e10b67f081c5",
      pinata_secret_api_key: "2b3680b650e07a507c4df5a9649b9b6438d7f8e4c3cc0cfab22a73bb968d02d7",
    };

    try {
      const response = await axios.post(url, formData, { headers });
      setFormInfo((prevState) => ({
        ...prevState,
        imageHash: response.data.IpfsHash,
      }));
      toast.success('Image uploaded successfully', { position: "top-center" });
    } catch (error) {
      console.error("Image upload failed", error);
      toast.error('Failed to upload image', { position: "top-center" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formInfo.target <= 0) {
      toast.error('Target must be greater than 0', { position: "top-center" });
      return;
    }

    if (formInfo.deadline < Date.now() / 1000) {
      toast.error('Deadline must be a future date', { position: "top-center" });
      return;
    }

    if (!formInfo.imageHash) {
      toast.error('Please upload an image', { position: "top-center" });
      return;
    }

    setProcessing(true);

    try {
      const contract = await tronWeb.contract(contractABI, contractAddress);
      await contract.createCampaign(
        tronWeb.defaultAddress.base58,
        formInfo.title,
        formInfo.description,
        tronWeb.toSun(formInfo.target.toString()),
        formInfo.deadline,
        formInfo.imageHash // Using the IPFS hash
      ).send();

      toast.success("Campaign created successfully", { position: "top-center" });
      setFormInfo({
        title: "",
        description: "",
        target: 0,
        deadline: 0,
        imageHash: ""
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create campaign", { position: "top-center" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-gray-800 to-gray-900">
      <main className="container mx-auto px-6 py-8">
        <div className="bg-gray-800 shadow-lg rounded-lg p-6 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Campaign</h2>
          <Row className="g-4">
            <Form.Group className="mb-3">
              <Form.Label className="text-white">Upload Image</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                className="w-full p-3 my-2 bg-gray-700 text-white rounded-lg"
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
            <div>
              <label className="text-white mb-2 block">Target Amount</label>
              <Form.Control
                onChange={handleChange}
                name="target"
                required
                type="number"
                placeholder="Target Amount"
                className="w-full p-3 my-2 bg-gray-700 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="text-white mb-2 block">Deadline (Unix Timestamp)</label>
              <Form.Control
                onChange={handleChange}
                name="deadline"
                required
                type="number"
                placeholder="Deadline (Unix Timestamp)"
                className="w-full p-3 my-2 bg-gray-700 text-white rounded-lg"
              />
            </div>
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleSubmit}
                variant="primary"
                size="lg"
                disabled={processing}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
              >
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
