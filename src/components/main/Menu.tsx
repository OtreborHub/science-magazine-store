import { Dropdown } from '@mui/base/Dropdown';
import { Menu } from '@mui/base/Menu';
import { MenuButton as BaseMenuButton } from '@mui/base/MenuButton';
import { MenuItem as BaseMenuItem, menuItemClasses } from '@mui/base/MenuItem';
import { styled } from '@mui/system';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { addAdministrator, donateETH, readCustomer, revokeSubscription, splitProfit, withdraw } from '../../utilities/contractBridge';
import { NavbarProps } from '../../utilities/interfaces';
import { Role } from '../../utilities/role';
import { useSearchContext } from '../../Context';
import { useAppContext } from '../../Context';
import { formatBalance } from '../../utilities/helper';
import { ethers } from 'ethers';
import Loader from '../Loader';

export default function DropdownMenu({ connect: connectWallet }: NavbarProps) {
    const [hasSubscription, setHasSubscription] = useState<boolean>(false)
    const searchContext = useSearchContext();
    const appContext = useAppContext();

    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
      if(appContext.role === Role.CUSTOMER){
        getSubscription();
      }
    }, [appContext.provider, appContext.role])
  
    async function getSubscription() {
      try {
        const customerResult = await readCustomer();
        setHasSubscription((customerResult[2]));
      } catch {
        Swal.fire({
          title: "Opss...", 
          text: "Qualcosa è andato storto durante il recupero delle informazioni dal contratto.\nRiprova più tardi.", 
          icon: "error",
          confirmButtonColor: "#3085d6"
        })
      }
    }
  
  function withdrawBalance() {
    let minWithdraw = 0.00000001;
    let balance = parseFloat(ethers.formatEther(appContext.contractBalance));
    if (balance === 0 || balance < minWithdraw) {
      Swal.fire({
        title: "Impossibile eseguire l'operazione",
        text: "Attenzione, attualmente sul contratto sono presenti meno di: " + minWithdraw + " ETH",
        icon: "error",
        showCloseButton: true
      })
    } 
    else {
      const inputValue = 0.00000000;
      const inputStep = 0.00000001;
      const placeholder = "Max " + balance.toFixed(8) + " ETH";

      Swal.fire({
        title: "Prelievo",
        text: "Scegli una quantità in ETH da prelevare dal contratto",
        icon: "question",
        html: `
          <p>Scegli una quantità in ETH da prelevare dal contratto</p>
          <input
            type="number"
            placeholder="${placeholder}"
            value="${inputValue} ETH"
            step="${inputStep}"
            class="swal2-input"
            id="range-value">`,
        input: 'range',
        inputValue,
        inputAttributes: {
          min: '0',
          max: (balance.toFixed(8)),
          step: inputStep.toString(),
        },
        confirmButtonColor: "#3085d6",
        showCancelButton: true,
        showCloseButton: true,
        didOpen: () => {
          const inputRange = Swal.getInput()!
          const inputNumber = Swal.getPopup()!.querySelector('#range-value') as HTMLInputElement

          Swal.getPopup()!.querySelector('output')!.style.display = 'none'
          inputRange.style.width = '100%'

          // sync input[type=number] con input[type=range]
          inputRange.addEventListener('input', () => {
            inputNumber.value = inputRange.value
          })

          // sync input[type=range] con input[type=number]
          inputNumber.addEventListener('change', () => {
            inputRange.value = inputNumber.value
          })
        },

      }).then(async (result) => {
        if (result.isConfirmed && result.value > 0 && result.value < appContext.contractBalance) {
          setIsLoading(true);
          withdraw(result.value).then((res)=> {
            setIsLoading(false);
            Swal.fire({
              title: "Prelievo avvenuto con successo!", 
              text: "", 
              icon: "success",
              confirmButtonColor: "#3085d6"
            });
          });
        }
      })
    }
  }

  function split() {
    let minWithdraw = 0.00000001;
    let balance = parseFloat(ethers.formatEther(appContext.contractBalance));
    if (balance === 0 || balance < minWithdraw) {
      Swal.fire({
        title: "Impossibile eseguire l'operazione",
        text: "Attenzione, Attualmente sul contratto sono presenti meno di: " + minWithdraw + " ETH",
        icon: "error",
        confirmButtonColor: "#3085d6",
        showCloseButton: true
      })
    } 
    else {
      Swal.fire({
        title: "Dividi Profitto",
        text: "Proseguendo dividerai il bilancio del contratto con i tuoi collaboratori, sei sicuro?",
        confirmButtonColor: "#3085d6",
        showCancelButton: true,
        showCloseButton: true
      }).then(async (result) => {
        if (result.isConfirmed) {
          setIsLoading(true);
          splitProfit().then((res)=> {
            Swal.fire("Split profit avvenuto con successo!", "", "success");
            setIsLoading(false);
          });
        }
      })
    }
  }

  function addAdmin() {
    Swal.fire({
      title: "Aggiungi admin",
      input: "text",
      text: "Inserisci l'indirizzo del wallet da aggiungere come admin",
      inputPlaceholder: "Address 0x00...",
      confirmButtonColor: "#3085d6",
      showCancelButton: true,
      showCloseButton: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        if(result.value !== "" && result.value.includes("0x")){
          setIsLoading(true);
          addAdministrator(result.value).then((res)=> {
            Swal.fire("Admin aggiunto con successo!", "", "success");
            setIsLoading(false);
          });
        } else {
          Swal.fire("Indizzo non valido!", "", "error");
        }
      } 
    })
  }

  function revoke() {
    if (appContext.balance > 0) {
      Swal.fire({
        title: "Aspetta...",
        text: "Sei sicuro di voler revocare l'abbonamento? :(",
        icon: "question",
        confirmButtonColor: "#3085d6",
        showCancelButton: true,
        showCloseButton: true
      }).then(async (result) => {
        if (result.isConfirmed) {
          setIsLoading(true);
          revokeSubscription().then((res)=> {
            setIsLoading(false);
            Swal.fire("A presto!", "", 'success');
          });
        }
      })
    }
  }

  function donate() {
    if (appContext.balance > 0) {
        let minDonation = 0.0002;
        let balance = appContext.balance;
        if (balance > 0 && balance > minDonation) {
          const inputValue = 0.0002
          const inputStep = 0.00001
          const placeholder = "Max " + balance.toFixed(4) + " ETH";
    
          Swal.fire({
            title: "Donazione",
            // text: "Scegli una quantità in ETH da donare a Innovation Technology!",
            icon: "question",
            html: `
              <p>Scegli una quantità in ETH da donare a Innovation Technology!</p>
              <input
                type="number"
                placeholder="${placeholder}"
                value="${inputValue} ETH"
                step="${inputStep}"
                class="swal2-input"
                id="range-value">`,
            input: 'range',
            inputValue,
            inputAttributes: {
              min: '0',
              max: (balance.toFixed(4)),
              step: inputStep.toString(),
            },
            confirmButtonColor: "#3085d6",
            showCancelButton: true,
            showCloseButton: true,
            didOpen: () => {
              const inputRange = Swal.getInput()!
              const inputNumber = Swal.getPopup()!.querySelector('#range-value') as HTMLInputElement
    
              Swal.getPopup()!.querySelector('output')!.style.display = 'none'
              inputRange.style.width = '100%'
    
              inputRange.addEventListener('input', () => {
                inputNumber.value = inputRange.value
              })
    
              inputNumber.addEventListener('change', () => {
                inputRange.value = inputNumber.value
              })
            },
    
          }).then(async (result) => {
            if (result.isConfirmed && result.value > 0 && result.value < appContext.balance) {
              setIsLoading(true);
              donateETH(result.value).then((res)=> {
                setIsLoading(false);
                if(res){
                  Swal.fire({
                    icon: "success",
                    title: "Grazie mille!",
                    text: "Il tuo aiuto è molto apprezzato da tutto il team di Technology Innovation!",
                    confirmButtonColor: "#3085d6",
                    showCloseButton: true
                  })
                } else {
                  Swal.fire({
                    title: "Qualcosa è andato storto!",
                    icon: "error",
                    text: "Si è verificato un errore durante l'invio della donazione.",
                    confirmButtonColor: "#3085d6",
                  })
                }
              });
            }
          })
        } else {
          Swal.fire({
            title: "Errore",
            text: "Attenzione, il tuo bilancio è inferiore alla donazione minima di: " + minDonation + " ETH",
            showCloseButton: true
          })
        }
      }
  }

  return (
    <>
    <Dropdown>
      <MenuButton>{appContext.role}</MenuButton>

        {appContext.role === Role.CUSTOMER &&
        <Menu slots={{ listbox: Listbox }}>
            <MenuItem  onClick={() => searchContext.search()}>Magazine acquistati</MenuItem>
            { hasSubscription && 
                <MenuItem sx={{ color: "red" }} onClick={() => revoke()}>Revoca abbonamento</MenuItem>
            }
            <hr/>
            <MenuItem onClick={() => donate()}>Considera una donazione!</MenuItem>
        </Menu>
        }


        {appContext.role === Role.OWNER &&
        <Menu slots={{ listbox: Listbox }}>
            <MenuItem>{"Contract Balance "  + formatBalance(appContext.contractBalance) + " ETH"} </MenuItem>
            <hr/>
            <MenuItem  onClick={() => withdrawBalance()}>Preleva</MenuItem>
            <MenuItem onClick={() => split()}>Dividi profitto</MenuItem>
            <MenuItem onClick={() => addAdmin()}>Aggiungi Admin</MenuItem>
        </Menu>
        }  

        { appContext.role === Role.VISITOR && 
          <Menu slots={{ listbox: Listbox }}>
            <MenuItem onClick={() => donate()}>Considera una donazione!</MenuItem>
          </Menu>
        } 
      
    </Dropdown>
    <Loader loading={isLoading} />
    </>
  );
}

