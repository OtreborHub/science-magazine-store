import { Box, Grid, Typography, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import { useSearchContext } from '../../Context';
import separator from '../../assets/separator.svg';
import '../../styles/view.css';
import { Action } from '../../utilities/actions';
import { annualSubscription, buyMagazine, readAllMagazines, readAnnualPrice, readCustomerMagazine, readSinglePrice } from '../../utilities/contractBridge';
import { ErrorMessage, swalError } from '../../utilities/error';
import { getFirstDayOfMonth, getLastDayOfMonth } from '../../utilities/helper';
import { Magazine, UserProps } from '../../utilities/interfaces';
import { getCover } from '../../utilities/mock';
import Loader from '../Loader';
import ComplexCard from '../cards/ComplexCard';
import MainForm from '../forms/MainForm';
import SearchForm from '../forms/SearchForm';

export default function UserView({ lastMagazine: lastNumber, releasedMagazines: releasedNumbers }: UserProps) {
	const [singlePrice, setSinglePrice] = useState<number>(0.00);
	const [annualPrice, setAnnualPrice] = useState<number>(0.00);
	const [searchedMagazines, setSearchedMagazined] = useState<Magazine[]>([]);
	const [searchMine, setSearchMine] = useState<boolean>(false);

	const [isLoading, setIsLoading] = useState<boolean>(false);

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

		if(searchedMagazines.length > 0){
			scrollDown()
		}
	}, [searchContext.searched, searchedMagazines, singlePrice, annualPrice])

	
  async function getPrices() {
		try {
			const single = await readSinglePrice();
			setSinglePrice(Number(single));
			
			const annual = await readAnnualPrice();
			setAnnualPrice(Number(annual));
		} catch {
			console.log("Errore durante il recupero dei prezzi");
			//swalError(ErrorMessage.RD, Action.RD_DATA);
		}
	}

	async function handleSubmit(event: any) {
		setIsLoading(true);
		if (event.target[0].checked === true) {
			annualSubscription(annualPrice).then((res) => {
				setIsLoading(false);
			})
		} else if (event.target[2].checked === true) {
			buyMagazine(lastNumber.address, singlePrice).then((res) => {
				setIsLoading(false);
			})
		} 
		event.preventDefault();
	};

	const scrollDown = () => {
		document.getElementById('search-ref')?.scrollIntoView({
			behavior: "smooth",
		});
	}

	const forceSearch = async () => {
		setIsLoading(true);
		const magazines = await readCustomerMagazine();
		if(magazines.length > 0){
			setSearchMine(true);
			setSearchedMagazined(magazines);
			//scrollDown();
		} else {
			Swal.fire("Nessun magazine trovato", "info");
		}
		setIsLoading(false);
	}

	const handleSearch = (event: any) => {
		const checked = event.target[0].checked;
		const month = event.target[1].value;
		const year = event.target[2].value;
		const dateFilter = month !== "0" && year !== "0";
		console.log("month: " + month + " year: " + year + " only acquired: " + checked);
		
		setIsLoading(true);
			if (checked) {
				searchCustomerMagazine(dateFilter, month, year)
			} else if (dateFilter) {
				searchMagazineByDate(month, year);
			} else {
				setIsLoading(false);
				swalError(ErrorMessage.IO, Action.SRC_USER_MAG);
			}

		event.preventDefault();
	}

	async function searchCustomerMagazine(dateFilter: boolean, month: number, year: number) {
		let magazines = await readCustomerMagazine();
		setIsLoading(false);
		if(magazines.length > 0){
			if (dateFilter) {
				const max_bound = getFirstDayOfMonth(year, month);
				const min_bound = getLastDayOfMonth(year, month - 1);
				magazines = magazines.filter(magazine =>
					magazine.release_date < max_bound &&
					magazine.release_date > min_bound
				);
			}
			setSearchMine(true);
			setSearchedMagazined(magazines);
		} else {
			console.log("Nessun magazine trovato");
		}

		
	}

	async function searchMagazineByDate(month: number, year: number){
		const max_bound = getFirstDayOfMonth(year, month);
		const min_bound = getLastDayOfMonth(year, month - 1);
		let magazines = await readAllMagazines();
		setIsLoading(false);
		if (magazines.length > 0) {
			magazines = magazines.filter(magazine =>
				magazine.release_date < max_bound &&
				magazine.release_date > min_bound
			);
			setSearchMine(false);
			setSearchedMagazined(magazines);
		} else {
			console.log("Nessun magazine trovato");
		}
	}

	const handleClear = () => {
		setSearchedMagazined([]);
		setSearchMine(false);
	}

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
							<Typography variant="h5" fontFamily={"unset"}>
								 {"Il primo Blockchain Magazine a tema innovazione scentifica e futuro della tecnologia"}
							</Typography>
						</Box>
						<MainForm 
							singlePrice={singlePrice} 
							annualPrice={annualPrice} 
							lastMagazine={lastNumber} 
							handleSubmit={handleSubmit}/>
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