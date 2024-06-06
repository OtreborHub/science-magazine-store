import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from "@mui/material/Box/Box";
import Button from "@mui/material/Button/Button";
import Collapse from "@mui/material/Collapse/Collapse";
import FormControlLabel from "@mui/material/FormControlLabel/FormControlLabel";
import IconButton from "@mui/material/IconButton/IconButton";
import Radio from "@mui/material/Radio/Radio";
import RadioGroup from "@mui/material/RadioGroup/RadioGroup";
import Typography from "@mui/material/Typography/Typography";
import { ethers } from 'ethers';
import { useState } from 'react';
import { formatDate, formatNumberAddress } from '../../utilities/helper';
import { MainFormProps } from '../../utilities/interfaces';

export default function MainForm({singlePrice, annualPrice, lastMagazine: lastNumber, handleSubmit}: MainFormProps) {
  const [radioValue, setRadioValue] = useState('annual');

  const [expandedAnnual, setExpandedAnnual] = useState<boolean>(false);
	const [expandedLatest, setExpandedLatest] = useState<boolean>(false);

  const handleChange = (event: any) => {
		setRadioValue(event.target.value);
	};

	const onExpandAnnual = () => {
		setExpandedAnnual(!expandedAnnual);
		if (expandedLatest) {
			setExpandedLatest(!expandedLatest);
		}
	};

	const onExpandLatest = () => {
		setExpandedLatest(!expandedLatest);
		if (expandedAnnual) {
			setExpandedAnnual(!expandedAnnual);
		}
	};

	const formatPrice = (value: number) => {
		if (!Number.isNaN(value)) {
			return ethers.formatEther(value);
		}
		return 0.00;
	}

  async function submit(event: any) {
    handleSubmit(event);
  }

  return (
    <form onSubmit={submit}>
    <RadioGroup
      aria-label="purchase"
      value={radioValue}
      onChange={handleChange}
      sx={{ marginLeft: "15%", marginRight: "15%" }}>
      <Box className="radio-option" textAlign={"center"} justifyContent={"space-between"}>

        <FormControlLabel
          value='annual'
          control={<Radio sx={{ color: "white" }} />}
          label={undefined} />
        <Typography
          variant="h5"
          fontFamily={"unset"}
        // color={"black"}
        >
          {"Abbonamento annuale "}<br />
          {formatPrice(annualPrice) + " ETH"}
        </Typography>
        <IconButton
          sx={{ color: "white" }}
          size="large"
          onClick={onExpandAnnual}
          aria-expanded={expandedAnnual}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>
      <Collapse in={expandedAnnual} timeout="auto" unmountOnExit>
        <Typography variant="body1">Per chi vuole rimanere sempre sul pezzo: <br /> Riceverai una copia della rivista digitale non appena sarà disponibile per un anno intero! </Typography>
      </Collapse>
      <Box className="radio-option" textAlign={"center"} justifyContent={"space-between"}>

        <FormControlLabel
          value='latest'
          control={<Radio sx={{ color: "white" }} />}
          label={undefined} />
        <Typography
          variant="h5"
          fontFamily={"unset"}
        >
          {"Ultima uscita "}<br />
          {formatPrice(singlePrice) + " ETH"}
        </Typography>
        <IconButton
          sx={{ color: "white" }}
          size="large"
          onClick={onExpandLatest}
          aria-expanded={expandedLatest}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>
      <Collapse in={expandedLatest} timeout="auto" unmountOnExit>
        <Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"}>
          <Typography variant="body1">{formatDate(lastNumber.release_date)}</Typography>
          <Typography variant="body1">{formatNumberAddress(lastNumber.address)}</Typography>
        </Box>
        <Typography variant="body1" fontWeight={"bold"}>{lastNumber.title}</Typography>
        <Typography variant="body1">{lastNumber.summary} </Typography>
      </Collapse>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        style={{ width: "100%", marginTop: "1rem", alignSelf: "center" }}>
        Acquista
      </Button>
    </RadioGroup>
  </form>
  )
}

