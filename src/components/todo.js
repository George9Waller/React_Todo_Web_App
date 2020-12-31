import React from "react";
import {ListItem, ListItemText, Button} from "@material-ui/core";
import {DATABASE} from "../firebase_config";


export default function TodoListItem({name, status, id}) {
    
    function toggleStatus() {
        DATABASE.collection("todos").doc(id).update({
           status: !status
        });
    }
    
    function deleteTodo() {
        DATABASE.collection("todos").doc(id).delete();
    }
    
    return (
        <div style={{display: "flex"}}>
            <ListItem>
                <ListItemText
                    primary={name}
                    secondary={status ? "In progress" : "Done"}
                    primaryTypographyProps={{style: {textDecoration: status ? "" : "line-through"}}}
                />
            </ListItem>

            <Button onClick={toggleStatus}>{status ? "DONE" : "REDO"}</Button>
            <Button onClick={deleteTodo}>X</Button>
        </div>
    )
}
