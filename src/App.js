import { PeraWalletConnect } from '@perawallet/connect';
import algosdk, { waitForConfirmation } from 'algosdk';
import React, { useEffect, useReducer, useState } from 'react';
import Loader from "react-spinners/ClockLoader";
import { v4 as uuid } from 'uuid';
import './App.scss';

const override = {
  marginLeft: "8px",
};

// Create the PeraWalletConnect instance outside the component
const peraWallet = new PeraWalletConnect();

// The app ID on testnet
const appIndex = 166234659;

// connect to the algorand node
const algod = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);

const initialNotesState = {
  lastNoteCreated: null,
  totalNotes: 0,
  notes: [],
};

const notesReducer = (prevState, action) => {
  switch (action.type) {
    case 'ADD_NOTE': {
      const newState = {
        notes: [...prevState.notes, action.payload],
        totalNotes: prevState.notes.length + 1,
        lastNoteCreated: new Date().toTimeString().slice(0, 8),
      };
      console.log('After ADD_NOTE: ', newState);
      return newState;
    }

    case 'DELETE_NOTE': {
      const newState = {
        ...prevState,
        notes: prevState.notes.filter(note => note.id !== action.payload.id),
        totalNotes: prevState.notes.length - 1,
      };
      console.log('After DELETE_NOTE: ', newState);
      
      return newState;
    }

    default: {
      console.log(prevState);
    }
  }
};

