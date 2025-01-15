import { useEffect, useState } from 'react'
import { Button, Form, Row } from 'react-bootstrap'
import axios from 'axios'
import { toast } from 'react-toastify'

const Create = ({ contractAddress, contractABI }) => {

  const [processing, setProcessing] = useState(false);
  const [nftImage, setNFTImage] = useState();
  const [formInfo, setFormInfo] = useState({
    title: "",
    description: "",
    target: 0,
    deadline: 0,
  });

  const tron = window.tronLink;
  const tronWeb = tron.tronWeb;

  useEffect(() => {
    document.title = "Create Campaign"
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormInfo((prevState) => ({ ...prevState, [name]: value }));
  };

  const changeHandler = (event, fileType) => {
    if (event.target.files && event.target.files[0]) {
      if (fileType === 'image') {
        setNFTImage(event.target.files[0]);
      }
    }
  };

  const handleEvent = async (e) => {
    e.preventDefault();

    if (formInfo.target <= 0) {
      toast.error('Target must be greater than 0', {
        position: "top-center"
      });
      return;
    }

    if (formInfo.deadline < Date.now() / 1000) {
      toast.error('Deadline must be a future date', {
        position: "top-center"
      });
      return;
    }

    setProcessing(true);

    const formData = new FormData();
    const jsonFormData = new FormData();
    formData.append('file', nftImage);

    const metadata = JSON.stringify({
      name: formInfo.title,
      description: formInfo.description
    });
    jsonFormData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    jsonFormData.append('pinataOptions', options);

    try {
      const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
          pinata_api_key: `20a1ac93e10b67f081c5`,
          pinata_secret_api_key: `2b3680b650e07a507c4df5a9649b9b6438d7f8e4c3cc0cfab22a73bb968d02d7`,
          "Content-Type": "multipart/form-data",
        },
      });

      const ImgHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;

      const info = {
        title: formInfo.title,
        description: formInfo.description,
        image: ImgHash,
        target: formInfo.target,
        deadline: formInfo.deadline,
      };

      const pinJsonToPinata = async (info) => {
        const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
        const headers = {
          'Content-Type': 'application/json',
          'pinata_api_key': `20a1ac93e10b67f081c5`,
          'pinata_secret_api_key': `2b3680b650e07a507c4df5a9649b9b6438d7f8e4c3cc0cfab22a73bb968d02d7`,
        };

        try {
          const res = await axios.post(url, info, { headers });
          const meta = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
          createCampaign(meta);
        } catch (error) {
          console.error(error);
        }
      };

      pinJsonToPinata(info);
      

    } catch (error) {
      console.log(error);
    }

    setProcessing(false);
  };

  const createCampaign = async (meta) => {
    const contract = await tronWeb.contract(contractABI, contractAddress);
    try {
      toast.info("Confirm to Create the Campaign", { position: "top-center" });

      // Send transaction to create campaign
      const tx = await contract.createCampaign(
        tronWeb.defaultAddress.base58, // owner address (could be dynamic)
        formInfo.title,
        formInfo.description,
        tronWeb.toSun(formInfo.target.toString()), // convert target to smallest unit (Sun)
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
    <div className="min-h-screen flex justify-center items-center">
      <main className="container mx-auto px-4">
        <div className="content text-white shadow-lg rounded-lg border-2 p-4 px-5 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600" style={{ marginTop: "120px" }}>
          <div className="space-y-8">
            <Row className="g-4">
              <Form.Group>
                <Form.Label className="text-lg">Upload Image</Form.Label>
                <Form.Control
                  type="file"
                  required
                  name="image"
                  accept="image/*" // Only accept image files
                  onChange={(event) => changeHandler(event, 'image')}
                />
              </Form.Group>
              <Form.Control
                onChange={handleChange}
                name="title"
                required
                type="text"
                placeholder="Title"
              />
              <Form.Control
                onChange={handleChange}
                name="description"
                required
                as="textarea"
                placeholder="Description"
              />
              <Form.Control
                onChange={handleChange}
                name="target"
                required
                type="number"
                placeholder="Target Amount"
              />
              <Form.Control
                onChange={handleChange}
                name="deadline"
                required
                type="number"
                placeholder="Deadline (Unix Timestamp)"
              />
              <div className="flex justify-center">
                <Button onClick={handleEvent} variant="primary" size="lg" disabled={processing}>
                  Create Campaign
                </Button>
              </div>
            </Row>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Create;
