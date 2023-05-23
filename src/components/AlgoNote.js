//import classNames from "classnames";
import React, { useEffect, useReducer, useState } from 'react';
import Loader from "react-spinners/ClockLoader";

//import WaveStatus from "./WaveStatus";


const override = {
    marginLeft: "8px",
};

const initialNotesState = {
    lastNoteCreated: null,
    totalNotes: 0,
    notes: [{
        key: "initial-test",
        value: 4,
        text: "initial-test",
    }],
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
                notes: prevState.notes.filter(note => note.key !== action.payload.key || note.rotate !== action.payload.rotate),
                totalNotes: prevState.notes.length - 1,
            };
            console.log('After DELETE_NOTE: ', newState);

            return newState;
        }

        case 'INITIALIZE_NOTES': {
            const initializedNotes = action.payload.map(note => {
                const existingNote = prevState.notes.find(prevNote => prevNote.key === note.key);
                if (existingNote) {
                    return {
                        ...note,
                        rotate: existingNote.rotate !== undefined ? existingNote.rotate : Math.floor(Math.random() * 30),
                    };
                } else {
                    return note;
                }
            });

            const newState = {
                ...prevState,
                notes: initializedNotes,
                totalNotes: initializedNotes.length,
            };
            console.log('After INITIALIZE_NOTES:', newState);
            return newState;
        }

        default: {
            console.log(prevState);
        }
    }
};


export default function AlgoNote({
    walletInstalled,
    walletConnected,
    noteList,
    loading,
    writeLoading,
    totalWaves,
    onTodoAction,
    optedIn
}) {
    const [notesState, dispatch] = useReducer(notesReducer, initialNotesState);
    const [noteInput, setNoteInput] = useState('');
    const [message, setMessage] = useState("");
    /* const disableInput = Boolean(writeLoading) || !optedIn;
    const disableButtons =
        !optedIn ||
        !walletInstalled ||
        !walletConnected ||
        loading ||
        writeLoading ||
        message.length === 0;

    useEffect(() => {
        if (writeLoading === WriteStatus.None) {
            setMessage("");
        }
    }, [writeLoading]); */

    useEffect(() => {
        fetchNoteList();
    }, [noteList]);

    const fetchNoteList = async () => {
        try {
            dispatch({ type: 'INITIALIZE_NOTES', payload: noteList });
            console.log(noteList)
        } catch (error) {
            console.error('Error fetching noteList:', error);
        }
    };

    const addNote = async (event) => {

        event.preventDefault();
        if (!noteInput) {
            return;
        }

        const newNote = {
            /* id: uuid(),
            text: noteInput, */
            key: noteInput,
            value: 1,
            rotate: Math.floor(Math.random() * 30)
        }
        try {
            await onTodoAction("Add", noteInput);
            dispatch({ type: 'ADD_NOTE', payload: newNote });
            fetchNoteList();
            setNoteInput('');
        }
        catch (e) {
            console.log(e);
        }
    };

    const deleteNote = async (note) => {
        try {
            await onTodoAction("Delete", note.key)
            dispatch({ type: 'DELETE_NOTE', payload: note })
            fetchNoteList();
            setNoteInput('');
        }
        catch (e) {
            console.log(e);
        }
        console.log(note)
    };


    const dropNote = event => {
        event.target.style.left = `${event.pageX - 50}px`;
        event.target.style.top = `${event.pageY - 50}px`;
    };

    return (
        <div>
            {/* <div className="textWrapper">
				<label htmlFor="message">Write your task below:</label>
				<textarea
					id="message"
					className={classNames("textBox")}
					disabled={disableInput}
					value={message}
					onChange={(ev) => setMessage(ev.target.value)}
				/>
			</div>
			<section
				className={classNames("buttonGroup", disableButtons && "disabled")}
			>
				<button className="button buttonWave" onClick={() => onTodoAction('create', message)}>
					<span className="buttonEmoji" role="img" aria-label="Wave">
						✍🏻
					</span>
					Create a task
				</button>
			</section>
			<WaveStatus
				loading={loading}
				writeLoading={writeLoading}
				totalWaves={totalWaves}
			/> */}
            <form className="note-form" onSubmit={addNote}>
                <textarea placeholder="Create a new note..."
                    value={noteInput}
                    onChange={event => setNoteInput(event.target.value)}
                    disabled={!walletConnected && !optedIn}>
                </textarea>
                <button disabled={!walletConnected && !optedIn}>Add</button>
            </form>

            {notesState
                .notes
                .filter(note => note.key !== 'local_like')
                .map(note => (
                    <div className="note"
                        style={{ transform: `rotate(${note.rotate}deg)` }}
                        onDragEnd={dropNote}
                        draggable={walletConnected && optedIn}
                        key={`${note.key}-${note.rotate}`}>

                        <div onClick={() => { deleteNote(note) }}
                            className="close">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <pre className="text">{note.key}</pre>
                    </div>
                ))
            }
            {loading ?
                <div className="loader">
                    <h2>Pending transaction...</h2>
                    <Loader color={'#ff88b1'} loading={loading} size={170} cssOverride={override} />
                </div> :
                <p> {null} </p>
            }



        </div>
    );
}
