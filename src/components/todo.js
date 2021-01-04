import React, {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import DateFnsUtils from '@date-io/date-fns';
import {ListItem, ListItemText, Button, Radio} from "@material-ui/core";
import {DatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import {DATABASE} from "../firebase_config";


export default function TodoListItem({name, status, due, colour, id}) {
    const {uid} = useSelector(state => state.firebase.auth);
    let initialDueDate;
    try {
        initialDueDate = due.toDate();
    }
    catch {
        initialDueDate = due
    }

    const [dueDate, setDueDate] = useState(initialDueDate);
    const [selectedColour, setSelectedColour] = useState(colour);

    let initialOverdue;
    const today = new Date();
    initialOverdue = today >= dueDate;
    const [overdue, setOverdue] = useState(initialOverdue);
    console.log(today >= dueDate);

    useEffect(() => {
        const currentDate = new Date(today);
        const currentDueDate = new Date(dueDate);
        currentDate.setHours(0,0,0,0);
        currentDueDate.setHours(0,0,0,0);
        setOverdue(currentDate >= currentDueDate);
    }, [today, dueDate]);

    function setStyle(num) {
        let style;
        switch (num) {
            case 1:
                style = "primary";
                break;
            case 2:
                style = "secondary";
                break;
            default:
                style = "initial";
        }
        return style;
    }

    function toggleStatus() {
        DATABASE
            .collection("users")
            .doc(uid)
            .collection("todos")
            .doc(id)
            .update({
                status: !status
        });
    }

    function updateDueDate(date) {
        setDueDate(date);
        DATABASE
            .collection("users")
            .doc(uid)
            .collection("todos")
            .doc(id)
            .update({
                due: date
            });
    }

    function updateColour(e) {
        setSelectedColour(parseInt(e.target.value));
        DATABASE
            .collection("users")
            .doc(uid)
            .collection("todos")
            .doc(id)
            .update({
                colour: parseInt(e.target.value)
            })
    }
    
    function deleteTodo() {
        DATABASE
            .collection("users")
            .doc(uid)
            .collection("todos")
            .doc(id)
            .delete();
    }
    
    return (
        <div style={{display: "flex"}}>
            <ListItem>
                <ListItemText
                    primary={overdue ? "⚠ " + name : "" + name}
                    secondary={status ? "In progress" : "Done"}
                    primaryTypographyProps={{style: {textDecoration: status ? "" : "line-through"}, color: setStyle(selectedColour)}}
                />
            </ListItem>

            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker
                    label="Due"
                    value={dueDate}
                    onChange={(value, e) => updateDueDate(value)}
                    format="do MMM"
                    // renderInput={(params) => <TextField {...params} variant="standard" />}
                />
            </MuiPickersUtilsProvider>

            <div style={{display: "flex", flexDirection: "row"}}>
                <Radio
                    checked={selectedColour === 0}
                    onChange={updateColour}
                    value="0"
                    name="radio-button-demo"
                    inputProps={{ 'aria-label': 'A' }}
                    size="small"
                    color="default"
                />
                <Radio
                    checked={selectedColour === 1}
                    onChange={(e) => updateColour(e)}
                    value="1"
                    name="radio-button-demo"
                    inputProps={{ 'aria-label': 'B' }}
                    size="small"
                    color="primary"
                />
                <Radio
                    checked={selectedColour === 2}
                    onChange={(e) => updateColour(e)}
                    value="2"
                    name="radio-button-demo"
                    inputProps={{ 'aria-label': 'C' }}
                    size="small"
                    color="secondary"
                />
            </div>

            <Button onClick={toggleStatus}>{status ? "DONE" : "REDO"}</Button>
            <Button onClick={deleteTodo}>X</Button>
        </div>
    )
}
