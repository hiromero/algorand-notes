## Algorand Notes

### Description

This smart contract is a simple One-note or sticky notes simulation created using Pyteal. In the contract, users are enabled to interact with the contract by adding notes and deleting notes, and also liking or unliking the dApp, all while utilizing Algorand's global and local states for data storage and management. The app leverages Pyteal's capabilities to utilize global and local states for storing and managing important stack values.

## Smart Contract

Here's the [link](https://github.com/hiromero/algo-notes-smartcontract) to the dApp's smart contract.

### Globals

The contract uses one global uint64 which is `likes`, this will keep track the number of likes and will be later on displayed for the users who likes the dApp

- global_likes - # uint64

### Locals

The contract allocates 15 local uint64s, one of which is for storing the user's own like on the dApp and the 14 remaining local uint64s will be used for storing notes. I use uint64 to store the notes where I put a value of Int(1) if the notes existed and store the actual content of the notes on the key of the uint64

- local_like - # uint64
- note - # key input uint64

### No_Op and Subroutines

The contract uses 4 no_op and subroutines, These are add_note, delete_note, like, and unlike.

- `add_note()`: This subroutine handles the logic for adding a note in the dApp. It checks if the user has opted-in to the dApp and then adds a note for the user by updating the local state. The transaction is approved after adding the note.
- `delete_note()`: This subroutine handles the logic for deleting a note in the dApp. It checks if the user has opted-in to the dApp and if the note exists for the user. If both conditions are met, the note is deleted from the local state. The transaction is approved after deleting the note.
- `like()`: This subroutine handles the logic for the "like" action in the dApp. It checks if the user has already liked the dApp and, if not, increases the global likes count and updates the local like count for the user. If the user has already liked the dApp, the transaction is rejected.
- `unLike()`: This subroutine handles the logic for the "unlike" action in the dApp. It checks if the user has already liked the dApp and, if so, decreases the global likes count and updates the local like count for the user. If the user hasn't liked the dApp, the transaction is rejected.

### Application ID

- `214948461`
- https://testnet.algoexplorer.io/application/214948461

## Front-end

Here's the [link](https://github.com/hiromero/algorand-notes) to the dApp's front-end repository.

### Demo

Here is a [VIDEO link](https://drive.google.com/file/d/1-v7ZndwT5iwr_ixYLcyHV_xlJH3mAH0t/view?usp=sharing) that shows how the user interacted with the dApp.

![Alt text](demo%20img.PNG)

To test it out, click on this [demo link](https://algorand-notes.vercel.app/) uploaded in Vercel

### User Key Functions and Flow

1. Access the DApp through this [ link](https://algorand-notes.vercel.app/)
2. Click `Connect to Pera Wallet` then pick your preferred choice on connecting your PeraWallet
3. You are then needed to `OPTin` your account so that you can interact with the local states and as well as set the initial value of your local count of likes in the DApp
4. After Opting in, you can then type in your notes then click `Add`, transaction will then be sent to your wallet
5. After confirming the transaction, the input notes will then be stored in the local uint64's key with a value of Int(1) and will then be displayed in the dApp, feel free to add a few more notes then drag-and-drop the notes anywhere in the dApp
6. If you wish to `delete` a note click the `x` button on the note, their will be a transaction prompt, after confirming the transaction the note along with the local uint64 will then be deleted
7. (optional) If you liked the dApp, feel free to click the `like` icon on the bottom of your screen, you can dislike it afterwards if you change your mind, of course their will be a transaction prompt for this button since it will update the global state for the total count of likes and local state to keep track that the user have only like once.
