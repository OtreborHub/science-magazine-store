<h1>Science Magazine Store</h1>
Science Magazine Store è una Dapp realizzata per Start2Impact University.

Due smart contract Solidity, MagazineManager e MagazineManagerUtil, hanno lo scopo di gestire l'intero bundle di funzionalità disponibili per utenti ed amministratori mentre il front-end in React rende l'acquisto dei magazine semplice ed intuitivo.

<h2><b>Smart Contracts</b></h2>

**MagazineManager**

E' lo smart contract principale che regolamenta l'intero processo di creazione e pubblicazione di un magazine, aggiunta di nuovi amministratori, e altre funzionalità che vedremo in dettaglio di seguito.
Iniziamo analizzando le storage variable e le strutture dati.
  
![image](https://github.com/OtreborHub/science-magazine-store/assets/138629331/0b63e92b-a044-4283-879b-6120f0e7bb73)

- **balance**: (built-in) bilancio del contratto<br/>
- **magazines**: array dei Magazine complessivi<br/>
- **customers**: array di Customer complessivi<br/>
- **administrators**: array di indirizzi associati agli amministratori<br/>
- **owner**: indirizzo proprietario del contratto<br/>
- **singlePrice**: prezzo di una singola copia<br/>
- **annualPrice**: prezzo di un abbonamento annuale<br/>

Alla creazione il contratto riempie la variabile owner con il msg.sender e lo aggiunge all'array degli administrators.

<h3>Magazine</h3>

![image](https://github.com/OtreborHub/science-magazine-store/assets/138629331/efd69010-d98e-4959-8345-5d4d156f0d7b)

- **magazine_address**: rappresenta l'indirizzo del magazine<br/>
- **title**: rappresenta il titolo del magazine<br/>
- **release_date**: rappresenta la data di rilascio di ogni magazine. Al momento della creazione del magazine il suo valore è 0, al momento del rilascio viene valorizzato con block.timestamp.<br/>

<h3>Customer</h3>

![image](https://github.com/OtreborHub/science-magazine-store/assets/138629331/ebd35e41-3241-4690-aa1c-b0166b4083a5)

- **customer_address**: rappresenta l'indirizzo del cliente<br/>
- **owned_magazines**: rappresenta l'array di magazines posseduti dal cliente<br/>
- **subscription**: booleano che indica se il cliente ha effettuato l'abbonamento annuale<br/>
- **release_date**: rappresenta la data di scadenza dell'abbonamento. Valorizzato al momento dell'acquisto dell'abbonamento annuale con il block.timestamp + 365days.

<h3>Funzionalità</h3>
Possiamo suddividere le funzionalità in base al modificatore applicato ad ogni gruppo di funzionalità.<br/>

<h4>Nessun modificatore</h4>

- **buyMagazine**: funzione che aggiunge all'array owned_magazines del customer (cercato per msg.sender) l'indirizzo del magazine per cui si richiede la funzione di Acquista. Se il msg.sender non è ancora nella lista dei customers, allora verrà prima aggiunto alla lista e poi gli sarà assegnato il magazine richiesto. Nei controlli preliminari viene richiesto che il msg.value sia almeno equivalente al valore singlePrice. All'acquisto, il front-end aggiornerà il ruolo dell'utente da Visitor a Customer.

- **annualSubscribe**: funzione che permette all'utente di ricevere automaticamente una copia del magazine al suo rilascio. (vedi releaseMagazine) Nei controlli preliminari viene richiesto che il msg.value sia almeno equivalente al valore annualPrice. All'acquisto, il front-end aggiornerà il ruolo dell'utente da Visitor a Customer.

- **revokeSubscribe**: funzione che permette all'utente di rimuovere il proprio abbonamento.

- **receive**: funzione che permette al contratto di ricevere ETH. Il front-end permette a tutti gli utenti di effettuare una donazione.

<h4>OnlyAdministrator</h4>

- **addMagazine**: funzione che permette agli amministratori di aggiungere un nuovo magazine. La sola variabile in input richiesta è il titolo del magazine. Il contratto si occuperà di generare un'indirizzo valido a partire dal testo contenuto nel titolo ed inserirlo nell'array magazines.

- **releaseMagazine**: funzione che permette di rilasciare un magazine. In input richiede l'indirizzo del magazine ma al front-end vengono richiesti l'URL della copertina del magazine, l'URL della copia del magazine (entrambi URL di risorse hostate su IPFS) e una descrizione del numero per poter rilasciare il numero. La funzione si occupa anche di aggiungere, per ogni customer con l'abbonamento annuale, l'address del magazine rilasciato nell'array owned_magazine. Infine ad ogni rilascio (viene supposto il rilascio di una copia al mese) avviene un processo di pulizia dell'array customers effettuando un check sull'expire_date.

<h4>OnlyOwner</h4> 

- **addAdmin**: funzione che permette all'owner del contratto di aggiungere un indirizzo all'array administrators garantendogli il permesso di utilizzare tutte le funzioni con modificatore onlyAdministrator. Inoltre ogni amministratore ha la possibilità di essere ricompensato (vedi splitProfit).

- **withdraw**: funzione che permette all'owner di prelevare parzialmente o totalmente il bilancio del contratto.

- **splitProfit**: funzione che permette all'owner di dividere il bilancio del contratto in parti uguali tra gli amministratori. La funzione è pensata per essere utilizzata dopo la funzione **withdraw** per sostenere il lavoro degli amministratori.






