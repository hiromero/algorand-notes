import { PeraWalletConnect } from '@perawallet/connect';
import algosdk, { waitForConfirmation } from 'algosdk';
import React, { useEffect, useReducer, useState } from 'react';
import Loader from "react-spinners/ClockLoader";
import { v4 as uuid } from 'uuid';
import './App.scss';
import AlgoNote from "./components/AlgoNote";
import Wallet from "./components/Wallet";

import useWallet from "./hooks/useWallet";


// Create the PeraWalletConnect instance outside the component
const peraWallet = new PeraWalletConnect();

// The app ID on testnet
const appIndex = 166234659;
//const appIndex = 211358949;


// connect to the algorand node
const algod = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);


export function App() {
  const {
    walletInstalled,
    walletConnected,
    networkName,
    connectWallet,
    accountAddress,
    writeLoading,
    noteList,
    totalNotes,
    optIn,
    optedIn,
    onTodoAction,
    handleDisconnectWalletClick,
  } = useWallet(peraWallet);

  const [noteInput, setNoteInput] = useState('');
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
        console.log(accounts[0])
      }
    })

  }, []);





  const dragOver = event => {
    event.stopPropagation();
    event.preventDefault();
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
      if (result) {
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
      <Wallet
        handleDisconnectWalletClick={handleDisconnectWalletClick}
        optedIn={optedIn}
        optIn={optIn}
        loading={loading}
        accountAddress={accountAddress}
        walletInstalled={walletInstalled}
        walletConnected={walletConnected}
        networkName={networkName}
        connectWallet={connectWallet}
      />
      <AlgoNote
        walletInstalled={walletInstalled}
        walletConnected={walletConnected}
        onTodoAction={onTodoAction}
        loading={loading}
        writeLoading={writeLoading}
        totalNotes={totalNotes}
        optedIn={optedIn}
        noteList={noteList}
      />

      {/* {notesState
        .notes
        .map(note => (
          <div className="note"
            style={{ transform: `rotate(${note.rotate}deg)` }}
            onDragEnd={dropNote}
            draggable={walletConnected}
            key={note.id}>

            <div onClick={() => { deleteNote(note) }}
              className="close">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <pre className="text">{note.text}</pre>
          </div>
        ))
      } */}
    </div>
  );


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
