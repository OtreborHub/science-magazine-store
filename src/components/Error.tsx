import "../styles/error.css";
import { ErrorProps } from "../utilities/interfaces";

export default function Error({errorMessage}: ErrorProps) {


    return (
        <div className="error-div">
            {errorMessage}
        </div>
    )
}