import { Contract, Provider, ethers, parseUnits } from "ethers";
import Swal from "sweetalert2";
import { useAppContext } from "../Context";
import { contractABI } from "./abi";
import { ErrorMessage } from "./error";
import { createMagazine, findMagazine, updateMagazine } from "./firebase";
import { Magazine } from "./interfaces";
import { formatExpireDate, formatReleaseDate } from "./utils";

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
  //ACQUISTA MAGAZINE
  contractInstance.on("BuyOrder", (customer, magazine_address, event) => {
    if (customer === signer) {
      // JSON-SERVER
      // axios.get('http://localhost:5000/magazines', { address: magazine_address })
      // FIREBASE
      findMagazine(magazine_address).then((response) => {
        if(response.exists()){
          let ipfsURL = response.val().content;

          Swal.fire({
            title: "Ordine ricevuto!",
            text: "Puoi visitare il numero che hai appena acquistato qui: \n" + ipfsURL,
            icon: "success",
            showConfirmButton: true,
            confirmButtonColor: "#3085d6"
          });
          console.log("Buy Order Event: { magazine_address: " + magazine_address + "}");
        }
      });
    }

  });

  //ABBONAMENTO
  contractInstance.on("SubscriptionOrder", (customer, expire_date, event) => {
    if (customer === signer) {
      Swal.fire({
        title: "Abbonamento effettuato!",
        text: "Il tuo abbonamento scadra il: " + formatExpireDate(Number(expire_date)) + ". \nPremi OK per ricaricare la pagina",
        icon: "success",
        showConfirmButton: true,
        confirmButtonColor: "#3085d6"
      }).then((result) => {
        if(result.isConfirmed){
          window.location.reload();
        }
      });
      // console.log("Subscription Order Event: { cliente: " + customer + ", expire_date: " + expire_date + "}");
    }
  });

  //NUOVO MAGAZINE
  contractInstance.on("NewMagazine", (magazine_address, event) => {
    // JSON-SERVER
    // axios.post('http://localhost:5000/magazines', { address: magazine_address, cover: "", content: "", summary: "" })
    // FIREBASE
    createMagazine(magazine_address).then(response => {
        Swal.fire({
          title: "Nuovo numero!",
          text: "Indirizzo del magazine: \n" + magazine_address + ". \nPremi OK per ricaricare la pagina",
          icon: "success",
          showConfirmButton: true,
          confirmButtonColor: "#3085d6"
        }).then((result) => {
          if(result.isConfirmed){
            window.location.reload();
          }
        });
      })
      .catch(error => console.log(error));
  });

  //RILASCIO MAGAZINE
  contractInstance.on("ReleaseMagazine", (magazine_address, event) => {
    //Update verso Firebase eseguito in simpleCard
    Swal.fire({
      title: "Nuovo numero rilasciato!",
      text: "Indirizzo del magazine: " + magazine_address + ". \nPremi OK per ricaricare la pagina",
      icon: "success",
      showConfirmButton: true,
      confirmButtonColor: "#3085d6"
    }).then((result) => {
      if(result.isConfirmed){
        window.location.reload();
      }
    });
    

    //DONAZIONE
    // contractInstance.on("Donation", (customer, value, event) => {
    //   if(customer === signer){
    //       Swal.fire({
    //         title: "Nuova donazione!",
    //         text: "customer: " + customer + " value: " + value,
    //         icon: "success",
    //         showConfirmButton: true,
    //         confirmButtonColor: "#3085d6"
    //       });
    //   }
    // });
  });


}

export async function getAllMagazines(): Promise<ContractResponse<Magazine>> {
  var magazines: Magazine[] = [];
  let lastIndex = 0;
  const FROM = 0;
  const TO = 12;
  try {
    if (contractInstance) {
      //Chiamare il countMagazine prima per determinare quanti magazine far comparire in home page
      // contractInstance.countMagazines().then((value: number) => {
      //   for(let i = value - 7; i < value; i++){...}
      // })
      for (let i = FROM; i < TO; i++) {
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
  } catch {
    //comporre l'errore e restituirlo come ContractResponse
    // return { responseMagazines: [], error: ErrorMessage.XX };
    // Spostare l'ultimo return prima del catch come readCustomerMagazine();
    console.log("reading all magazine - last index found:" + lastIndex);
  } finally {
    return { responseMagazines: magazines, error: "" };
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
      console.log("revokeSubscription action: " + ErrorMessage.TR);
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

    } catch (error) {
      console.log("buyMagazine action: " + ErrorMessage.TR);
      Swal.fire({
        title: "Qualcosa è andato storto!",
        icon: "error",
        text: "Si è verificato un errore durante l'acquisto del numero: Riprova più tardi.",
        showConfirmButton: true,
        confirmButtonColor: "#3085d6",
      })
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
        showConfirmButton: true,
        confirmButtonColor: "#3085d6",
      })
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
      console.log("annualSubscribe action: " + ErrorMessage.TR);
    }
  }
}

export async function withdraw(amount: string) {
  if (contractInstance) {
    try {

      return await contractInstance.withdraw(amount);

    } catch (error) {
      console.log("withdraw action: " + ErrorMessage.TR);
    }
  }
}

export async function splitProfit() {
  if (contractInstance) {
    try {
      
      return await contractInstance.splitProfit();

    } catch (error) {
      console.log("splitProfit action: " + ErrorMessage.TR);
    }
  }
}

export async function donateETH(value: number) {
  if (contractInstance) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      // const signerContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
  
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
      return false;
    }
  }
}


// const swalFire = (message: string) => {
//   Swal.fire({
//     title: "Qualcosa è andato storto!",
//     icon: "error",
//     text: message,
//     showConfirmButton: true,
//     confirmButtonColor: "#3085d6",
//   })
// }
