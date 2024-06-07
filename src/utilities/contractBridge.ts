import { Contract, Provider, ethers, parseUnits } from "ethers";
import Swal from "sweetalert2";
import { contractABI } from "./abi";
import { Action } from "./actions";
import { ErrorMessage, swalError } from "./error";
import { createMagazine, findMagazine } from "./firebase";
import { formatDate } from "./helper";
import { Magazine } from "./interfaces";

const CONTRACT_ADDRESS: string = process.env.REACT_APP_CONTRACT_ADDRESS as string;
let contractInstance: Contract;

export const emptyMagazine: Magazine = { address: "", title: "", release_date: 0, content: "", cover: "", summary: "" }

export default function getContractInstance(provider: Provider, signer: string) {
  if (!contractInstance) {
    try {
      contractInstance = new Contract(CONTRACT_ADDRESS, contractABI, provider);
      addContractListeners(signer);
    } catch {
      console.log("Errore durante la creazione dell'istanza del contratto: verificare l'indirizzo del contratto, l'abi e il provider utilizzato");
    }
  }
}

//EVENTS 
function addContractListeners(signer: string) {
  contractInstance.on("BuyOrder", (customer, magazine_address, event) => {
    if (customer === signer) {
      //Firebase data
      findMagazine(magazine_address).then((response) => {
        if(response.exists()){
          let ipfsURL = response.val().content;

          Swal.fire({
            title: "Acquisto effettuato!",
            text: "Puoi visitare il magazine che hai appena acquistato qui: \n\n" + ipfsURL + " \n\nPremi OK per ricaricare la pagina",
            icon: "success",
            confirmButtonColor: "#3085d6"
          }).then((result) => {
            if(result.isConfirmed){
              window.location.reload();
            }
          });
        }
      }).catch(error => {
        console.log("firebase error: " + error);
        swalError(ErrorMessage.FE, Action.FIREBASE_DATA);
      });
    }

  });

  contractInstance.on("SubscriptionOrder", (customer, expire_date, event) => {
    if (customer === signer) {
      Swal.fire({
        title: "Abbonamento effettuato!",
        text: "Il tuo abbonamento scadrà il: " + formatDate(Number(expire_date)) + ".\n\nPremi OK per ricaricare la pagina",
        icon: "success",
        confirmButtonColor: "#3085d6"
      }).then((result) => {
        if(result.isConfirmed){
          window.location.reload();
        }
      });
    }
  });

  contractInstance.on("NewMagazine", (magazine_address, event) => {
    //Firebase data
    createMagazine(magazine_address).then(response => {
        Swal.fire({
          title: "Nuovo magazine!",
          text: "Indirizzo del magazine creato:\n\n" + magazine_address + "\n\nPremi OK per ricaricare la pagina",
          icon: "success",
          confirmButtonColor: "#3085d6"
        }).then((result) => {
          if(result.isConfirmed){
            window.location.reload();
          }
        });
      }).catch(error => {
        console.log("firebase error: " + error);
        swalError(ErrorMessage.FE, Action.FIREBASE_DATA);
      });
  });

  contractInstance.on("ReleaseMagazine", (magazine_address, event) => {
    //Firebase update in SimpleCard.tsx
    Swal.fire({
      title: "Nuovo numero rilasciato!",
      text: "Indirizzo del magazine rilasciato:\n\n" + magazine_address + "\n\nPremi OK per ricaricare la pagina",
      icon: "success",
      confirmButtonColor: "#3085d6"
    }).then((result) => {
      if(result.isConfirmed){
        window.location.reload();
      }
    });
  });
}

//Quando i magazines saranno troppi e non si vorrà fetchare tanti magazines alla volta
//sarà sufficiente modificare la variabile d'ambiente FROM, 
//per consentire all'applicazione di estrarre magazines a partire dall'indice indicato
//default REACT_APP_FROM = 0
export async function readAllMagazines(): Promise<Magazine[]> {
  var magazines: Magazine[] = [];
  let from : number = Number(process.env.REACT_APP_FROM as string);

  try {
    const magazineCount: number = Number(await readMagazineCount());
    if (contractInstance) {
      for (let i = from; i < magazineCount; i++) {
        const result = await contractInstance.magazines(i);
        if (result) {

          let magazine: Magazine = {
            address: result[0],
            title: result[1],
            release_date: Number(result[2]),
            content: "",
            cover: "",
            summary: ""
          }

          magazines.push(magazine);
        } else {
          break;
        }
      }
    }

    console.log("reading " + magazines.length + " magazines");
    return magazines;

  } catch (error: any) {
    console.log("readAllMagazines action: " + ErrorMessage.RD);
    swalError(ErrorMessage.RD, Action.SRC_ALL_MAG, error);
    return [];
  } 
}

