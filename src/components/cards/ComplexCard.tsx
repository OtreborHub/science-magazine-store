import { Button } from '@mui/material';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import '../../styles/card.css';
import { buyMagazine } from '../../utilities/contractBridge';
import { ComplexCardProps } from '../../utilities/interfaces';
import { getCover } from '../../utilities/mock';
import { formatReleaseDate } from '../../utilities/utils';


export default function ComplexCard({magazine, singlePrice, owned}: ComplexCardProps) {
  const valid = magazine.release_date > 0;
  const [cover, setCover] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const IPFSBaseUrl = process.env.REACT_APP_IPFS_BASEURL;
  
  useEffect(() => {
    axios.get("http://localhost:5000/magazines", { params: { address: magazine.address } })
    .then(response => {
      const magazines = response.data;
      if(magazines.length === 1) {
        setCover(magazines[0].cover);
        setSummary(magazines[0].summary);
        setContent(magazines[0].content);
      }
    })
  }, [])

  const formatNumberAddress = (address: string) => {
    return address.substring(0, 7) + "..." + address.substring(address.length - 5, address.length)
  }


  const formatETH = () => {
    return ethers.formatEther(singlePrice);
  }

  function buy() {
    Swal.fire({
      title: "Acquista numero",
      text: "Verranno inviati al contratto " + formatETH() + " ETH. Confermi l'acquisto?",
      showConfirmButton: true,
      confirmButtonColor: "#3085d6",
      showCancelButton: true,
      showCloseButton: true
    }).then(async (result) => {
      if (result.isConfirmed) {
          buyMagazine(magazine.address, singlePrice)
      }
    })
  }

  function read(){
    // const cid = content.split("?")[0];
    // const name = content.split("?")[1];
    const pdfUrl = IPFSBaseUrl + content;
    window.open(pdfUrl, "_blank");

  }

  const subheader = 
  ( <>
      {valid && 
      <Typography>
        Rilasciato il: {formatReleaseDate(magazine.release_date)}
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
    <Card 
    sx={{
    maxWidth: "550px",
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
        // image={cover}
        image={getCover(cover)}
        alt="Titolo da blockchain"
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
  );
}