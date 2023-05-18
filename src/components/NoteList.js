import React from "react";

import Note from "./Note";


export default function NoteList({ noteList, onTodoAction }) {
    if (!noteList) {
        return null;
    }

    return (
        <div className="noteList">
            {noteList.map((note, i) => (
                <Note
                    key={i}
                    message={note.key}
                    status={note.value}
                    onTodoAction={onTodoAction}
                />
            ))}
        </div>
    );
}
