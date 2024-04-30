import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'
import { AppContextProvider } from './Context';

const projectId: string = process.env.REACT_APP_WC_PROJECT_ID as string;

const sepolia = {
  chainId: 11155111,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: ' https://sepolia.etherscan.io',
  rpcUrl: 'https://rpc.sepolia.org'
}

const metadata = {
  name: 'news-manager',
  description: 'My Website description',
  url: 'https://localhost:3000',
  icons: ['https://avatars.mywebsite.com/']
}

createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [sepolia],
  projectId
})

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <AppContextProvider>
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </AppContextProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
