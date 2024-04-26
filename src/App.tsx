
import { Provider, ethers } from "ethers";

import { useEffect, useState } from 'react';
import './App.css';
import { useAppContext } from "./Context";
import Error from './components/Error';
import Navbar from './components/Navbar';
import Home from './components/home/Home';
import getContractInstance, { readAdministrator, readContractBalance, readCustomer, readOwner } from "./utilities/contractBridge";
import { ErrorMessage } from "./utilities/error";
import { getRole } from "./utilities/role";
import { heliaNode } from "./utilities/helia";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const SEPOLIA_CHAIN_ID = 11155111;

export default function App() {
  const appContext = useAppContext();
  
  useEffect(() => {
    connectWallet();
    // heliaNode();
    //Events
    window.ethereum.on('chainChanged', handleChanges);
    window.ethereum.on('accountsChanged', handleAccountChanges);
  }, []);

  const handleChanges = () => {
    console.log(window.ethereum.chainId);
    window.location.reload();
  };

  const handleAccountChanges = (accounts:any) => {
    if (accounts.length === 0) {
      console.log('Please connect to Metamask.');
      disconnect();
      window.location.reload();
    } else if(appContext.signer !== "" && accounts.length > 1) {
      window.location.reload();
    } else {
      connectWallet();
    }
  };

  async function connectWallet() {
    if(window.ethereum){
      try{
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        appContext.updateProvider(provider);

        provider.getSigner().then((signer) => {
          appContext.updateSigner(signer.address);
          setAccountBalance(provider, signer.address);
          appContext.updateChainId(parseInt(window.ethereum.chainId));
          init(signer.address);
        }).catch((error) => {
          console.log(ErrorMessage.TR);
        })
      } catch {
        disconnect();
        console.log("Error retrieving BrowserProvider");
      }
    } else {
      console.error('Browser Provider not available: install Metamask extension on your browser');
      let provider = new ethers.InfuraProvider("sepolia" , process.env.INFURA_API_KEY);
      appContext.updateProvider(provider);
    }
  }

  async function disconnect() {
    appContext.updateSigner("");
    appContext.updateBalance(0);
  }

  async function init(signer: string) {
      getContractInstance(appContext.provider);
      
      readContractBalance().then((result) => {
        appContext.updateContractBalance((Number(result)));
      })

      let admin: boolean = false;
      let owner: boolean = false;
      let customer: boolean = false;
      
      readAdministrator().then((result) => {
        admin = result[0];

        readOwner().then((result) => {
          owner = result === signer;
        
          readCustomer().then((result) => {
            customer = result[0];
            appContext.updateRole(getRole(owner, admin, customer));
          });
        });
      });


      // if(!helia){ getAssetIPFS(); }
  }

  function setAccountBalance(provider: Provider, signer: string){
    if(!provider || !signer) return;

    provider.getBalance(signer).then((balance: bigint) => {
      const bal = parseFloat(ethers.formatEther(balance))
      console.log(`balance available: ${bal.toFixed(4)} ETH`);
      appContext.updateBalance(bal);
    });
  }

  return (
    <div className="App">

      <Navbar connect={connectWallet}/>
      { appContext.signer && appContext.chainId === SEPOLIA_CHAIN_ID && <Home /> }
      { !appContext.signer && <Error errorMessage={ErrorMessage.WL}/> }
      { appContext.signer && appContext.chainId !== SEPOLIA_CHAIN_ID && <Error errorMessage={ErrorMessage.SP}/> }

    </div>
  );
}

