import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppContext } from "../Context";
import '../styles/home.css';
import { emptyMagazine, readAllMagazines } from "../utilities/contractBridge";
import { findMagazine } from "../utilities/firebase";
import { Magazine } from '../utilities/interfaces';
import { Role } from "../utilities/role";
import AdminView from "./views/AdminView";
import UserView from "./views/UserView";

export default function Home() {
  const [lastMagazine, setLastMagazine] = useState<Magazine>(emptyMagazine);
  const [releasedMagazines, setReleasedMagazines] = useState<Magazine[]>([]);
  const [notReleasedMagazines, setNotReleasedMagazines] = useState<Magazine[]>([]);
  
  const appContext = useAppContext();
  useEffect(() => {
    getMagazines();
  }, [appContext.role])

  async function getMagazines() {
    const magazines = await readAllMagazines();
    const notReleasedNumbers = magazines.filter(magazine => magazine.release_date === 0);

    let lastNumber: Magazine = emptyMagazine;
    const releasedNumbers = magazines
      .filter(magazine => magazine.release_date > 0)
      .sort((a, b) => b.release_date - a.release_date)
      .map((magazine, index) => {
        if (index === 0) {
          lastNumber = magazine;
        }
        return magazine;
      });
    
    if ((appContext.role === Role.CUSTOMER || appContext.role === Role.VISITOR) && lastNumber.address) {
      await fillLastNumberData(lastNumber);
    }
    setReleasedMagazines(releasedNumbers);
    setNotReleasedMagazines(notReleasedNumbers);
  }

  async function fillLastNumberData(magazine: Magazine) {
    const response = await findMagazine(magazine.address);
      if(response.exists()){
        magazine.cover = response.val().cover;
        magazine.summary = response.val().summary;
        magazine.content = response.val().content;
      }

    setLastMagazine(magazine);
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
          <UserView lastMagazine={lastMagazine} releasedMagazines={releasedMagazines} />
        }

        {(appContext.role === Role.ADMIN || appContext.role === Role.OWNER) &&
          <AdminView notReleasedMagazines={notReleasedMagazines} releasedMagazines={releasedMagazines} />
        }

      </div>
  )
}