import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Box, Button, Grid, Typography, useMediaQuery } from "@mui/material";
import Swal from "sweetalert2";
import '../../styles/user.css';
import { addMagazine, emptyMagazine, readMagazineByAddress } from "../../utilities/contractBridge";
import { AdminProps, Magazine } from "../../utilities/interfaces";
import SimpleCard from "../cards/SimpleCard";
import SearchForm from '../SearchForm';
import { useEffect, useState } from 'react';
import ComplexCard from '../cards/ComplexCard';

export default function AdminView({ notReleasedNumbers, releasedNumbers }: AdminProps) {
  const isMobile = useMediaQuery('(max-width: 750px)');
  const [searchedMagazine, setSearchedMagazine] = useState<Magazine>(emptyMagazine);

  useEffect(() => {
    if(searchedMagazine !== emptyMagazine){
      document.getElementById('found-card')?.scrollIntoView({
        behavior: "smooth"
      });
    }

  }, [searchedMagazine])

  
  function newMagazine() {
    Swal.fire({
      title: "Nuovo numero",
      text: "Scegli un titolo per il nuovo numero",
      input: "text",
      showConfirmButton: true,
      confirmButtonColor: "#3085d6",
      showCloseButton: true,
      showCancelButton: true
    }).then(async (result) => {
      if (result.value !== "" && result.isConfirmed) {
        addMagazine(result.value);
      }
    })
  }



  const handleSearch = (event: any) => {
    let magazine_address = event.target.address.value;
    if(magazine_address !== ""){
      readMagazineByAddress(magazine_address).then((response) => {
        let magazines = response.responseMagazines;
        if(magazines.length > 0){
          setSearchedMagazine(magazines[0]);
        } else {
          swalError();    
        }
      });
    } else {
      swalError();
    }
    event.preventDefault();
  }
  
  const swalError = () => Swal.fire({
    title: "Opsss..",
    icon: "error",
    text: "Qualcosa è andato storto, ricontrolla l'indirizzo inserito o riprova più tardi!",
    showConfirmButton: true,
    confirmButtonColor: "#3085d6",
  });

  const handleClear = () => {
    setSearchedMagazine(emptyMagazine);
  }


  return (
    <>
      {/* NUMERI DA RILASCIARE */}
      <Typography variant="h4" textAlign={"left"} marginLeft={"2rem"} fontFamily={"sans-serif"}> Numeri da rilasciare</Typography>
      <Box className="card-div" paddingBottom={"2rem"}>
        <Grid container spacing={isMobile ? 4 : 2} sx={{ margin: "1rem" }}>
          {notReleasedNumbers.map(el =>
            <Grid height={"100%"} item key={el.address} xs={6} md={4} xl={3}>
              <SimpleCard
                address={el.address}
                title={el.title}
                release_date={el.release_date}
                content={el.content}
                cover={el.cover}
                summary={el.summary}
              />
            </Grid>
          )}
          <Grid item sx={{ alignSelf: "center" }} xs={6} md={4} xl={3}>
          <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ backgroundColor: "#e6c830", color: "black", borderRadius: "10px"}}
                  onClick={() => newMagazine()}
                  endIcon={<AddCircleIcon />}>
                  <strong>NUOVO</strong>
          </Button>
            {/* <IconButton size="large" onClick={() => newMagazine()}>
                <AddCircleIcon fontSize="large" htmlColor="#e6c830" />
            </IconButton> */}
          </Grid>
        </Grid>
      </Box>

      {/* NUMERI RILASCIATI */}
      <Typography variant="h4" textAlign={"left"} marginLeft={"2rem"} fontFamily={"sans-serif"}> Numeri rilasciati</Typography>
      <Box className="card-div" paddingBottom={"2rem"}>
        <Grid container spacing={isMobile ? 4 : 2} sx={{ margin: "1rem" }}>
          {releasedNumbers.map(el =>
            <Grid item key={el.address} xs={6} md={4} xl={3}>
              <SimpleCard
                address={el.address}
                title={el.title}
                release_date={el.release_date}
                content={el.content}
                cover={el.cover}
                summary={el.summary}
              />
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Ricerca */}
      <Typography className='anta-regular' variant="h3" textAlign={"center"}> Ricerca per indirizzo </Typography>
      <SearchForm handleSearch={handleSearch} handleClear={handleClear}/>
      <div id="found-card" className="found-card-div">
          {searchedMagazine !== emptyMagazine &&
                  <ComplexCard
                      magazine={searchedMagazine}
                      singlePrice={0.00}
                      owned={true}/>
          }
      </div>
    </>
  );
}