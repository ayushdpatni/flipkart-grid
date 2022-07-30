import { useState } from 'react'
import OrderedItem from './OrderedItem';
import { ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import './Create.css';
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');


const Create = ({ marketplace, nft }) => {
  const [image, setImage] = useState('')
  const [serial, setSerial] = useState('')
  const [UserAddress, setUserAddress] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [expDate, setExpDate] = useState('')
  // const [time,setTime] = useState('')

  const uploadToIPFS = async (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    if (typeof file !== 'undefined') {
      try {
        const result = await client.add(file)
        console.log(result)
        setImage(`https://ipfs.infura.io/ipfs/${result.path}`)
      } catch (error){
        console.log("ipfs image upload error: ", error)
      }
    }
  }

  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;


  const createNFT = async () => {
    if (!image || !UserAddress || !name || !description ) return
    try{
      var final = serial+' '+name;
      var new_desc = 'Created on'+' '+dateTime+', '+description+', '+'and is Valid till :'+expDate;
      const result = await client.add(JSON.stringify({image, UserAddress, name:final, description:new_desc}))
      mintThenList(result)
    } catch(error) {
      console.log("ipfs uri upload error: ", error)
    }
  }
  const mintThenList = async (result) => {
    const uri = `https://ipfs.infura.io/ipfs/${result.path}`
    // mint nft 
    await(await nft.mint(uri)).wait()
    // get tokenId of new nft 
    const id = await nft.tokenCount()
    // approve marketplace to spend nft
    await(await nft.setApprovalForAll(marketplace.address, true)).wait()
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther('0.0001')
    await(await marketplace.makeItem(nft.address, id, listingPrice, UserAddress)).wait()
  }


  return (
    <div className="createForm">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control onChange={(e) => setSerial(e.target.value)} size="lg" required type="number" placeholder="Serial Number" />
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
              <Form.Control onChange={(e) => setUserAddress(e.target.value)} size="lg" required type="text" placeholder="User Adress:" />
              <Form.Control onChange={(e) => setExpDate(e.target.value)} size="lg" required type="date" placeholder="Set Expiry Date: " />
              {/* <Form.Control onChange={(e) => setTime(e.target.value)} size="lg"/> */}
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
      <OrderedItem/>
    </div>
  );
}

export default Create