import { PeraWalletConnect } from '@perawallet/connect';
import algosdk, { waitForConfirmation } from 'algosdk';
import React, { useEffect, useState } from 'react';
import './App.scss';
import AlgoNote from "./components/AlgoNote";
import Review from './components/Review';
import Wallet from "./components/Wallet";
import useWallet from "./hooks/useWallet";

const peraWallet = new PeraWalletConnect();

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

  const dragOver = event => {
    event.stopPropagation();
    event.preventDefault();
  }

  return (
    <div className="app" onDragOver={dragOver}>
      <Wallet
        handleDisconnectWalletClick={handleDisconnectWalletClick}
        totalNotes={totalNotes}
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
}

export default App;
