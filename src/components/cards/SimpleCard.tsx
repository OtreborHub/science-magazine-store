import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';
import { Box, Button, IconButton } from '@mui/material';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { releaseMagazine } from '../../utilities/contractBridge';
import { Magazine } from '../../utilities/interfaces';
// import pdf from '../../assets/Mag1.pdf';

export default function SimpleCard({address, title, release_date}: Magazine) {
  const valid = release_date > 0;
  
  const [cover, setCover] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const IPFSBaseUrl = process.env.REACT_APP_IPFS_BASEURL;
  // const isMobile = useMediaQuery('(max-width: 750px)');

  useEffect(() => {
    
    axios.get("http://localhost:5000/magazines", { params: { address: address } })
    .then(response => {
      const magazines = response.data;
      if(magazines.length === 1) {
        setCover(magazines[0].cover);
        setSummary(magazines[0].summary);
        setContent(magazines[0].content);
      }
    });
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
      showConfirmButton: true,
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
        // if(inputValidation(coverURL, contentURL, summary)){
        if(mockValidation(coverURL, contentURL, summary)){
          releaseMagazine(address).then((result) => {
            saveReleasedMagazine( coverURL, contentURL, summary );
          });
        }
      }

    });
    
    console.log("release magazine: " + address);
  }

  // function download() {
  //   const cid = content.split("?")[0];
  //   const name = content.split("?")[1];
  //   console.log("Download file - cid: " + cid + " filename: " + name);
  //   axios.get(IPFSBaseUrl + content)
  //   .then(
  //     (response) => {
  //       if(response.status == 200){
  //         console.log("download successfull");
  //         response.data().then((blob:any) => {
  //           let url = window.URL.createObjectURL(blob);
  //           let a = document.createElement("a");
  //           a.href = url;
  //           a.download = `${name}.pdf`;
  //           a.click();
  //         });
  //       }
  //     }
  //   ).catch(
  //     (error) => {
  //       console.log("Errore durante il download della copia: " + error);
  //       Swal.fire({
  //         title: "Qualcosa è andato storto!",
  //         icon: "error",
  //         text: "Si è verificato un errore durante il download della copia: Riprova più tardi.",
  //         showConfirmButton: true,
  //         confirmButtonColor: "#3085d6",
  //       })
  //     }
  //   )
  // }

  function read(){
    // const cid = content.split("?")[0];
    // const name = content.split("?")[1];
    const pdfUrl = IPFSBaseUrl + content;
    window.open(pdfUrl, "_blank");

  }


  function saveReleasedMagazine(cover: string, content: string, summary: string){
    axios.get('http://localhost:5000/magazines', { params: { address: address } }).then((response) => {
      const magazine_id = response.data[0].id;
      axios.put('http://localhost:5000/magazines/'+ magazine_id, 
        { address: address, cover: cover, content: content, summary: summary },
      ).then(response => {
        console.log(response);
      })
      .catch(error => console.log("Impossibile salvare: " + error));
    })
  }

  const inputValidation = (cover: string, content: string, summary: string) => {
    if(cover !== "" && content !== "" && summary !== "" &&
      cover.toString().includes("http") && 
      content.toString().includes("http") &&
      cover.toString().includes("ipfs") &&
      content.toString().includes("ipfs")){
        return true;
      }
    return false;
  }

  const mockValidation = (cover: string, content: string, summary: string) => {
    return true;
  }

  return (
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
  );

}