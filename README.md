# WebRTC Video Chat Room

Un'applicazione di video chat peer-to-peer in tempo reale costruita con WebRTC, Node.js e WebSocket.

## 🚀 Caratteristiche

- **Video chat in tempo reale** tra due peer
- **Chat testuale** integrata
- **Controlli video e audio** (mute/unmute)
- **Interfaccia web intuitiva** e responsive
- **Connessione peer-to-peer diretta** usando WebRTC
- **Gestione delle stanze** con nomi personalizzati
- **Console di debug** per monitorare lo stato WebRTC

## 🛠️ Tecnologie Utilizzate

- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **Backend**: Node.js, Express.js
- **WebRTC**: Per la comunicazione peer-to-peer
- **WebSocket**: Per la segnalazione tra client
- **STUN Server**: Google STUN servers per NAT traversal

## 📋 Prerequisiti

- Node.js (versione 14 o superiore)
- npm (Node Package Manager)
- Browser moderno con supporto WebRTC (Chrome, Firefox, Safari, Edge)

## 🔧 Installazione

1. **Clona il repository**
   ```bash
   git clone https://github.com/Greed71/webRTC.git
   cd webRTC
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Avvia il server**
   ```bash
   node app.js
   ```

4. **Apri il browser**
   ```
   http://localhost:3000
   ```

## 🎮 Come Utilizzare

### Creazione di una Stanza
1. Apri l'applicazione nel browser
2. Inserisci un nome per il canale/stanza
3. Clicca su **"Create"** per creare una nuova stanza

### Partecipazione a una Stanza
1. Apri l'applicazione in un altro tab/browser/dispositivo
2. Inserisci lo stesso nome del canale
3. Clicca su **"Join"** per unirti alla stanza

### Durante la Video Chat
- **📹 Toggle Video**: Attiva/disattiva la tua videocamera
- **🎤 Toggle Audio**: Attiva/disattiva il tuo microfono
- **Chat**: Usa la chat testuale per comunicare
- **Exit Room**: Esci dalla stanza corrente
- **Destroy Room**: Elimina completamente la stanza

## 📁 Struttura del Progetto

```
webRTC/
├── app.js                 # Server Express con WebSocket
├── constants.js           # Costanti condivise server-side
├── package.json           # Dipendenze del progetto
├── public/
│   ├── index.html         # Interfaccia utente principale
│   ├── main.js            # Script principale client-side
│   ├── style.css          # Stili CSS
│   └── modules/
│       ├── ajax.js        # Gestione richieste HTTP
│       ├── constants.js   # Costanti client-side
│       ├── state.js       # Gestione stato applicazione
│       ├── uiUtils.js     # Utilità interfaccia utente
│       ├── webRTCHandler.js # Logica WebRTC principale
│       └── ws.js          # Gestione WebSocket client-side
└── README.md              # Questo file
```

## 🔧 API Endpoints

### POST `/create-room`
Crea una nuova stanza video chat.

**Body:**
```json
{
  "roomName": "nome-stanza",
  "userId": "id-utente-univoco"
}
```

**Risposta di successo:**
```json
{
  "data": {
    "type": "ROOM_CREATE_SUCCESS",
    "message": "Room created successfully"
  }
}
```

## 🌐 WebSocket Events

### Eventi Client → Server
- `ROOM_JOIN_REQUEST`: Richiesta di unirsi a una stanza
- `WEBRTC_OFFER`: Invio dell'offerta WebRTC
- `WEBRTC_ANSWER`: Invio della risposta WebRTC
- `ICE_CANDIDATE`: Invio di candidati ICE

### Eventi Server → Client
- `ROOM_JOIN_SUCCESS/FAILURE`: Risultato dell'unione alla stanza
- `PEER_CONNECTION_REQUEST`: Richiesta di connessione peer
- `WEBRTC_OFFER/ANSWER`: Trasferimento messaggi WebRTC
- `ICE_CANDIDATE`: Trasferimento candidati ICE

## 🔍 Debug e Monitoring

L'applicazione include una console di debug integrata che mostra:
- ID sessione univoco
- Eventi WebRTC in tempo reale
- Stato delle connessioni
- Messaggi di errore e successo

## 🤝 Contribuire

1. Fai un fork del progetto
2. Crea un branch per la tua feature (`git checkout -b feature/nuova-feature`)
3. Committa le tue modifiche (`git commit -am 'Aggiungi nuova feature'`)
4. Pusha sul branch (`git push origin feature/nuova-feature`)
5. Apri una Pull Request

## 📝 TODO / Miglioramenti Futuri

- [ ] Supporto per più di due utenti per stanza
- [ ] Registrazione e salvataggio delle chat
- [ ] Condivisione schermo
- [ ] Filtri e effetti video
- [ ] Autenticazione utenti
- [ ] Stanze persistenti
- [ ] Notifiche push
- [ ] Mobile responsive migliorato

## 🐛 Problemi Noti

- La connessione potrebbe fallire dietro alcuni firewall aziendali
- Su alcune reti, potrebbero essere necessari server TURN aggiuntivi
- La qualità video dipende dalla banda disponibile

## 📞 Supporto Browser

| Browser | Versione Minima | Supporto |
|---------|----------------|----------|
| Chrome  | 56+            | ✅ Completo |
| Firefox | 44+            | ✅ Completo |
| Safari  | 11+            | ✅ Completo |
| Edge    | 79+            | ✅ Completo |

## 📄 Licenza

Questo progetto è rilasciato sotto licenza ISC. Vedi il file `package.json` per i dettagli.

## 👨‍💻 Autore

**Greed71** - [GitHub Profile](https://github.com/Greed71)

---

⭐ Se questo progetto ti è stato utile, lascia una stella su GitHub!

## 🔗 Link Utili

- [WebRTC MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Express.js Documentation](https://expressjs.com/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
