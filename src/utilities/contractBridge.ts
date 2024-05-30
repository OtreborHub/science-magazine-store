import { Contract, Provider, ethers, parseUnits } from "ethers";
import Swal from "sweetalert2";
import { contractABI } from "./abi";
import { ErrorMessage } from "./error";
import { createMagazine, findMagazine } from "./firebase";
import { Magazine } from "./interfaces";
import { formatDate } from "./helper";

const CONTRACT_ADDRESS: string = process.env.REACT_APP_CONTRACT_ADDRESS as string;
let contractInstance: Contract;

type ContractResponse<T> = {
  responseMagazines: T[],
  error: Error | string
}

export const emptyMagazine: Magazine = { address: "", title: "", release_date: 0, content: "", cover: "", summary: "" }

export default function getContractInstance(provider: Provider, signer: string) {
  if (!contractInstance) {
    contractInstance = new Contract(CONTRACT_ADDRESS, contractABI, provider);
    addContractListeners(signer);
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
            title: "Ordine ricevuto!",
            text: "Puoi visitare il numero che hai appena acquistato qui: \n" + ipfsURL,
            icon: "success",
            confirmButtonColor: "#3085d6"
          });
          console.log("Buy Order Event: { magazine_address: " + magazine_address + "}");
        }
      });
    }

  });

  contractInstance.on("SubscriptionOrder", (customer, expire_date, event) => {
    if (customer === signer) {
      Swal.fire({
        title: "Abbonamento effettuato!",
        text: "Il tuo abbonamento scadra il: " + formatDate(Number(expire_date)) + ". \nPremi OK per ricaricare la pagina",
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
          title: "Nuovo numero!",
          text: "Indirizzo del magazine: \n" + magazine_address + ". \nPremi OK per ricaricare la pagina",
          icon: "success",
          confirmButtonColor: "#3085d6"
        }).then((result) => {
          if(result.isConfirmed){
            window.location.reload();
          }
        });
      })
      .catch(error => console.log(error));
  });

  contractInstance.on("ReleaseMagazine", (magazine_address, event) => {
    //Firebase update in SimpleCard.tsx
    Swal.fire({
      title: "Nuovo numero rilasciato!",
      text: "Indirizzo del magazine: " + magazine_address + ". \nPremi OK per ricaricare la pagina",
      icon: "success",
      confirmButtonColor: "#3085d6"
    }).then((result) => {
      if(result.isConfirmed){
        window.location.reload();
      }
    });
  });


}

export async function readAllMagazines(magazineCount: number): Promise<ContractResponse<Magazine>> {
  var magazines: Magazine[] = [];
  let lastIndex = 0;
  const FROM = 0;
  // const TO = 12;

  try {
    if (contractInstance) {
      for (let i = FROM; i < magazineCount; i++) {
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
          lastIndex = i;
        } else {
          break;
        }
      }
    }

    return { responseMagazines: magazines, error: "" };
  } catch {
    return { responseMagazines: [], error: ErrorMessage.RD };
  } 
}

export async function readCustomerMagazine(): Promise<ContractResponse<Magazine>> {
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
    
    return { responseMagazines: magazines, error: "" };
  } catch (error: any) {
    return { responseMagazines: [], error: ErrorMessage.RD };
  }
}

export async function readMagazineByAddress(magazine_address: string): Promise<ContractResponse<Magazine>> {
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
    
    return { responseMagazines: magazines, error: "" };
  } catch (error: any) {
    return { responseMagazines: [], error: ErrorMessage.RD };
  }
}

export async function readContractBalance() {
  if (contractInstance) {
    return await contractInstance.getBalance()
  }
}

export async function readMagazineCount() {
  if (contractInstance) {
    return await contractInstance.countMagazines()
  }
}

export async function readCustomer() {
  if (contractInstance) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

    return await signerContract.isCustomer();
  }
}

export async function readAdministrator() {
  if (contractInstance) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

    return await signerContract.isAdministrator();
  }
}

export async function readOwner() {
  if (contractInstance) {
    return await contractInstance.owner();
  }
}

export async function readSinglePrice() {
  if (contractInstance) {
    return await contractInstance.singlePrice();
  }
}

export async function readAnnualPrice() {
  if (contractInstance) {
    return await contractInstance.annualPrice();
  }
}

