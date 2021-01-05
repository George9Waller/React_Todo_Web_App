import React, {useState, useEffect} from "react";
import NativeListener from 'react-native-listener';
import firebase from "firebase";
import {useSelector} from "react-redux";
import TextField from "@material-ui/core/TextField/TextField";
import Button from "@material-ui/core/Button"
import Typography from "@material-ui/core/Typography"
import {DATABASE} from "../firebase_config";
import TodoListItem from "./todo.js";

export default function TodoInterface()
{
    const [todosList, setTodos] = useState([]);
    const [todoInput, setTodoInput] = useState('');
    const { uid } = useSelector((state) => state.firebase.auth);
    const {displayName} = useSelector((state) => state.firebase.auth);

    useEffect(() => {
        getTodos();
    }, []); //blank to run only first time page is loaded, add field to run on change

    function getTodos() { //on snapshot returns a live state of the collection instead of get is static
        DATABASE
            .collection("users")
            .doc(uid)
            .collection("todos")
            .orderBy('due')
            .onSnapshot(function (querySnapshot) {
            setTodos(
                querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    name: doc.data().name,
                    status: doc.data().status,
                    created: doc.data().created,
                    due: doc.data().due,
                    colour: doc.data().colour
                }))
            );
        });
    }

    const handleAddTodoBtn = () => {
        addTodo();
    };

    const handleAddTodoKey = e => {
        console.log(`registered key code ${e.which}`);
        if (e.which === 13)
        {
            addTodo();
        }
    };

    function addTodo() {
        console.log(`called add todo function`)
        // e.preventDefault();
        // e.stopPropagation();
        // let due = new Date("2020-1-1");
        // due.setDate(due.getDate() + 2);
        DATABASE
            .collection("users")
            .doc(uid)
            .collection("todos")
            .add({
            colour: 0,
            created: firebase.firestore.FieldValue.serverTimestamp(),
            due: firebase.firestore.FieldValue.serverTimestamp(),
            name: todoInput,
            status: true
        })
            .then((docRef) => {
            docRef.update({
                todoID: docRef.id,
            });
        });

        setTodoInput("");
    }

    return (
        <div style={{minWidth: "384px"}}>
            <Typography>
                {displayName}
            </Typography>
            <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                <TextField
                    id="standard-basic"
                    fullWidth
                    label="Todo..."
                    value={todoInput}
                    onChange={(e) => setTodoInput(e.target.value)}
                    onKeyPress={handleAddTodoKey}
                    style={{marginBottom: "2vh"}}
                />
                <Button
                    type="button"
                    variant="outlined" 
                    color="primary"
                    onClick={handleAddTodoBtn}
                    style={{marginLeft: "2vw"}}
                >
                    Add
                </Button>
            </div>
            {todosList.map((todo) => (
                <TodoListItem name={todo.name} status={todo.status} due={todo.due} colour={todo.colour} done={false} id={todo.id} key={todo.id} />
            ))}
        </div>
    )
}
