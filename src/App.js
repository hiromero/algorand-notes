import { PeraWalletConnect } from '@perawallet/connect';
import algosdk, { waitForConfirmation } from 'algosdk';
import React, { useEffect, useState } from 'react';
import './App.scss';
import AlgoNote from "./components/AlgoNote";
import Review from './components/Review';
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
    loading,
    likes,
    selfLike,
    totalNotes,
    optIn,
    optedIn,
    onTodoAction,
    noopLike,
    handleDisconnectWalletClick,
  } = useWallet(peraWallet);

  const [noteInput, setNoteInput] = useState('');
  const [currentCount, setCurrentCount] = useState(null);
  const [localCount, setLocalCount] = useState(null);
  const isConnectedToPeraWallet = !!accountAddress;
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
      <Review
        likes={likes}
        noopLike={noopLike}
        selfLike={selfLike}
      />
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
