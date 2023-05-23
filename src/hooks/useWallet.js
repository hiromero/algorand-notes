import { useCallback, useEffect, useMemo, useState } from "react";

import algosdk, { waitForConfirmation } from "algosdk";
import { CONSTANTS } from './Constants';

const appIndex = CONSTANTS.APP_ID;


let client = new algosdk.Algodv2(CONSTANTS.algodToken, CONSTANTS.baseServer, CONSTANTS.port)

export const WriteStatus = {
    None: 0,
    Connect: 1,
    Request: 2,
    Pending: 3,
};

const EvmName = {
    80001: "Polygon Mumbai",
};

export default function useWallet(peraWallet) {
    const [loading, setLoading] = useState(true);
    const [writeLoading, setWriteLoading] = useState(WriteStatus.None);
    const [walletInstalled, setInstalled] = useState(true);
    const [walletConnected, setConnected] = useState(false);
    const [walletNetwork, setNetwork] = useState(null);
    const [walletAccount, setAccount] = useState("");
    const [optedIn, setOptedIn] = useState(false)
    const [walletError, setWalletError] = useState(null);
    const [noteList, setNoteList] = useState([]);
    const [totalNotes, setTotalNotes] = useState(null);
    const [accountAddress, setAccountAddress] = useState(null);
    const [likes, setLikes] = useState(0);
    const [selfLike, setSelfLike] = useState(null);
    const networkName = useMemo(() => {
        if (!walletNetwork) {
            return "";
        }
        return EvmName[walletNetwork?.chainId] || walletNetwork.name;
    }, [walletNetwork]);


    const updateNotes = useCallback(() => {
        const runUpdates = async () => {

        };
        runUpdates();
    }, [setTotalNotes, setNoteList]);


    useEffect(() => {

        const runUpdates = async () => {
            setConnected(await getWalletConnected());
            setLoading(false);
        };
        runUpdates();
    }, [setInstalled, setConnected, updateNotes, setLoading]);

    async function checkGlobalState() {
        try {
            let counter = await client.getApplicationByID(appIndex).do();
            if (!!counter.params['global-state'][0].value.uint) {
                setLikes(counter.params['global-state'][0].value.uint);
            } else {
                setLikes(counter.params['global-state'][0].value.uint);
            }
        } catch (e) {
            console.error('There was an error connecting to the Algorand node: ', e);
        }
    }

    // useEffect to log the updated value of likes
    useEffect(() => {
        console.log(likes);
    }, [likes]);

    const nanParser = (val) => {
        return isNaN(val) ? 0 : val
    }

    const checkOptedIn = async (sender, index) => {
        try {
            let appInfo = await client.accountApplicationInformation(sender, index).do();
            if (appInfo['app-local-state']) {
                if (appInfo['app-local-state']['key-value']) {
                    const todoList = appInfo['app-local-state']['key-value']
                    if (todoList.length > 0) {
                        const fetchNote = todoList.map(_ => ({ key: atob(_.key), value: _.value.uint }))
                        setSelfLike(nanParser(fetchNote.find(_ => _.key === "local_like")?.value) > 0 ?? null)
                        setNoteList(fetchNote)
                        setTotalNotes(fetchNote.length)
                        console.log(fetchNote.find(_ => _.key === "local_like")?.value)
                        console.log(selfLike)
                    } else {
                        setNoteList([])
                    }
                } else {
                    setNoteList([])
                }

                setOptedIn(true)
            }
        } catch (e) {
            console.log(e)
            setOptedIn(false)
            // console.error(`There was an error calling the app: ${e}`);
        }
    }

    const connectWallet = () => {
        return peraWallet.connect().then((newAccounts) => {
            // setup the disconnect event listener
            /* eslint-disable */
            peraWallet.connector?.on('disconnect', handleDisconnectWalletClick);
            checkGlobalState()
            checkOptedIn(newAccounts[0], CONSTANTS.APP_ID)
            setAccount(newAccounts)
            setConnected(true)
            return newAccounts
        });
    }

    async function noopLike(action) {
        try {
            // get suggested params

            const suggestedParams = await client.getTransactionParams().do();
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
            const { txId } = await client.sendRawTransaction(signedTx).do();
            setLoading(true)
            const result = await waitForConfirmation(client, txId, 2);
            console.log(result);
            if (result) {
                setLoading(false)
            }
            checkGlobalState()
            checkOptedIn(accountAddress, CONSTANTS.APP_ID)

        } catch (e) {
            console.error(`There was an error calling the counter app: ${e}`);
            setLoading(false);
        }
    }

    const onTodoAction = async (action, message) => {
        return await noop(appIndex, action, message, walletAccount[0])
    }

    async function getWalletConnected() {
        return peraWallet.reconnectSession().then((accounts) => {
            // Setup disconnect event listener
            peraWallet.connector?.on('disconnect', handleDisconnectWalletClick);

            if (accounts.length) {
                setAccount(accounts)
                setAccountAddress(accounts[0])
                checkGlobalState()
                checkOptedIn(accounts[0], appIndex)
                return true
            }
        })
    }

    const optIn = async () => {
        try {
            setLoading(true)
            const index = CONSTANTS.APP_ID
            const sender = walletAccount[0]
            const suggestedParams = await client.getTransactionParams().do();
            const optInTxn = algosdk.makeApplicationOptInTxn(
                sender,
                suggestedParams,
                index
            );
            const actionTxGroup = [{ txn: optInTxn, signers: [sender] }];
            console.log(actionTxGroup, peraWallet)
            const signedTx = await peraWallet.signTransaction([actionTxGroup]);
            console.log(signedTx);
            if (signedTx) {
                setLoading(false)
            }
            const { txId } = await client.sendRawTransaction(signedTx).do();
            const result = await waitForConfirmation(client, txId, 4);
            console.log(`Success`);
            setOptedIn(true)
        } catch (e) {
            setOptedIn(false)
            console.error(`There was an error calling the app: ${e}`);
        }
    }

    const noop = async (index, action, todo) => {
        try {
            const accounts = await peraWallet.reconnectSession()
            const sender = accounts[0]
            setWriteLoading(WriteStatus.Request)

            // console.log(index, action, todo, sender)
            const appArgs = []
            appArgs.push(
                new Uint8Array(Buffer.from(action)),
                new Uint8Array(Buffer.from(todo)),
            )
            const suggestedParams = await client.getTransactionParams().do();
            // create unsigned transaction
            // trigger smart contract
            let actionTx = algosdk.makeApplicationNoOpTxn(sender, suggestedParams, index, appArgs)

            // const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
            const actionTxGroup = [{ txn: actionTx, signers: [sender] }];

            //   console.log('before')
            const signedTx = await peraWallet.signTransaction([actionTxGroup]);
            //   console.log('after')
            //   console.log(signedTx);
            setWriteLoading(WriteStatus.Pending)
            const { txId } = await client.sendRawTransaction(signedTx).do();
            setLoading(true)
            const confirmedTxn = await waitForConfirmation(client, txId, 4);
            setWriteLoading(WriteStatus.None)

            //Get the completed Transaction
            console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

            // display results
            let transactionResponse = await client.pendingTransactionInformation(txId).do();
            console.log("Called app-id:", transactionResponse['txn']['txn']['apid'])
            if (transactionResponse['global-state-delta'] !== undefined) {
                console.log("Global State updated:", transactionResponse['global-state-delta']);
            }
            if (transactionResponse['local-state-delta'] !== undefined) {
                console.log("Local State updated:", transactionResponse['local-state-delta']);
            }
            checkGlobalState()
            checkOptedIn(sender, CONSTANTS.APP_ID)
            console.log('success')
            if (transactionResponse) {
                setLoading(false)
            }
        } catch (err) {
            console.log(err)
            setWriteLoading(WriteStatus.None)
        }
    }

    function handleDisconnectWalletClick() {
        localStorage.removeItem('walletconnect')
        localStorage.removeItem('PeraWallet.Wallet')
        setConnected(false)
        setAccount(null)
    }

    return {
        loading,
        likes,
        writeLoading,
        walletInstalled,
        walletConnected,
        accountAddress,
        walletAccount,
        walletError,
        connectWallet,
        networkName,
        noteList,
        totalNotes,
        optedIn,
        peraWallet,
        optIn,
        onTodoAction,
        noopLike,
        handleDisconnectWalletClick,
        selfLike
    };
}

