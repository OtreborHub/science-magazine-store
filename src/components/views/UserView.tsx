import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, FormControlLabel, Grid, IconButton, Radio, RadioGroup, Typography, useMediaQuery } from "@mui/material";
import Collapse from '@mui/material/Collapse';
import { ethers } from 'ethers';
import { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import { useSearchContext } from '../../Context';
import { annualSubscription, buyMagazine, readAllMagazines, readAnnualPrice, readCustomerMagazine, readMagazineCount, readSinglePrice } from '../../utilities/contractBridge';
import { Magazine, UserProps } from '../../utilities/interfaces';
import { getCover } from '../../utilities/mock';
import { formatDate, formatNumberAddress, getFirstDayOfMonth, getLastDayOfMonth } from '../../utilities/helper';
import Loader from '../Loader';
import separator from '../../assets/separator.svg';
import SearchForm from '../main/SearchForm';
import ComplexCard from '../cards/ComplexCard';
import '../../styles/view.css';

// const IPFSBaseUrl: string = process.env.REACT_APP_IPFS_BASEURL as string;

export default function UserView({ lastNumber, releasedNumbers }: UserProps) {
	const [singlePrice, setSinglePrice] = useState<number>(0.00);
	const [annualPrice, setAnnualPrice] = useState<number>(0.00);
	const [radioValue, setRadioValue] = useState('annual');

	const [searchedMagazines, setSearchedMagazined] = useState<Magazine[]>([]);
	const [searchMine, setSearchMine] = useState<boolean>(false);

	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [expandedAnnual, setExpandedAnnual] = useState<boolean>(false);
	const [expandedLatest, setExpandedLatest] = useState<boolean>(false);

	const searchContext = useSearchContext();
	const isMobile = useMediaQuery('(max-width: 750px)');

	useEffect(() => {
		if (singlePrice === 0.00 && annualPrice === 0.00) {
				getPrices();
		}

		if (searchContext.searched) {
			setSearchedMagazined([]);
			forceSearch();
		}


	}, [searchContext.searched, singlePrice, annualPrice])

	async function getPrices() {
		try {
			const single = await readSinglePrice();
			setSinglePrice(Number(single));

			const annual = await readAnnualPrice();
			setAnnualPrice(Number(annual));
		} catch {
			swalError();
		}
	}

	const handleChange = (event: any) => {
		setRadioValue(event.target.value);
	};

	async function handleSubmit(event: any) {
		console.log(radioValue);
		setIsLoading(true);
		if (radioValue === 'annual') {
			annualSubscription(annualPrice).then((res) => {
				setIsLoading(false);
			})
		} else {
			buyMagazine(lastNumber.address, singlePrice).then((res) => {
				setIsLoading(false);
			})
		}
		event.preventDefault();
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

	const formatETH = (value: number) => {
		if (!Number.isNaN(value)) {
			return ethers.formatEther(value);
		}
		return 0.00;
	}

	const scrollDown = () => {
		document.getElementById('search-ref')?.scrollIntoView({
			behavior: "smooth",
		});
	}

	const forceSearch = async () => {
		setIsLoading(true);
		try {
			const response = await readCustomerMagazine();
				let magazines = response.responseMagazines;
				if(magazines.length > 0){
					setSearchMine(true);
					setSearchedMagazined(magazines);
					scrollDown();
				} else {
					Swal.fire("Nessun magazine trovato", "info");
				}
		} catch {
			swalError();
		} finally {
			setIsLoading(false);
		}
	}

	const handleSearch = (event: any) => {
		const checked = event.target[0].checked;
		const month = event.target[1].value;
		const year = event.target[2].value;
		const dateFilter = month !== "0" && year !== "0";
		console.log("month: " + month + " year: " + year + " only acquired: " + checked);
		
		setIsLoading(true);
		try {

			if (checked) {
				readCustomerMagazine().then((response) => {
					let magazines = response.responseMagazines;
					if (dateFilter) {
						const max_bound = getFirstDayOfMonth(year, month);
						const min_bound = getLastDayOfMonth(year, month);
						magazines = response.responseMagazines.filter(number =>
							number.release_date < max_bound &&
							number.release_date > min_bound
						);
					}
					setSearchMine(true);
					setSearchedMagazined(magazines);
					setIsLoading(false);
				});
			} else if (dateFilter) {
				const max_bound = getFirstDayOfMonth(year, month);
				const min_bound = getLastDayOfMonth(year, month);
				readMagazineCount().then((count: number) => {
					readAllMagazines(count).then((response) => {
						if (response.responseMagazines.length > 0) {
							let magazines = response.responseMagazines.filter(number =>
								number.release_date < max_bound &&
								number.release_date > min_bound
							)
							setSearchedMagazined(magazines);
							setIsLoading(false);
						}
					});
				});
			} else {
				setIsLoading(false);
				Swal.fire({
					title: "Seleziona un criterio di ricerca",
					icon: "error",
					text: "Spunta 'solo acquistati' o riempi il mese e l'anno per effettuare una ricerca",
					confirmButtonColor: "#3085d6",
					showCloseButton: true
				});
			}

		} catch {
			setIsLoading(false);
			swalError();
		}

		event.preventDefault();
	}

	const handleClear = () => {
		setSearchedMagazined([]);
		setSearchMine(false);
	}

	const swalError = () => Swal.fire({
    title: "Opsss..",
    icon: "error",
    text: "Qualcosa è andato storto durante l'operazione.\n Riprova più tardi!",
    confirmButtonColor: "#3085d6",
  });

	return (
		<>
			{/* Ultima uscita */}
			<Box sx={{ maxWidth: "75%", margin: "auto", marginTop: "1rem", marginBottom: "2rem" }}>

				<Grid container>
					<Grid item
						xs={12}
						md={6}
						xl={6}
						textAlign={"center"}>

						<img className="last-number-cover"
							src={getCover(lastNumber.cover)}
							height={isMobile ? "350px" : "500px"}
							alt="Ultima uscita" />

					</Grid>
					<Grid item
						// border={1}
						xs={12}
						md={6}
						xl={6}
						display={"flex"}
						flexDirection={"column"}
						marginTop={isMobile ? "2rem" : "0rem"}
						justifyContent={"center"}>
						<Box
							sx={{ marginLeft: "8%", marginRight: "8%", marginBottom: "2rem", textAlign: "center" }}>
							{/* <Typography variant="h4" fontWeight={"bold"} fontFamily={"serif"}> {"\"Technology Innovation\""}</Typography> */}
							<Typography variant="h5" fontFamily={"unset"}> {"Il primo Blockchain Magazine a tema innovazione scentifica e futuro della tecnologia"}</Typography>
						</Box>
						<form onSubmit={handleSubmit}>
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
										{formatETH(annualPrice) + " ETH"}
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
									// color={"black"}
									>
										{"Ultima uscita "}<br />
										{formatETH(singlePrice) + " ETH"}
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
					</Grid>
				</Grid>
			</Box>

			{/* SEPARATORE */}
			<Box marginLeft={"2%"} textAlign={"center"}>
				<img className="" src={separator} height={"100px"} width={"90%"} />
			</Box>

			{/* Numeri precedenti */}
			<Typography className='anta-regular' variant="h3" textAlign={"center"} sx={{ cursor: 'default' }}> Dai un'occhiata ai numeri precedenti...</Typography>
			<Box className="card-div">
				<Grid container spacing={isMobile ? 4 : 2} sx={{ margin: "1rem", marginRight: "2rem" }}>
					{releasedNumbers.map(el => (el.address !== lastNumber.address) &&
						<Grid item key={el.address} xs={6} md={4} xl={3}>
							<ComplexCard
								magazine={el}
								singlePrice={singlePrice}
								owned={false}
							/>
						</Grid>
					)}
				</Grid>
			</Box>

			{/* SEPARATORE */}
			<Box marginLeft={"2%"} textAlign={"center"}>
				<img className="" src={separator} height={"100px"} width={"90%"} />
			</Box>

			{/* Ricerca */}
			<Typography id="search-ref" className='anta-regular' variant="h3" textAlign={"center"} sx={{ cursor: 'default' }}> ...O cerca il tuo preferito </Typography>
			<SearchForm handleSearch={handleSearch} handleClear={handleClear} />
			<div className="found-card-div">
				<Grid container spacing={isMobile ? 4 : 2} sx={{ margin: "1rem", marginRight: "2rem" }}>
					{searchedMagazines.map(el =>
						<Grid id="found-card" item key={el.address} xs={6} md={4} xl={3}>
							<ComplexCard
								magazine={el}
								singlePrice={singlePrice}
								owned={searchMine}
							/>
						</Grid>
					)}
				</Grid>
			</div>

			<Loader loading={isLoading} />
		</>
	);
}