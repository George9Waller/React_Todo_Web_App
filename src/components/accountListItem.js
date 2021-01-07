import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import {Button, InputAdornment} from "@material-ui/core";
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import TextField from '@material-ui/core/TextField';
import {DATABASE} from "../firebase_config";
import Typography from "@material-ui/core/Typography";
import firebase from "firebase";


const useStyles = makeStyles((theme) => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));


export const AccountListItem = ({nameProp, usernameProp, emailProp, passwordHashProp, notesProp, openOnLoadProp, id, userid}) =>
{
    var CryptoJS = require("crypto-js");
    let pass
    if (!passwordHashProp)
    {
        pass = ''
    }
    else {
        pass = CryptoJS.AES.decrypt(passwordHashProp, userid).toString(CryptoJS.enc.Utf8);
    }
    let initialOpen = false
    if (nameProp.length === 0) {
        initialOpen = true;
    }

    const classes = useStyles();
    const [open, setOpen] = React.useState(initialOpen);
    const [name, setName] = React.useState(nameProp || '');
    const [username, setUsername] = React.useState(usernameProp || '');
    const [email, setEmail] = React.useState(emailProp || '');
    const [password, setPassword] = React.useState(pass);
    const [notes, setNotes] = React.useState(notesProp || '');
    const [showPasswordOptions, setShowPasswordOptions] = React.useState(false)
    const [includeLowercase, setIncludeLowercase] = React.useState(true)
    const [includeUppercase, setIncludeUppercase] = React.useState(true)
    const [includeNumbers, setIncludeNumbers] = React.useState(true)
    const [includeSymbols, setIncludeSymbols] = React.useState(true)
    const [passwordLength, setPasswordLength] = React.useState(16)
    const [showPassword, setShowPassword] = React.useState(false);
    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const handleMouseDownPassword = () => setShowPassword(!showPassword);

    const createKeywords = (name) => {
        const arrName = [];
        let curName = '';
        name.split('').forEach((letter) => {
            curName += letter;
            arrName.push(curName);
        });
        return arrName;
    }

    const generateKeywords = (name, username, email) => {
        const nameKeywords = createKeywords(name.toLowerCase());
        const usernameKeywords = createKeywords(username.toLowerCase());
        const emailKeywords = createKeywords(email.toLowerCase());
        return [
            ...new Set([
                ...nameKeywords,
                ...usernameKeywords,
                ...emailKeywords
            ])
        ];
    };

    const handleGeneratePassword = () =>
    {
        const generator = require('generate-password');
        let pass = generator.generate({
            length: passwordLength,
            numbers: includeNumbers,
            symbols: includeSymbols,
            lowercase: includeLowercase,
            uppercase: includeUppercase,
            excludeSimilarCharacters: true,
            exclude: "'",
            strict: true
        });
        setPassword(pass);
    }

    const handleDelete = () => {
        DATABASE
            .collection("users")
            .doc(userid)
            .collection("accounts")
            .doc(id)
            .delete();
    }

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        DATABASE
            .collection("users")
            .doc(userid)
            .collection("accounts")
            .doc(id)
            .update({
                name: name,
                username: username,
                email: email,
                passwordHash: CryptoJS.AES.encrypt(password, userid).toString(),
                notes: notes,
                openOnLoad: false,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                keywords: generateKeywords(name, username, email)
            }).then(() => {
            setOpen(false);
            setShowPassword(false)
        });
    };

    return (
        <>
            <ListItem>
                <ListItemText primary={name} secondary={email} />
                <ListItemSecondaryAction>
                    <div onClick={handleOpen}>
                        <IconButton edge="end" aria-label="edit">
                            <VisibilityIcon />
                        </IconButton>
                    </div>
                </ListItemSecondaryAction>
            </ListItem>

            <Modal
                aria-labelledby="modal-account-name"
                className={classes.modal}
                open={open}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={open}>
                    <div className={classes.paper} style={{minWidth: "384px", width: "70vw"}}>
                        <Typography variant="subtitle2" style={{marginLeft: 'auto', width: '300px', textAlign: "right"}}>Click outside this box or x to save</Typography>
                        <Button variant="contained" style={{float: 'right'}} onClick={handleClose}><CloseIcon /></Button>
                        <h2 id="modal-account-name">{name}</h2>
                        <div style={{ display: 'flex', flexDirection: "column"}}>
                            <TextField label="Name" value={name} variant="outlined" autoComplete="off" onChange={(e) => setName(e.target.value)} />
                            <br />
                            <TextField label="Username" type="username" value={username} variant="outlined" autoComplete="off" onChange={(e) => setUsername(e.target.value)} />
                            <br />
                            <TextField label="Email" type="email" value={email} variant="outlined" autoComplete="off" onChange={(e) => setEmail(e.target.value)} />
                            <br />
                            <TextField
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                variant="outlined"
                                autoComplete="off"
                                onChange={(e) => setPassword(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                                onMouseDown={handleMouseDownPassword}
                                            >
                                                {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            >
                            </TextField>
                            <Button
                                variant="contained"
                                color={showPasswordOptions ? "default" : "primary"}
                                style={{marginLeft: 'auto', width: '170px'}}
                                onClick={() => {setShowPasswordOptions(!showPasswordOptions)}}
                            >
                                Auto Password
                            </Button>
                            <div style={{display: showPasswordOptions ? "block" : "none", marginLeft: 'auto'}}>
                                <FormGroup row>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={includeLowercase}
                                                label="Include lowercase"
                                                color="default"
                                                onChange={() => {setIncludeLowercase(!includeLowercase)}}
                                            />
                                        }
                                        label="Include lowercase"
                                        labelPlacement="bottom"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={includeUppercase}
                                                label="Include uppercase"
                                                color="default"
                                                onChange={() => {setIncludeUppercase(!includeUppercase)}}
                                            />
                                        }
                                        label="Include uppercase"
                                        labelPlacement="bottom"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={includeNumbers}
                                                label="Include lowercase"
                                                color="default"
                                                onChange={() => {setIncludeNumbers(!includeNumbers)}}
                                            />
                                        }
                                        label="Include numbers"
                                        labelPlacement="bottom"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={includeSymbols}
                                                label="Include lowercase"
                                                color="default"
                                                onChange={() => {setIncludeSymbols(!includeSymbols)}}
                                            />
                                        }
                                        label="Include symbols"
                                        labelPlacement="bottom"
                                    />
                                    <FormControlLabel
                                        control={
                                            <TextField
                                                type="number"
                                                defaultValue={passwordLength}
                                                min="8"
                                                max="30"
                                                label="Length"
                                                style={{width: "50px", marginLeft: "2vw"}}
                                                onChange={(e) => {setPasswordLength(parseInt(e.target.value))}}
                                            />
                                        }
                                    />
                                    <FormControlLabel
                                        control={
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                style={{marginLeft: "2vw"}}
                                                onClick={handleGeneratePassword}
                                            >
                                                Generate
                                            </Button>
                                        }
                                    />
                                </FormGroup>
                            </div>
                            <br />
                            <TextField label="notes" defaultValue={notes} multiline variant="outlined" autoComplete="off" onChange={(e) => setNotes(e.target.value)} />
                            <br />
                            <Button variant="contained" color="secondary" style={{marginRight: 'auto'}} onClick={handleDelete}><DeleteIcon /></Button>
                        </div>
                    </div>
                </Fade>
            </Modal>
        </>
    );
}