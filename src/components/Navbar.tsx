import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import logo from '../assets/logo.svg';
import { useAppContext } from '../Context';
import { NavbarProps } from '../utilities/interfaces';
import DropdownMenu from './Menu';
import { formatNumberAddress } from '../utilities/helper';

export default function Navbar({connect: connectWallet}: NavbarProps) {
  const appContext = useAppContext();
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar enableColorOnDark color='transparent' position="static">
        <Toolbar>
          <img src={logo} alt="Logo" style={{ maxHeight: '50px', marginRight: '10px' }}/>
          { appContext.provider && appContext.signer && appContext.balance ?
          <>
            <Typography variant="body1" component="div" color="#e0e012" sx={{ flexGrow: 1 }}>
              <DropdownMenu connect={connectWallet}/>
            </Typography>
          
            <Box textAlign={"center"}>
              <Typography variant="body1" mr="0.2rem" component="div" color="whitesmoke" sx={{ flexGrow: 1 }}>
                Address {formatNumberAddress(appContext.signer)}
              </Typography>
              <Typography variant="body1" component="div" color="whitesmoke" sx={{ flexGrow: 1 }}>
                Balance { (appContext.balance).toFixed(18) } ETH             
              </Typography>
            </Box> 
          </> 
          : <w3m-button loadingLabel='loading' />
        }
        </Toolbar>
      </AppBar>
    </Box>
  );
}