const blue = {
  50: '#F0F7FF',
  100: '#C2E0FF',
  200: '#99CCF3',
  300: '#66B2FF',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E6',
  700: '#0059B3',
  800: '#004C99',
  900: '#003A75',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

const Listbox = styled('ul')(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  box-sizing: border-box;
  padding: 6px;
  margin: 12px 0;
  min-width: 200px;
  border-radius: 12px;
  overflow: auto;
  outline: 0px;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  box-shadow: 0px 4px 6px ${
    theme.palette.mode === 'dark' ? 'rgba(0,0,0, 0.50)' : 'rgba(0,0,0, 0.05)'
  };
  z-index: 1;
  `,
);

const MenuItem = styled(BaseMenuItem)(
  ({ theme }) => `
  list-style: none;
  padding: 8px;
  border-radius: 8px;
  cursor: default;
  user-select: none;

  &:last-of-type {
    border-bottom: none;
  }

  &:focus {
    outline: 3px solid ${theme.palette.mode === 'dark' ? blue[600] : blue[200]};
    background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[100]};
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  }

  &.${menuItemClasses.disabled} {
    color: ${theme.palette.mode === 'dark' ? grey[700] : grey[400]};
  }
  `,
);

const MenuButton = styled(BaseMenuButton)(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.5;
  padding: 8px 16px;
  border-radius: 8px;
  color: white;
  transition: all 150ms ease;
  cursor: pointer;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

  &:hover {
    background: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
    border-color: ${theme.palette.mode === 'dark' ? grey[600] : grey[300]};
  }

  &:active {
    background: ${theme.palette.mode === 'dark' ? grey[700] : grey[100]};
  }

  &:focus-visible {
    box-shadow: 0 0 0 4px ${theme.palette.mode === 'dark' ? blue[300] : blue[200]};
    outline: none;
  }
  `,
);