export async function readCustomerMagazine(): Promise<Magazine[]> {
  var magazines: Magazine[] = [];
  try {
    if (contractInstance) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

      const magazines_address: string[] = await signerContract.magazinesByCustomer();
      if(magazines_address.length > 0){
        await Promise.all(
          magazines_address.map(async (magazine_address:string) => {
            const result = await contractInstance.magazineByAddress(magazine_address);
            if (result) {
              let magazine: Magazine = {
                address: result[0],
                title: result[1],
                release_date: Number(result[2]),
                content: "",
                cover: "",
                summary: ""
              }
              magazines.push(magazine);
            }
          })
        )
      }
    }
    
    return magazines;
  } catch (error: any) {
    console.log("readCustomerMagazine action: " + ErrorMessage.RD);
    swalError(ErrorMessage.RD, Action.SRC_CUSTOM_MAG, error);
    return [];
  }
}

export async function readMagazineByAddress(magazine_address: string): Promise<Magazine[]> {
  var magazines: Magazine[] = [];
  try {
    if (contractInstance) {
      const result = await contractInstance.magazineByAddress(magazine_address);
      if (result) {
        let magazine: Magazine = {
          address: result[0],
          title: result[1],
          release_date: Number(result[2]),
          content: "",
          cover: "",
          summary: ""
        }
        magazines.push(magazine);
      }
    }
    
    return magazines;
  } catch (error: any) {
    console.log("readMagazineByAddress action: " + ErrorMessage.RD);
    swalError(ErrorMessage.RD, Action.SRC_ADDR_MAG, error);
    return [];
  }
}

export async function readContractBalance() {
  if (contractInstance) {
    try {
      return await contractInstance.getBalance();
    } catch (error: any) {
      console.log("readContractBalance action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
    }
  }
}

export async function readMagazineCount() {
  if (contractInstance) {
    try {
      return await contractInstance.countMagazines();
    } catch (error: any) {
      console.log("readMagazineCount action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
    }
  }
}

export async function readCustomer() {
  if (contractInstance) {
    try{
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

      return await signerContract.isCustomer();
    
    } catch (error: any) {
      console.log("readCustomer action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
    }
  }
}

export async function readAdministrator() {
  if (contractInstance) {
    try{
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

      return await signerContract.isAdministrator();
    
    } catch (error: any) {
      console.log("readAdministrator action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
    }
  }
}

export async function readOwner() {
  if (contractInstance) {
    try{
      return await contractInstance.owner();
    } catch (error: any) {
      console.log("readOwner action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
    }
  }
}

export async function readSinglePrice() {
  if (contractInstance) {
    try{
      return await contractInstance.singlePrice();
    } catch (error: any) {
      console.log("readSinglePrice action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
    }
  }
}

export async function readAnnualPrice() {
  if (contractInstance) {
    try{
      return await contractInstance.annualPrice();
    } catch (error: any) {
      console.log("readAnnualPrice action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
    }
  }
}

export async function addAdministrator(address: string) {
  if (contractInstance) {
    try{
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
  
      await signerContract.addAdmin(address);
      return true;
      
    } catch (error: any) {
      console.log("addAdministrator action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.ADD_ADMIN, error);
      return false;
    }
  }
}

export async function addMagazine(title: string) {
  if (contractInstance) {
    try{

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

      await signerContract.addMagazine(title);
      return true;

    } catch (error: any) {
      console.log("addMagazine action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.ADD_MAG, error);
      return false;

    }
  }
}

export async function releaseMagazine(address: string) {
  if (contractInstance) {
    try{
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
  
      return await signerContract.releaseMagazine(address);
    } catch (error: any) {
      console.log("releaseMagazine action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.RELEASE_MAG, error);
    }
  }

}

export async function buyMagazine(address: string, value: number) {
  if (contractInstance) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
  
      let options = { value: value }
      await signerContract.buyMagazine(address, options)
      return true;

    } catch (error: any) {
      console.log("buyMagazine action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.BUY_MAG, error);
      return false;
    }
  }
}

export async function annualSubscription(value: number) {
  if (contractInstance) {
    try{

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
  
      let options = { value: value };

      return await signerContract.annualSubscribe(options);

    } catch (error) {
      console.log("annualSubscription action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.SUB, error);
    }
  }
}

export async function revokeSubscription() {
  if (contractInstance) {
    try{
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
  
      await signerContract.revokeSubscribe();
      return true;

    } catch (error) {
      console.log("revokeSubscription action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.REVOKE_SUB, error);
      return false;
    }
  }
}

export async function withdraw(amount: string) {
  if (contractInstance) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

      const ethAmount = ethers.parseEther(amount)
      await signerContract.withdraw(ethAmount);
      return true;

    } catch (error) {
      console.log("withdraw action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.WITHDRAW, error);
      return false;
    }
  }
}

export async function splitProfit() {
  if (contractInstance) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

      await signerContract.splitProfit();
      return true;

    } catch (error) {
      console.log("splitProfit action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.SPLIT_PROFIT, error);
      return false;
    }
  }
}

export async function donation(value: number) {
  if (contractInstance) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
  
      let amount = parseUnits(value+"", 18);
      let tx = await signer.sendTransaction({
        to: CONTRACT_ADDRESS,
        value: amount,
      });
      await tx.wait();
      return true;

    } catch (error) {
      console.log("donateETH action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.DONATION, error);
      return false;
    }
  }
}
