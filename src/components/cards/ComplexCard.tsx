import { Button } from '@mui/material';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Action } from '../../utilities/actions';
import { buyMagazine } from '../../utilities/contractBridge';
import { ErrorMessage, swalError } from '../../utilities/error';
import { findMagazine } from '../../utilities/firebase';
import { formatDate, formatNumberAddress } from '../../utilities/helper';
import { ComplexCardProps } from '../../utilities/interfaces';
import { getCover } from '../../utilities/mock';
import Loader from '../Loader';

const IPFSBaseUrl: string = process.env.REACT_APP_IPFS_BASEURL as string;

export default function ComplexCard({magazine, singlePrice, owned}: ComplexCardProps) {
  const valid = magazine.release_date > 0;
  const [cover, setCover] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    getMagazine();
  }, [])
  
  async function getMagazine(){
    try{
      //Firebase data
      const response = await findMagazine(magazine.address);
      if(response.exists()) {
        setCover(response.val().cover);
        setSummary(response.val().summary);
        setContent(response.val().content);
      }
    } catch {
      swalError(ErrorMessage.FE, Action.FIREBASE_DATA);
    }
  }

  const formatETH = () => {
    return ethers.formatEther(singlePrice);
  }

  function buy() {
    Swal.fire({
      title: "Acquista numero",
      text: "Verranno inviati al contratto " + formatETH() + " ETH. Confermi l'acquisto?",
      confirmButtonColor: "#3085d6",
      showCancelButton: true,
      showCloseButton: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        const success =  await buyMagazine(magazine.address, singlePrice);
        setIsLoading(false);  
        if(success){
          Swal.fire({
            title: "Ordine ricevuto!",
            text: "Grazie per l'acquisto, Il tuo fattorino digitale sarà da te tra qualche secondo.",
            icon: "success",
            confirmButtonColor: "#3085d6"
          })
          console.log("Magazine acquistato con successo");
          }else{
            console.log("Magazine non acquistato");
          }
        
      }
    })
  }

  function read(){
    const pdfUrl = content;
    const cid = content.split("?")[0];
    const name = content.split("?")[1];
    console.log("opening " + cid + " filename: " + name);
    if(pdfUrl.includes(IPFSBaseUrl)){
      window.open(pdfUrl, "_blank");
    } else {
      swalError(ErrorMessage.RD, Action.ADD_ADMIN);
    }
  }

  const subheader = 
  ( <>
      {valid && 
      <Typography>
        Rilasciato il: {formatDate(magazine.release_date)}
      </Typography>
      }
      { !valid && 
      <Typography>
        Non rilasciato
      </Typography>
    }
      <Typography>
        Address: {formatNumberAddress(magazine.address)}
      </Typography>
    </>
  );

  return (
    <>
    <Card 
    sx={{
    maxWidth: "500px",
    borderColor: "black", 
    transition: "0.3s",
    '&:hover': { 
      border: "2px solid", 
      transform: 'scale3d(1.05, 1.05, 1)',
      zIndex: 1,
    }}}>
      <CardHeader
        title={magazine.title}
        subheader={subheader}
      />
      <CardMedia
        sx={{ minHeight: "550px"}}
        component="img"
        // height="500"
        image={getCover(cover)}
        alt="Immagine di copertina"
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {summary}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
            onClick={ owned ? read : buy}
            variant="contained"
            color="primary"
            disabled = { valid ? false : true }
            style={{ width: "100%", marginTop: "1rem", alignSelf: "center" }}>
             {owned ? "Sfoglia" : "Acquista"}
        </Button>
      </CardActions>
    </Card>
    <Loader loading={isLoading}/>
    </>
  );
}