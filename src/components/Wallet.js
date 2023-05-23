import React from "react";

export default function Wallet({
    loading,
    walletInstalled,
    walletAccount,
    accountAddress,
    walletConnected,
    optedIn,
    optIn,
    connectWallet,
    handleDisconnectWalletClick
}) {


    return (
        <div className="buttonGroup justifyCenter fading">
            <h1>
                Algorand Notes (0/16)
                {/* <span>{notesState.notes.length ? `Last note created: ${notesState.lastNoteCreated}` : ' '}</span> */}
                <span> Account Address: {walletConnected ? accountAddress : "(Not Connected)"} </span>
            </h1>
            <div className="header-buttons">
                <button onClick={
                    walletConnected ? handleDisconnectWalletClick : connectWallet
                }> {walletConnected ? "Disconnect" : "Connect to Pera Wallet"}
                </button>


                {walletConnected && !optedIn && (
                    <button onClick={optIn}>
                        Register
                    </button>
                )}
            </div>

            {/* 
            {!walletConnected && (
                <button onClick={connectWallet}>
                    Connect Wallet
                </button>
            )}
            {walletConnected && (
                <div>
                    <div>
                        <span />
                        Wallet Connected
                    </div>
                </div>
            )}
            {walletConnected && (
                <button onClick={handleDisconnectWalletClick}>
                    Disconnect Wallet
                </button>
            )}



            <div>
                <div>
                    {walletConnected && !optedIn && (
                        <button className="button buttonMetaMask" onClick={optIn}>
                            Register
                        </button>
                    )}
                </div>
            </div> */}
        </div>
    );
}
