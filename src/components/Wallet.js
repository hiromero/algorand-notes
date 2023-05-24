import React from "react";

export default function Wallet({
    accountAddress,
    walletConnected,
    optedIn,
    optIn,
    connectWallet,
    handleDisconnectWalletClick,
    totalNotes
}) {
    return (
        <div className="buttonGroup justifyCenter fading">
            <h1>
                Algorand Notes ({Math.max(totalNotes - 1, 0)}/14)
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
        </div>
    );
}
