import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import logo from '../assets/logo.svg';
import { NavbarProps } from '../utilities/interfaces';
import { formatNumberAddress } from '../utilities/utils';
import DropdownMenu from './Menu';
import { useAppContext } from '../Context';


export default function Navbar({connect: connectWallet, signer}: NavbarProps) {
// export default function Navbar({provider, signer, role, balance, contractBalance, connect: connectWallet}: NavbarProps) {
  const appContext = useAppContext();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar enableColorOnDark color='transparent' position="static">
        <Toolbar>
          <img src={logo} alt="Logo" style={{ maxHeight: '50px', marginRight: '10px' }}/>
          { appContext.provider && appContext.signer && appContext.balance ?
          <>
            <Typography variant="body1" component="div" color="#e0e012" sx={{ flexGrow: 1 }}>
              <DropdownMenu 
                  // provider={provider}
                  connect={connectWallet}
                  signer={signer}
                  // balance={balance}
                  // contractBalance={contractBalance}
                  // role={role}
                  />

            </Typography>
          
            <div>
              <Typography variant="body1" mr="0.2rem" component="div" color="whitesmoke" sx={{ flexGrow: 1 }}>
                Address {formatNumberAddress(appContext.signer)}
              </Typography>
              <Typography variant="body1" component="div" color="whitesmoke" sx={{ flexGrow: 1 }}>
                Balance {(appContext.balance).toFixed(4)} ETH
              </Typography>
            </div> 
          </> : <w3m-button />
        // <Button variant="contained" color="primary" onClick={() => connectWallet()}>Connect Wallet</Button>
        }
        </Toolbar>
      </AppBar>
    </Box>
  );
}