import React, {useState, useEffect} from "react";
import firebase from "firebase";
import {useSelector} from "react-redux";
import { makeStyles } from '@material-ui/core/styles';
import TextField from "@material-ui/core/TextField/TextField";
import Button from "@material-ui/core/Button"
import Typography from "@material-ui/core/Typography"
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import Divider from '@material-ui/core/Divider';
import {DATABASE} from "../firebase_config";
import {AccountListItem} from "./accountListItem.js"
import {grey} from "@material-ui/core/colors";


const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
    nested: {
        paddingLeft: theme.spacing(4),
    },
}));


export const PasswordManager = () => {
    const [accountList, setAccountList] = useState([]);
    const [search, setSearch] = useState('')
    const { uid } = useSelector((state) => state.firebase.auth);
    const classes = useStyles();


    useEffect(() => {
        getAccounts();
    }, []); //blank to run only first time page is loaded, add field to run on change


    function getAccounts() { //on snapshot returns a live state of the collection instead of get is static
        DATABASE
            .collection("users")
            .doc(uid)
            .collection("accounts")
            .orderBy('timestamp', 'desc')
            .limit(20)
            .onSnapshot(function (querySnapshot) {
                setAccountList(
                    querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        name: doc.data().name,
                        username: doc.data().username,
                        email: doc.data().email,
                        passwordHash: doc.data().passwordHash,
                        notes: doc.data().notes,
                        openOnLoad: doc.data().openOnLoad
                    }))
                );
            });
    }

    const addAccount = () => {
        DATABASE
            .collection("users")
            .doc(uid)
            .collection("accounts")
            .add({
                name: 'New Account',
                openOnLoad: true,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then((docRef) => {
                docRef.update({
                    accountID: docRef.id,
                });
            });
    }

    const handleSearch = (search) => {
        setSearch(search)
        if (search.length === 0)
        {
            return getAccounts();
        }
        DATABASE
            .collection("users")
            .doc(uid)
            .collection("accounts")
            .where('keywords', 'array-contains', search.toLowerCase())
            .orderBy('timestamp')
            .limit(20)
            .onSnapshot(function (querySnapshot) {
                setAccountList(
                    querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        name: doc.data().name,
                        username: doc.data().username,
                        email: doc.data().email,
                        passwordHash: doc.data().passwordHash,
                        notes: doc.data().notes,
                        openOnLoad: doc.data().openOnLoad
                    }))
                );
            });
    }

    return (
        <div style={{minWidth: "384px"}}>
            <Divider variant="middle" style={{marginTop: '2vh'}} />
            <TextField
                id="standard-basic"
                autoComplete="off"
                fullWidth
                label="Search..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                style={{marginBottom: "2vh"}}
            />
            <Button
                type="button"
                onClick={addAccount}
                style={{align: 'left'}}
            >
                Add Account
            </Button>
            <List
                component="nav"
                // className={classes.root}
                // aria-labelledby="list-subheader"
                // subheader={<ListSubheader component="div" id="list-subheader">
                //     Accounts
                // </ListSubheader>
                // }
            >
                {accountList.map((account) => (
                    <>
                        <AccountListItem nameProp={account.name} usernameProp={account.username} emailProp={account.email} passwordHashProp={account.passwordHash} notesProp={account.notes} openOnLoadProp={account.openOnLoad} userid={uid} id={account.id} key={account.id}  />
                        <Divider variant="middle" component="li" />
                    </>
                ))}
            </List>
        </div>
    );

}
