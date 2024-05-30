import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';
import { Box, Button, IconButton } from '@mui/material';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { releaseMagazine } from '../../utilities/contractBridge';
import { findMagazine, updateMagazine } from '../../utilities/firebase';
import { Magazine } from '../../utilities/interfaces';
import Loader from '../Loader';

const IPFSBaseUrl: string = process.env.REACT_APP_IPFS_BASEURL as string;

export default function SimpleCard({address, title, release_date}: Magazine) {
  const valid = release_date > 0;
  
  const [summary, setSummary] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    //Firebase data
    findMagazine(address).then(
      response => {
        if(response.exists()) {
          setSummary(response.val().summary);
          setContent(response.val().content);
        }
      })
  }, [])
  
  const formatNumberAddress = (address: string) => {
    return address.substring(0, 7) + "..." + address.substring(address.length - 5, address.length)
  }

  const formatReleaseDate = (release_date: number) => {
    return new Date(release_date)
    .toLocaleDateString("it-IT", {year: "numeric", day: "2-digit", month: "2-digit"})
    .replaceAll("/", "-");
  }

  function copyToClipboard(){
    setCopied(true);
    navigator.clipboard.writeText(address);
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const swalContent = `
  <label for="cover">Cover: </label><br>
  <input id="cover" class="swal2-input mb" placeholder="coverCID?filename"><br>
  <label for="content">Contenuto PDF: </label><br>
  <input id="content" class="swal2-input mb" placeholder="contentCID?filename"><br>
  <label for="summary">Sommario: </label><br>
  <textarea id="summary" class="swal2-textarea mb" placeholder="Scrivi un breve sommario del contenuto del numero"></textarea>
  `;
  
  function release() {
    Swal.fire({
      title: 'Inserisci i dettagli del numero dal rilasciare',
      html: swalContent,
      focusConfirm: false,
      confirmButtonColor: "#3085d6",
      showCloseButton: true,
      showCancelButton: true,
      preConfirm: () => ({
        cover: (document.getElementById('cover') as HTMLInputElement).value,
        content: (document.getElementById('content') as HTMLInputElement).value,
        summary: (document.getElementById('summary') as HTMLTextAreaElement).value,
      }),
    }).then((result) => {
      if(result.isConfirmed){
        let coverURL = result.value.cover;
        let contentURL = result.value.content;
        let summary = result.value.summary;
        if(inputValidation(coverURL, contentURL, summary)){
          setIsLoading(true);
          releaseMagazine(address).then((result) => {
            saveReleasedMagazine( coverURL, contentURL, summary );
          });
        } else {
          Swal.fire({
            title: "Parametri di input non validi", 
            text: "Ricorda che i primi due campi devono essere risorse IPFS.", 
            icon: "error",
            confirmButtonColor: "#3085d6"
          });
        }
      }

    });
    
    console.log("release magazine: " + address);
  }

  function read(){
    const pdfUrl = IPFSBaseUrl + content;
    const cid = content.split("?")[0];
    const name = content.split("?")[1];
    console.log("opening " + cid + " filename: " + name)
    window.open(pdfUrl, "_blank");
  }

  async function saveReleasedMagazine(cover: string, content: string, summary: string){
    //Firebase data
    const findResult = await findMagazine(address);
    if(findResult.exists()){
      await updateMagazine(address, cover, content, summary)
      setIsLoading(false);
    }
  }

  const inputValidation = (cover: string, content: string, summary: string) => {
    const isValidUrl = (url: string) => url !== "" && url.includes(IPFSBaseUrl) && url.includes("?filename");
    return isValidUrl(cover) && isValidUrl(content) && summary !== "";
  }

  return (
    <>
    <Card sx={{boxShadow: "5px 5px #888888", border: "2px solid", borderColor: "black"}}>
      <CardHeader
        title={title}
        subheader={
          <>
            { valid &&
              <Typography variant="body2" color="text.secondary">
                {formatReleaseDate(release_date)}
              </Typography>
            }
            <Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"}>
            <Typography variant="body2" color="text.secondary">
              Address: {formatNumberAddress(address)} 
            </Typography>
            <IconButton aria-label="copy" onClick={() => copyToClipboard()}>
              { copied && <DoneIcon fontSize='small' />}
              { !copied && <ContentCopyIcon fontSize='small' />}
            </IconButton>
            </Box>
        </>
        }
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {summary}
        </Typography>
      </CardContent>
      <CardActions>
        { !valid && 
          <Button
              onClick={release}
              variant="contained"
              color="success"
              style={{ width: "100%", marginTop: "1rem", marginBottom: "1rem", backgroundColor: "#e6c830", color: "black"}}>
              <strong>Rilascia</strong>
          </Button>
        }
        { valid && 
        <Button
            onClick={read}
            variant="contained"
            color="primary"
            style={{ width: "100%", marginTop: "1rem"}}>
            Sfoglia
        </Button>
        }
      </CardActions>
    </Card>
    <Loader loading={isLoading}/>
    </>
  );

}