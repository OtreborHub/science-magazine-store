import { Search } from "@mui/icons-material";
import { Button, Checkbox, FormControl, FormControlLabel, Grid, IconButton, Input, InputLabel, MenuItem, Select } from '@mui/material';
import InputBase from '@mui/material/InputBase';
import { styled } from '@mui/material/styles';
import { ChangeEvent, useEffect, useState } from "react";
import { SearchProps } from "../../utilities/interfaces";
import { useSearchContext, useAppContext } from '../../Context';
import { Role } from "../../utilities/role";
import ClearIcon from '@mui/icons-material/Clear';

export default function SearchForm({ handleSearch, handleClear } : SearchProps) {

    const [checked, setChecked] = useState(false);
    const [month, setMonth] = useState<number>(0);
    const [year, setYear] = useState<number>(0);
    const [addressValue, setAddressValue] = useState<string>("");
    const appContext = useAppContext();
    const searchContext = useSearchContext();

    useEffect(() => {
      if(searchContext.searched){
        setChecked(true);
        setYear(0);
        setMonth(0);
      }
    },[searchContext.searched])

    const isUser = appContext.role === Role.CUSTOMER || appContext.role === Role.VISITOR;

    const handleCheck = (event: ChangeEvent<HTMLInputElement>) => {
      setChecked(event.target.checked);
    };

    const handleText = (event: ChangeEvent<HTMLInputElement>) => {
      setAddressValue(event.target.value);
    }

    const clear = (event: any) => {
      setAddressValue("");
      setYear(0);
      setMonth(0);
      setChecked(false);
      handleClear(event);
    }

    const search = (event: any) => {
      handleClear(event);
      setAddressValue("");
      handleSearch(event);
    }

    const BootstrapInput = styled(InputBase)(({ theme }) => ({
      'label + &': {
        marginTop: theme.spacing(2),
      },
      '& .MuiInputBase-input': {
        backgroundColor: 'white',
        padding: '10px 26px 10px 12px',
      },
    }));

    return (
        <form onSubmit={search}>
          <Grid container 
          paddingTop={"2rem"}
          paddingBottom={"2rem"} 
          display={"flex"} 
          color={"white"}
          flexDirection={"row"} 
          alignItems={"center"}
          spacing={2} 
          justifyContent={"center"}>
              { isUser && 
              <>
              <Grid item>
                 <FormControlLabel
                     control={<Checkbox checked={checked} sx={{color:"white"}} onChange={handleCheck}/>}
                     label="Solo acquistati"/>
              </Grid>

              <Grid item>
                <FormControl>
                  <InputLabel id="month-select"> Mese </InputLabel>
                  <Select
                      sx={{ m: 1.5, minWidth: 220, border: "2px solid" }}
                      id="month-select"
                      value={month}
                      variant='standard'
                      input={<BootstrapInput />}
                      onChange={(e) => setMonth(Number(e.target.value))}>
                      <MenuItem value={0}><em>--Vuoto--</em></MenuItem>
                      <MenuItem value={1}>Gennaio</MenuItem>
                      <MenuItem value={2}>Febbraio</MenuItem>
                      <MenuItem value={3}>Marzo</MenuItem>
                      <MenuItem value={4}>Aprile</MenuItem>
                      <MenuItem value={5}>Maggio</MenuItem>
                      <MenuItem value={6}>Giugno</MenuItem>
                      <MenuItem value={7}>Luglio</MenuItem>
                      <MenuItem value={8}>Agosto</MenuItem>
                      <MenuItem value={9}>Settembre</MenuItem>
                      <MenuItem value={10}>Ottobre</MenuItem>
                      <MenuItem value={11}>Novembre</MenuItem>
                      <MenuItem value={12}>Dicembre</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl>
                  <InputLabel id="month-select"> Anno </InputLabel>
                <Select
                    sx={{ m: 1.5, minWidth: 220, border: "2px solid"  }}
                    value={year}
                    variant='standard'
                    color='primary'
                    input={<BootstrapInput />}
                    onChange={(e) => setYear(Number(e.target.value))}>
                    <MenuItem value={0}><em>--Vuoto--</em></MenuItem>
                    <MenuItem value={2023} color='white'>2023</MenuItem>
                    <MenuItem value={2024} color='white'>2024</MenuItem>
                </Select>
                </FormControl>
              </Grid>
              </>
              }

              { !isUser && 
                <Grid item>
                <FormControlLabel
                    control={
                      <Input 
                        startAdornment={"Address: "}
                        id="address"
                        value={addressValue}
                        sx={{color:"white", padding:"5px", minWidth: "350px"}}
                        placeholder=" 0x00.."
                        onChange={handleText}/>
                    }
                    label=""/>
                </Grid>
              }
              <Grid item>
              <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ borderRadius: "10px"}}
                  endIcon={<Search/>}>
                  <strong>CERCA</strong>
              </Button>
              <IconButton color="primary" onClick={clear}>
                <ClearIcon/>
              </IconButton>
              </Grid>
            </Grid>
          </form>
    );
}