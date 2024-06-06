export enum Action {
  
  RD_DATA="Lettura dati dal contratto",

  ADD_MAG="Creazione magazine",
  RELEASE_MAG="Rilascio magazine",
  BUY_MAG="Acquisto magazine",
  
  SUB="Abbonamento",
  REVOKE_SUB="Revoca Abbonamento",

  SRC_USER_MAG = "Ricerca magazine utente",
  SRC_CUSTOM_MAG="Ricerca magazine acquistati",
  SRC_ALL_MAG="Ricerca magazines",
  SRC_ADDR_MAG="Ricerca magazines tramite indirizzo",
  
  WITHDRAW="Prelievo",
  
  SPLIT_PROFIT="Split profit",
  ADD_ADMIN="Aggiunta admin",
  DONATION="Donazione",

  MIN_DONATION="Minima donazione",

  FIREBASE_DATA = "Lettura/Salvataggio dati",
  READ_MAGAZINE="Accesso alla risorsa IPFS"
}