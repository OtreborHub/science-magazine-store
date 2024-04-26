import mag1 from '../assets/Mag1.png';
import mag2 from '../assets/Mag2.png';
import mag3 from '../assets/Mag3.png';
import mag4 from '../assets/Mag4.png';
import mag5 from '../assets/Mag5.png';
import mag_not_found from '../assets/Cover_not_found.png';


const getCover = (cover: string) => {
  if(cover.length > 0){
    let filename = cover.split("?filename=")[1].split(".")[0];
    switch(filename){
      case "Cover_Mag1":
        return mag1;
      case "Cover_Mag2":
        return mag2;
      case "Cover_Mag3":
        return mag3;
      case "Cover_Mag4":
        return mag4;
      case "Cover_Mag5":
        return mag5;
      default:
        return mag_not_found;
    }
  }
    return mag_not_found;
  }

export { getCover }