import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Box, Button, Grid, Typography, useMediaQuery } from "@mui/material";
import { useEffect, useState } from 'react';
import Swal from "sweetalert2";
import '../../styles/view.css';
import { Action } from '../../utilities/actions';
import { addMagazine, emptyMagazine, readMagazineByAddress } from "../../utilities/contractBridge";
import { ErrorMessage, swalError } from '../../utilities/error';
import { addressValidation } from '../../utilities/helper';
import { AdminProps, Magazine } from "../../utilities/interfaces";
import Loader from '../Loader';
import ComplexCard from '../cards/ComplexCard';
import SimpleCard from "../cards/SimpleCard";
import SearchForm from '../forms/SearchForm';

export default function AdminView({ notReleasedMagazines: notReleasedNumbers, releasedMagazines: releasedNumbers }: AdminProps) {
  const isMobile = useMediaQuery('(max-width: 750px)');
  const [searchedMagazine, setSearchedMagazine] = useState<Magazine>(emptyMagazine);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      confirmButtonColor: "#3085d6",
      showCloseButton: true,
      showCancelButton: true
    }).then(async (result) => {
      if (result.value !== "" && result.isConfirmed) {
        setIsLoading(true);
        await addMagazine(result.value);
        setIsLoading(false);
      }
    })
  }

  const handleSearch = (event: any) => {
    let magazine_address = event.target.address.value;
    if(addressValidation(magazine_address)){
      setIsLoading(true);
      readMagazineByAddress(magazine_address).then((magazines) => {
        if(magazines.length > 0){
          setSearchedMagazine(magazines[0]);
        } else {
          Swal.fire("Nessun magazine trovato", "info");
        }
        setIsLoading(false);
      });
    } else {
      swalError(ErrorMessage.IO, Action.SRC_ADDR_MAG);    
    }
    event.preventDefault();
  }

  const handleClear = () => {
    setSearchedMagazine(emptyMagazine);
  }

  return (

    <>
      {/* NUMERI DA RILASCIARE */}
      <Typography variant="h4" textAlign={"left"} marginLeft={"2rem"} fontFamily={"sans-serif"} sx={{ cursor: 'default' }}> Numeri da rilasciare</Typography>
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
          </Grid>
        </Grid>
      </Box>

      {/* NUMERI RILASCIATI */}
      <Typography variant="h4" textAlign={"left"} marginLeft={"2rem"} fontFamily={"sans-serif"} sx={{ cursor: 'default' }}> Numeri rilasciati</Typography>
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

      {/* RICERCA */}
      <Typography className='anta-regular' variant="h3" textAlign={"center"} sx={{ cursor: 'default' }}> Ricerca per indirizzo </Typography>
      <SearchForm handleSearch={handleSearch} handleClear={handleClear}/>
      <div id="found-card" className="found-card-div">
          {searchedMagazine !== emptyMagazine &&
                  <ComplexCard
                      magazine={searchedMagazine}
                      singlePrice={0.00}
                      owned={true}/>
          }
      </div>

      <Loader loading={isLoading}/>
    </>
  );
  
}