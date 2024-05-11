import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppContext } from "../../Context";
import '../../styles/home.css';
import { emptyMagazine, getAllMagazines } from "../../utilities/contractBridge";
import { findMagazine } from "../../utilities/firebase";
import { Magazine } from '../../utilities/interfaces';
import { Role } from "../../utilities/role";
import AdminView from "./AdminView";
import UserView from "./UserView";

export default function Home() {
  const [lastNumber, setLastNumber] = useState<Magazine>(emptyMagazine);
  const [releasedNumbers, setReleasedNumbers] = useState<Magazine[]>([]);
  const [notReleasedNumbers, setNotReleasedNumbers] = useState<Magazine[]>([]);
  
  const appContext = useAppContext();
  useEffect(() => {
    getMagazines();
  }, [appContext.role])

  async function getMagazines() {
    const result = (await getAllMagazines());
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

  // FIREBASE
  async function fillLastNumberData(number: Magazine) {
    const response = await findMagazine(number.address);
      if(response.exists()){
        number.cover = response.val().cover;
        number.summary = response.val().summary;
        number.content = response.val().content;
      }

    setLastNumber(number);
  }

  // JSON-SERVER
  // async function fillLastNumberData(number: Magazine) {
  //   const response = await axios.get("http://localhost:5000/magazines", { params: { address: number.address } });
  //   if(response) {
  //     const lastNumber = response.data[0];
  //     if(lastNumber){
  //       number.cover = lastNumber.cover;
  //       number.summary = lastNumber.summary;
  //       number.content = lastNumber.content;
  //     }
  //   }
  //   setLastNumber(number);
  // }

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