export async function addAdministrator(address: string) {
  if (contractInstance) {
    try{
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
  
      return await signerContract.addAdmin(address);

    } catch (error) {
      console.log("addAdmin action: " + ErrorMessage.TR);
      Swal.fire({
        title: "Qualcosa è andato storto!",
        icon: "error",
        text: "Si è verificato un errore durante l'inserimento dell'admin: Riprova più tardi.",
        confirmButtonColor: "#3085d6",
      });
    }
  }
}

export async function addMagazine(title: string) {
  if (contractInstance) {
    try{

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

      return await signerContract.addMagazine(title);

    } catch (error) {
      console.log("addMagazine action: " + ErrorMessage.TR);
      Swal.fire({
        title: "Qualcosa è andato storto!",
        icon: "error",
        text: "Si è verificato un errore durante l'inserimento del magazine: Riprova più tardi.",
        confirmButtonColor: "#3085d6",
      });
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
    } catch (error) {
      console.log("releaseMagazine action: " + ErrorMessage.TR);
      Swal.fire({
        title: "Qualcosa è andato storto!",
        icon: "error",
        text: "Si è verificato un errore durante il rilascio del magazine: Riprova più tardi.",
        confirmButtonColor: "#3085d6",
      });
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
      return await signerContract.buyMagazine(address, options)

    } catch (error: any) {
      if(error.shortMessage.includes("execution reverted")){
        const errorMessage = error.shortMessage.split(":")[1].trim().replace("\"", "").slice(0, -1);
        if(errorMessage === ErrorMessage.MAO){
          Swal.fire({
            title: "Magazine già acquistato!",
            icon: "error",
            text: "Puoi consultare i tuoi magazine dal menu ruolo",
            confirmButtonColor: "#3085d6",
          });
        } else {
          Swal.fire({
            title: "Qualcosa è andato storto!",
            icon: "error",
            text: "Si è verificato un errore durante l'acquisto del magazine: Riprova più tardi.",
            confirmButtonColor: "#3085d6",
          }); 
        }
      }
    }
  }
}

export async function annualSubscription(value: number) {
  if (contractInstance) {
    try{

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
  
      let options = { value: value }
      return await signerContract.annualSubscribe(options);

    } catch (error) {
      console.log("annualSubscribe action: " + ErrorMessage.TR);
      Swal.fire({
        title: "Qualcosa è andato storto!",
        icon: "error",
        text: "Si è verificato un errore durante la sottoscrizione annuale: Riprova più tardi.",
        confirmButtonColor: "#3085d6",
      });
    }
  }
}

export async function revokeSubscription() {
  if (contractInstance) {
    try{

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
  
      return await signerContract.revokeSubscribe();

    } catch (error) {
      console.log("revokeSubscribe action: " + ErrorMessage.TR);
      Swal.fire({
        title: "Qualcosa è andato storto!",
        icon: "error",
        text: "Si è verificato un errore durante l'operazione di revoca: Riprova più tardi.",
        confirmButtonColor: "#3085d6",
      });
    }
  }
}

export async function withdraw(amount: string) {
  if (contractInstance) {
    try {

      return await contractInstance.withdraw(amount);

    } catch (error) {
      console.log("withdraw action: " + ErrorMessage.TR);
      Swal.fire({
        title: "Qualcosa è andato storto!",
        icon: "error",
        text: "Si è verificato un errore durante l'operazione di prelievo: Riprova più tardi.",
        confirmButtonColor: "#3085d6",
      });
    }
  }
}

export async function splitProfit() {
  if (contractInstance) {
    try {
      
      return await contractInstance.splitProfit();

    } catch (error) {
      console.log("splitProfit action: " + ErrorMessage.TR);
      Swal.fire({
        title: "Qualcosa è andato storto!",
        icon: "error",
        text: "Si è verificato un errore durante l'operazione di split Profit: Riprova più tardi.",
        confirmButtonColor: "#3085d6",
      });
    }
  }
}

export async function donateETH(value: number) {
  if (contractInstance) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
  
      let amount = parseUnits(value+"", 18);
      let tx = await signer.sendTransaction({
        to: CONTRACT_ADDRESS,
        value: amount,
        // gasLimit: 21000 // Gas limit per transazioni standard
      });
      await tx.wait();
      return true;

    } catch (error) {
      console.log("donation action: " + ErrorMessage.TR);
      Swal.fire({
        title: "Qualcosa è andato storto!",
        icon: "error",
        text: "Si è verificato un errore durante l'operazione di donazione: Riprova più tardi.",
        confirmButtonColor: "#3085d6",
      });
      return false;
    }
  }
}
