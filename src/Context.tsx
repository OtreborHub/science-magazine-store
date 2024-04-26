import { Provider, ethers } from "ethers";
import React, { createContext, useContext, ReactNode, useState } from "react";
import { Role } from "./utilities/role";

const infuraProvider: Provider = new ethers.InfuraProvider("sepolia" , process.env.INFURA_API_KEY);

const searchContext = createContext({
  search: () => {},
  searched: false
});

const appContext = createContext({
  updateProvider: (provider:Provider) => {},
  updateChainId: (chainId: number) => {},
  updateSigner: (signer: string) => {},
  updateBalance: (balance: number) => {},
  updateContractBalance: (contractBalance: number) => {},
  updateRole: (role: Role) => {},
  provider: infuraProvider,
  chainId: 0,
  signer: "",
  balance: 0,
  contractBalance: 0,
  role: Role.NONE
})

export function useSearchContext() {
  return useContext(searchContext);
}

export function useAppContext() {
  return useContext(appContext);
}

interface AppContextProviderProps {
  children: ReactNode;
}

export function AppContextProvider({ children }: AppContextProviderProps) {
  
  const [provider, setProvider] = useState<Provider>(infuraProvider);
  const [chainId, setChainId] = useState<number>(0);
  const [signer, setSigner] = useState<string>("")
  const [balance, setBalance] = useState<number>(0);
  const [contractBalance, setContractBalance] = useState<number>(0);
  const [role, setRole] = useState<Role>(Role.NONE);
  const [searched, setSearched] = useState<boolean>(false);

  function updateProvider(provider: Provider) { setProvider(provider); }

  function updateChainId(chainId: number) { setChainId(chainId); }
  
  function updateSigner(signer: string) { setSigner(signer); }
  
  function updateBalance(balance: number) { setBalance(balance); }
  
  function updateContractBalance(contractBalance: number) { setContractBalance(contractBalance); }
  
  function updateRole(role: Role) { setRole(role); }

  function search() {
    if(!searched){
      setSearched(true);
      setTimeout(() => setSearched(false), 1000);
    }
  }

  return (
    <appContext.Provider value={{
      updateProvider, updateChainId, updateSigner, updateBalance, updateContractBalance, updateRole, 
      provider, chainId, signer, balance, contractBalance, role}}>
      <searchContext.Provider value={{search, searched}}>
        {children}
      </searchContext.Provider>
    </appContext.Provider>
  );
}