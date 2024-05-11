import mag1 from '../assets/Mag1.png';
import mag2 from '../assets/Mag2.png';
import mag3 from '../assets/Mag3.png';
import mag4 from '../assets/Mag4.png';
import mag5 from '../assets/Mag5.png';
import mag_not_found from '../assets/Cover_not_found.png';

const IPFSBaseUrl: string = process.env.REACT_APP_IPFS_BASEURL as string;

const getCover = (cover: string) => {
  if(cover.length > 0 && cover.includes(IPFSBaseUrl)){
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
        return cover;
        // return fetchCover(cover);
    }
  }

  return mag_not_found;
}

// async function fetchCover(cover: string) {
//   return fetch(cover)
//     .then((response) => {
//       if (response.ok && response.body) {
//         return response.blob();
//       } else {
//         throw new Error('Network response was not ok.');
//       }
//     })
//     .then((blob) => {
//       return URL.createObjectURL(blob);
//     })
//     .catch((error) => {
//       console.error('There has been a problem with your fetch operation:', error);
//       return mag_not_found;
//     });
// }

export { getCover }