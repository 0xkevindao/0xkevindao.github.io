//import the ethers.js stuff
import { ethers } from "./ethers-5.2.esm.min.js";
import NftBase from "./nftContract.js";
import { CONTRACT_ADDRESS } from "./utils.js";

// Constants
var currentAccount = null;
var qty;
let number = 1; 

$(".plus_qty").click(function(){
  var qty = parseInt($("#quantity_input").val());
  if (qty < 10) {
      qty++;
      number = qty;
      $("#quantity_input").val(qty);
      return number
  }
});

$(".minus_qty").click(function(){
  var qty = parseInt($("#quantity_input").val());
  if (qty > 1) {
      qty--;
      number = qty;
      $("#quantity_input").val(qty);
      return number
  }
});

//this method will be the first to run, it logs a message and sets up listeners for the button clicks.
const isLoaded = () => {
  console.log('This is a vanillajs (plain old javascript) implementation of an NFT minting website');
  document.getElementById('connect-wallet').addEventListener('click', ()=>{connectWallet()});
  document.getElementById("mint-button").addEventListener("click", ()=>{askContractToMint(number)})
}

//hides Connect and replaces with Mint Function
function switchButtons()
{
document.getElementById("connect-wallet").textContent = "Connected";
//document.getElementById("mint-button"). style.visibility='visible';
}

const checkforWallet = async () => {
  try{
      const { ethereum } = window;

      if(!ethereum){
          console.log('Make sure you have metamask!');
          return;
      }else{
          console.log('We have the ethereum object!');
          if(currentAccount != null) return;

          const accounts = await ethereum.request({method: 'eth_accounts'});

          if(accounts.length !== 0){
              const account = accounts[0];
              console.log('Found an account: ', account);
              currentAccount = account;
          }else{
              console.log('No accounts found.');
          }
      }      
  } catch (error){
      console.log(error);
  }
};

const connectWallet = async () => {
  
  let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);

// String, hex code of the chainId of the Rinkebey test network. Need to change this to 0x1 for Ethereum Mainnet
    const rinkebyChainId = "0x1"; 
    if (chainId !== rinkebyChainId) {
	  alert("You are not connected to the Ethereum Mainnet!");
    }
  try{
    if(currentAccount != null) {
	alert('Wallet already connected');
	switchButtons();
	return;
    }
    const {ethereum} = window;

    if(!ethereum){
      alert('Get Metamask');
      return;
    }

    const accounts = await ethereum.request({
      method: 'eth_requestAccounts'
    });

    console.log('Connected', accounts[0]);
    currentAccount = accounts[0];
    switchButtons();
   
  } catch(error){
    console.log(error);
  }
}

const setupEventListener = async () => {
      //most of this looks as our function askContractToMint
      try {
        const {ethereum } = window;
  
        if(ethereum) {
          //Same stuff again
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, NftBase.abi, signer);
  
          //This is the important part
          //We "capture" the event that the contract emits
          connectedContract.on("NftBase", (from, tokenId) => {
            console.log(from, tokenId.toNumber())
  
            alert((`Hey there! We've minted your NFT and sent it to your wallet. 
            It may be blank right now. It can take a max of 10 min to show up on OpenSea. 
            Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`))
  
          });
          console.log("Setting up event Listener!")
        } else {
          console.log("Ethereum object does not exist");
        }
      } catch (error) {
        console.log(error)
      }
    }
    

    const askContractToMint = async (number) => {
          try {
            const { ethereum } = window;
            if(ethereum) {
              const provider = new ethers.providers.Web3Provider(ethereum);
              const signer = provider.getSigner();
              const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, NftBase.abi, signer);
             let nftMinted = await connectedContract.totalSupply()
              let price
              try{
                 if (nftMinted <= 1111){
                    price = 0
                 } else {
                  price = 0.00
                 }
		      
                 console.log(`number to mint: ${number}`)
		 console.log(`price: ${price}`)
		      
                let totalPrice = ethers.utils.parseEther((number * price).toString())
		 console.log(`Total Price: ${totalPrice}`)
		      
                let transactionData = {
                  value: totalPrice,
                  gasPrice: await provider.getGasPrice(),
               }
		
		console.log("Going to pop wallet now to pay gas and price...")
              let nftTxn = await connectedContract.mintKevin(number, transactionData);
      
              console.log(`Minting ${number} NFTs..please wait`)
              await nftTxn.wait();
      
              console.log(`Mined, see transaction: http://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
              getTotalNFTsMintedSoFar();

	      } catch(error) {
                console.log(error)
                alert(error)
              }
		    
	      } else {
              console.log("Ethereum object doesn't exist");
            }
          } catch(error) {
            console.log(error)
          }
        }

    const getTotalNFTsMintedSoFar = async () => {
    try {
      const { ethereum } = window;
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, NftBase.abi, signer);

        console.log("Checking Number of Minted NFTS on Collection")

        let nftNumber = await connectedContract.totalSupply();

        console.log("How many NFTs do we have so far...?")

        console.log(`Total NFT´s Minted so far: ${parseInt(nftNumber,10)}`);
        let counter = document.getElementById("minted-nfts")
        counter.textContent = nftNumber;
        return nftNumber

      } else {
        console.log("Ethereum object doesn´t exist");
      }
    } catch(error) {
      console.log(error)
    }
  }

//the main logic
const runLogic = () => {
  checkforWallet();
  getTotalNFTsMintedSoFar();
}

//do this when the page loads
document.addEventListener("DOMContentLoaded", function() {
  //say hello
  isLoaded();

  //optional event to display nft Id after minting
  //setupEventListener();
  //check for metamask
  runLogic();
});

