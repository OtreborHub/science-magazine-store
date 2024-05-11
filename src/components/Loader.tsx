import { Backdrop, Box, CircularProgress } from "@mui/material";
import { LoaderProps } from "../utilities/interfaces";

export default function Loader({ loading } : LoaderProps) {
  return (
    <Backdrop
    sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, color: '#fff', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    open={loading}>
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100%"
    >
      <CircularProgress size={ 100 } sx={{ color: "yellow" }}/>
    </Box>
  </Backdrop>
  )
}