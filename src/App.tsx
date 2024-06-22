
import { Provider, ethers } from "ethers";

import { useEffect } from 'react';
import './App.css';
import { useAppContext } from "./Context";
import Home from './components/Home';
import Navbar from "./components/Navbar";
import ErrorView from "./components/views/ErrorView";
import getContractInstance, { readAdministrator, readContractBalance, readCustomer, readOwner } from "./utilities/contractBridge";
import { ErrorMessage } from "./utilities/error";
import { firebaseInit } from "./utilities/firebase";
import { getRole } from "./utilities/role";

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
    firebaseInit();
    
    //Events
    window.ethereum.on('chainChanged', handleChanges);
    window.ethereum.on('accountsChanged', handleAccountChanges);
  }, []);

  const handleChanges = () => {
    console.log(window.ethereum.chainId);
    window.location.reload();
  };

  const handleAccountChanges = async (accounts:any) => {
    if (accounts.length === 0) {
      console.log('Please connect to Metamask.');
      disconnect();
      window.location.reload();
    } else if(appContext.signer !== "" && accounts.length > 1) {
      window.location.reload();
    } else {
      await connectWallet();
      window.location.reload();
    }
  };

  async function connectWallet() {
    try{
      if(window.ethereum){
          const provider = new ethers.BrowserProvider(window.ethereum);
          appContext.updateProvider(provider);

          const signer = await provider.getSigner();
          appContext.updateSigner(signer.address);

          setAccountBalance(provider, signer.address);
          appContext.updateChainId(parseInt(window.ethereum.chainId));

          init(signer.address);
        
      } else {
        let provider = new ethers.InfuraProvider("sepolia" , process.env.INFURA_API_KEY);
        appContext.updateProvider(provider);
        
        const signer = await provider.getSigner();
        appContext.updateSigner(signer.address);

        setAccountBalance(provider, signer.address);
        appContext.updateChainId(parseInt(window.ethereum.chainId));

        init(signer.address);
      }
    } catch {
      disconnect();
      console.log("Error retrieving BrowserProvider");
    }
  }

  async function disconnect() {
    appContext.updateSigner("");
    appContext.updateBalance(0);
  }

  async function init(signer: string) {
    try {
      getContractInstance(appContext.provider, signer);
      
      const contractBalance = await readContractBalance();
      appContext.updateContractBalance((Number(contractBalance)));

      const adminResult = await readAdministrator();
      const isAdmin = adminResult[0];

      const ownerResult = await readOwner();
      const isOwner = ownerResult === signer;

      const customerResult = await readCustomer();
      const isCustomer = customerResult[0];

      appContext.updateRole(getRole(isOwner, isAdmin, isCustomer));
    } catch {
      console.log("Error during contract init");
    }

  }

  async function setAccountBalance(provider: Provider, signer: string){
    if(!provider || !signer) return;

    await provider.getBalance(signer).then((balance: bigint) => {
      const bal = parseFloat(ethers.formatEther(balance));
      console.log(`balance available: ${bal.toFixed(18)} ETH`);
      appContext.updateBalance(bal);
    });
  }

  return (
    <div className="App" id="app">

      <Navbar connect={connectWallet}/>
      { appContext.signer && appContext.chainId === SEPOLIA_CHAIN_ID && <Home /> }
      { (!appContext.signer || appContext.chainId !== SEPOLIA_CHAIN_ID) && <ErrorView errorMessage={ErrorMessage.WL}/> }

    </div>
  );
}

