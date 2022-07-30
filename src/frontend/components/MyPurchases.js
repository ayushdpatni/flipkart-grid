import { useState, useEffect } from 'react'
import {useRef} from 'react';

import { ethers } from "ethers"
import { Row, Col, Form, Card, Button } from 'react-bootstrap'
import './MyPurchases.css'
import n from 'react-flash-message';


export var walletAddress='';

export default function MyPurchases({ marketplace, nft, account }) {
  const inputRef = useRef(null);
  var counter=0;

  const transferNFT = async() =>{
    const secAddress = inputRef.current.value;
    const id = await nft.tokenCount()
    if(counter===0){
    await(await nft.transferFrom(account,secAddress,id))
    alert("Final Transfer Successful!")
    counter++;
  }else{
    alert("This NFT no longer belongs to your wallet!")
  }
  }
  
  function handleClick() {
    const secAddress = inputRef.current.value;
    console.log(secAddress)
    transferNFT();
  }
  
  const [loading, setLoading] = useState(true)
  const [purchases, setPurchases] = useState([])
  const [lastFive,setlastFive] = useState("")
  const loadPurchasedItems = async () => {
    walletAddress=account;
    // Fetch purchased items from marketplace by quering Offered events with the buyer set as the user
    const filter =  marketplace.filters.Bought(null,null,null,null,null,account)
    const results = await marketplace.queryFilter(filter)
    //Fetch metadata of each nft and add that to listedItem object.
    const purchases = await Promise.all(results.map(async i => {
      // fetch arguments from each result
      try{
          i = i.args
        // get uri url from nft contract
        const uri = await nft.tokenURI(i.tokenId)
        // use uri to fetch the nft metadata stored on ipfs 
        const response = await fetch(uri)
        const metadata = await response.json()
        // get total price of item (item price + fee)
        const totalPrice = await marketplace.getTotalPrice(i.itemId)
        // define listed item object
        setlastFive((metadata.description).slice((metadata.description).length - 10));
        console.log("vf",metadata)
        console.log("lastFive",lastFive)
        let purchasedItem = {
          totalPrice,
          price: i.price,
          itemId: i.itemId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image
        }
        return purchasedItem
      }
      catch(e){
        return null;
      }

    }))
    setLoading(false)
    setPurchases(purchases)
  }
  useEffect(() => {loadPurchasedItems()}, [])
  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )
  return (
    <div className="flex justify-center fullHome">
      {purchases.length > 0 ?
        <div className='secondLine'>
            {purchases.map((item, idx) => (
              <div className='NFTbox box-size'>
              <div key={idx} className="">

              <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Footer>[{idx+1}] {ethers.utils.formatEther(item.totalPrice)} ETH</Card.Footer>
                  <p>User Address: 
                  <input ref={inputRef} type="text" classname='input' placeholder='  Enter Address here'/>
                  </p>
                  <Card.Footer>
                  <Button onClick={handleClick} className="transferNFTButton" variant="primary" size="lg">Transfer NFT</Button>
                  </Card.Footer>
                </Card>
              </div>
              </div>
              
            ))}
       
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No purchases</h2>
          </main>
        )}
    </div>
  );
}