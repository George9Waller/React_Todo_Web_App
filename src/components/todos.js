import React, {useState, useEffect} from "react";
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
        getTodos()
    }, []); //blank to run only first time page is loaded, add field to run on change

    function getTodos() { //on snapshot returns a live state of the collection instead of get is static
        DATABASE
            .collection("users")
            .doc(uid)
            .collection("todos")
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

    function addTodo(e) {
        e.preventDefault();
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
            <form noValidate autoComplete="off">
                <TextField
                    id="standard-basic"
                    fullWidth
                    label="Todo"
                    value={todoInput}
                    onChange={(e) => setTodoInput(e.target.value)}
                />
                <Button
                    type="submit"
                    variant="contained"
                    style={{display: "none"}}
                    onClick={addTodo}
                >
                    Default
                </Button>
            </form>

            {todosList.map((todo) => (
                <TodoListItem name={todo.name} status={todo.status} id={todo.id} key={todo.id} />
            ))}
        </div>
    )
}
