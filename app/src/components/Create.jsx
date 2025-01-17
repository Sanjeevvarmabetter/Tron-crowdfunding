import { useEffect, useState } from 'react';
import { Button, Form, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import "../App.css";

const Create = ({ contractAddress, contractABI }) => {
  const [processing, setProcessing] = useState(false);
  const [formInfo, setFormInfo] = useState({
    title: "",
    description: "",
    target: 0,
    deadline: 0,
    image: "" // Added image URL field
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

    if (!formInfo.image) {
      toast.error('Please provide an image URL', { position: "top-center" });
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
        formInfo.image // Using the image URL directly
      ).send();
      
      toast.success("Campaign created successfully", { position: "top-center" });
      // Clear form after success
      setFormInfo({
        title: "",
        description: "",
        target: 0,
        deadline: 0,
        image: ""
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
        <Form.Control
          onChange={handleChange}
          name="image"
          required
          type="text"
          placeholder="Image URL"
          value={formInfo.image}
          className="w-full p-3 my-2 bg-gray-700 text-white rounded-lg"
        />
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