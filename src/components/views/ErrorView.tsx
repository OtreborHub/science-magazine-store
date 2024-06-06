import Typography from "@mui/material/Typography/Typography";
import "../../styles/error.css";
import { ErrorProps } from "../../utilities/interfaces";

export default function ErrorView({errorMessage}: ErrorProps) {
	return (
		<>
		<Typography 
				className="anta-regular" 
				variant="h2" 
				paddingTop={"3rem"} 
				paddingBottom={"3rem"} 
				textAlign={"center"}
				color={"whitesmoke"}>
				TECHNOLOGY INNOVATION
		</Typography>

		<div className="error-div">
				{errorMessage}
		</div>
		</>
	)
}