export function App() {
  const [notesState, dispatch] = useReducer(notesReducer, initialNotesState);
  const [noteInput, setNoteInput] = useState('');
  const [accountAddress, setAccountAddress] = useState(null);
  const [accountName, setAccountName] = useState(null);
  const [currentCount, setCurrentCount] = useState(null);
  const [localCount, setLocalCount] = useState(null);
  const isConnectedToPeraWallet = !!accountAddress;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkCounterState();
    checkLocalCounterState();
    // reconnect to session when the component is mounted
    peraWallet.reconnectSession().then((accounts) => {
      // Setup disconnect event listener
      peraWallet.connector?.on('disconnect', handleDisconnectWalletClick);

      if (accounts.length) {
        setAccountAddress(accounts[0]);
        console.log(accounts[0])
      }
    })

  }, []);

  const addNote = async (event) => {
    
    event.preventDefault();
    if (!noteInput) {
      return;
    }

    const newNote = {
      id: uuid(),
      text: noteInput,
      rotate: Math.floor(Math.random() * 30)
    }
    try{
      await callCounterApplication("Add_Local");
    }
    catch(e){
      console.log(e);
    }
    finally{
      dispatch({ type: 'ADD_NOTE', payload: newNote });
      setNoteInput('');
    }
  };

  const deleteNote = async (note) => {
    try{
      await callCounterApplication("Deduct_Local");
    }
    catch(e){
      console.log(e);
    }
    finally{
      dispatch({ type: 'DELETE_NOTE', payload: note })
      setNoteInput('');
    }
    console.log(note)
  };

  const dragOver = event => {
    event.stopPropagation();
    event.preventDefault();
  }

  const dropNote = event => {
    event.target.style.left = `${event.pageX - 50}px`;
    event.target.style.top = `${event.pageY - 50}px`;
  };

  async function optInToApp() {

    setLoading(true)
    const suggestedParams = await algod.getTransactionParams().do();
    const optInTxn = algosdk.makeApplicationOptInTxn(
      accountAddress,
      suggestedParams,
      appIndex
    );

    const optInTxGroup = [{ txn: optInTxn, signers: [accountAddress] }];

    const signedTx = await peraWallet.signTransaction([optInTxGroup]);
    console.log(signedTx);
    if(signedTx){
      setLoading(false)
    }
    const { txId } = await algod.sendRawTransaction(signedTx).do();
    const result = await waitForConfirmation(algod, txId, 2);
    
  }


  async function callCounterApplication(action) {
    try {
      // get suggested params
      setLoading(true)
      const suggestedParams = await algod.getTransactionParams().do();
      const appArgs = [new Uint8Array(Buffer.from(action))];

      const actionTx = algosdk.makeApplicationNoOpTxn(
        accountAddress,
        suggestedParams,
        appIndex,
        appArgs
      );

      const actionTxGroup = [{ txn: actionTx, signers: [accountAddress] }];

      const signedTx = await peraWallet.signTransaction([actionTxGroup]);
      console.log(signedTx);
      const { txId } = await algod.sendRawTransaction(signedTx).do();
      const result = await waitForConfirmation(algod, txId, 2);
      console.log(result);
      if(result){
        setLoading(false)
      }
      checkCounterState();
      checkLocalCounterState();

    } catch (e) {
      console.error(`There was an error calling the counter app: ${e}`);
      setLoading(false);
    }
  }


  return (
    <div className="app" onDragOver={dragOver}>
      <h1>
        Algorand Notes ({notesState.totalNotes}/16)
        {/* <span>{notesState.notes.length ? `Last note created: ${notesState.lastNoteCreated}` : ' '}</span> */}
        <span> Account Address: {isConnectedToPeraWallet ? accountAddress : "(Not Connected)"} </span>
      </h1>
      <div className="header-buttons">
        <button onClick={
          isConnectedToPeraWallet ? handleDisconnectWalletClick : handleConnectWalletClick
        }> {isConnectedToPeraWallet ? "Disconnect" : "Connect to Pera Wallet"}
        </button>
        <button 
        onClick={ () => optInToApp() } 
        disabled={!isConnectedToPeraWallet}>
          Register
        </button>
      </div>
      <form className="note-form" onSubmit={addNote}>
        <textarea placeholder="Create a new note..."
          value={noteInput}
          onChange={event => setNoteInput(event.target.value)}
          disabled={!isConnectedToPeraWallet}>
        </textarea>
        <button disabled={!isConnectedToPeraWallet}>Add</button>
      </form>
      {loading ?
         <div className="loader"> 
          <h2>Pending transaction...</h2>
          <Loader color={'#ff88b1'} loading={loading} size={170} cssOverride={override}/> 
        </div>:
         <p> {null} </p>
        }

      

      {notesState
        .notes
        .map(note => (
          <div className="note"
            style={{ transform: `rotate(${note.rotate}deg)` }}
            onDragEnd={dropNote}
            draggable={isConnectedToPeraWallet}
            key={note.id}>

            <div onClick={() => {deleteNote(note)}}
              className="close">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <pre className="text">{note.text}</pre>
          </div>
        ))
      }
    </div>
  );

  function handleConnectWalletClick() {
    peraWallet.connect().then((newAccounts) => {
      // setup the disconnect event listener
      peraWallet.connector?.on('disconnect', handleDisconnectWalletClick);

      setAccountName(accountName);
      setAccountAddress(newAccounts[0]);
      console.log(accountName);
      console.log(newAccounts[0]);
    });
  }

  function handleDisconnectWalletClick() {
    peraWallet.disconnect();
    setAccountName(null);
    setAccountAddress(null);
  }



  async function checkCounterState() {
    try {
      const counter = await algod.getApplicationByID(appIndex).do();
      if (!!counter.params['global-state'][0].value.uint) {
        setCurrentCount(counter.params['global-state'][0].value.uint);
      } else {
        setCurrentCount(0);
      }
    } catch (e) {
      console.error('There was an error connecting to the algorand node: ', e)
    }
  }

  async function checkLocalCounterState() {
    try {
      const accountInfo = await algod.accountApplicationInformation(accountAddress, appIndex).do();
      if (!!accountInfo['app-local-state']['key-value'][0].value.uint) {
        setLocalCount(accountInfo['app-local-state']['key-value'][0].value.uint);
      } else {
        setLocalCount(0);
      }
      console.log(accountInfo['app-local-state']['key-value'][0].value.uint);
    } catch (e) {
      console.error('There was an error connecting to the algorand node: ', e)
    }
  }




}

export default App;
