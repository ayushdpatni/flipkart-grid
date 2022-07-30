import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'
import './Home.css'
const Home = ({ marketplace, nft,account }) => {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const loadMarketplaceItems = async () => {
    console.log('loading');
    // Load all unsold items
    const itemCount = await marketplace.itemCount()
    // console.log(itemCount);
    let items = []
    
    for (let i = 1; i <= itemCount; i++) {
    try{
      const item = await marketplace.items(i)
      console.log("1",item);
      if (!item.sold) {
        // get uri url from nft contract
        try{
          const uri = await nft.tokenURI(item.tokenId)
          // use uri to fetch the nft metadata stored on ipfs 
          const response = await fetch(uri)
          const metadata = await response.json()
          // get total price of item (item price + fee)
          const totalPrice = await marketplace.getTotalPrice(item.itemId)
          // Add item to items array
          console.log("metadata ",metadata)
          if(account.toLowerCase()===item.UserAddress.toLowerCase()){
  
            items.push({
            totalPrice,
            itemId: item.itemId,
            seller: item.seller,
            buyer: item.UserAddress,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image
          })
          }
        }catch(e){console.log('innerif')}
      }
    }catch(e){}
    }
    setLoading(false)
    setItems(items)
    console.log("first"+ JSON.stringify(items))
  }

  const buyMarketItem = async (item) => {
    await (await marketplace.purchaseItem(item.itemId, { value: item.totalPrice })).wait()
    loadMarketplaceItems()
  }

  useEffect(() => {
    loadMarketplaceItems()
  }, [])
  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )

  function sayHello() {
    alert('Make sure you claim correct warranty card with unique serial number sent on your mobile number.');
    const newLocal = window.location.href = 'localhost:3000/login';
    newLocal();
}

  return (
    <div className="flex justify-center fullHome">
      {/* <body>
          <marquee> Note: Before claiming the warranty, make sure you claim correct card with the unique serial number provided to you in message!</marquee>
      </body> */}
      {items.length > 0 ?
          <div className='secondLine'>

            {items.map((item, idx) => (
            
                <div className="NFTbox box-size" key={idx}>
            <div>
                <img className="NFTboxImg" src={item.image} alt="img"></img>
            </div>
            <div className="NFTboxContent">
                <h4 className="NFTcardContentName">{item.name}</h4>
                <h5 className="NFTcardContent">{item.description}</h5>
            </div>
            <Button onClick={() => buyMarketItem(item) && sayHello()} className="NFTbuyBtn NFTbtn-grad">Claim your Warranty</Button>
        </div>
        
            ))}
  
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No listed assets</h2>
          </main>
        )}
    </div>
  );
}
export default Home