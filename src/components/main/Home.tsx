import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppContext } from "../../Context";
import { emptyMagazine, readAllMagazines, readMagazineCount } from "../../utilities/contractBridge";
import { findMagazine } from "../../utilities/firebase";
import { Magazine } from '../../utilities/interfaces';
import { Role } from "../../utilities/role";
import AdminView from "../views/AdminView";
import UserView from "../views/UserView";
import '../../styles/home.css';

export default function Home() {
  const [lastNumber, setLastNumber] = useState<Magazine>(emptyMagazine);
  const [releasedNumbers, setReleasedNumbers] = useState<Magazine[]>([]);
  const [notReleasedNumbers, setNotReleasedNumbers] = useState<Magazine[]>([]);
  
  const appContext = useAppContext();
  useEffect(() => {
    getMagazines();
  }, [appContext.role])

  async function getMagazines() {
    const count = await readMagazineCount();
    const result = await readAllMagazines(count);
    const notReleasedNumbers = result.responseMagazines.filter(number => number.release_date === 0);

    let lastNumber: Magazine = emptyMagazine;
    const releasedNumbers = result.responseMagazines
      .filter(number => number.release_date > 0)
      .sort((a, b) => b.release_date - a.release_date)
      .map((number, index) => {
        if (index === 0) {
          lastNumber = number;
        }
        return number;
      });
    
    if ((appContext.role === Role.CUSTOMER || appContext.role === Role.VISITOR) && lastNumber.address) {
      await fillLastNumberData(lastNumber);
    }
    setReleasedNumbers(releasedNumbers);
    setNotReleasedNumbers(notReleasedNumbers);

  }

  async function fillLastNumberData(number: Magazine) {
    const response = await findMagazine(number.address);
      if(response.exists()){
        number.cover = response.val().cover;
        number.summary = response.val().summary;
        number.content = response.val().content;
      }

    setLastNumber(number);
  }

  return (
      <div className="main-div">
        <Typography 
          className="anta-regular" 
          variant="h2" 
          paddingTop={"3rem"} 
          paddingBottom={"3rem"} 
          textAlign={"center"}
          sx={{ cursor: 'default' }}>
          TECHNOLOGY INNOVATION
        </Typography>

        {(appContext.role === Role.CUSTOMER || appContext.role === Role.VISITOR) &&
          <UserView lastNumber={lastNumber} releasedNumbers={releasedNumbers} />
        }

        {(appContext.role === Role.ADMIN || appContext.role === Role.OWNER) &&
          <AdminView notReleasedNumbers={notReleasedNumbers} releasedNumbers={releasedNumbers} />
        }
      </div>
  )
}