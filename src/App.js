import React, {useState, useEffect, useLayoutEffect} from "react";
import firebase from 'firebase';
import {DATABASE} from "./firebase_config";
import {Switch, Route, BrowserRouter} from "react-router-dom";
import {Tabs, TabLink, TabContent} from 'react-tabs-redux';
import 'react-tabs/style/react-tabs.css';
import 'weather-icons/css/weather-icons.css'
import { ThemeProvider, IconButton } from '@material-ui/core';
import { createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline"
import { Brightness3, Brightness5 } from '@material-ui/icons';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Heading from './components/heading';
import TodoInterface from './components/todos';
import PrivateRoute from './components/privateRoute';
import SignIn from './components/signIn';
import SignOut from './components/signOut';
import './App.css';
import {useSelector} from "react-redux";
import {PasswordManager} from "./components/passwordManager";
import Weather from "./components/weather";

export const dark ={
    palette: {
        type: 'dark',
        background: {
            default: '#222222'
        },
        active: {
            default: '#ffffff'
        }
    }
};

export const light ={
    palette: {
        type: 'light',
        background: {
            default: '#ffffff'
        }
    }
};

function App() {
    const [theme, setTheme] = useState(false);
    const icon = !theme ? <Brightness5 /> : <Brightness3 />;
    const {displayName} = useSelector((state) => state.firebase.auth);
    const appliedTheme = createMuiTheme(theme ? light : dark);
    const { uid } = useSelector((state) => state.firebase.auth);
    const [activeTab, setActiveTab] = useState('todo');

    useEffect(() => {
        DATABASE.collection('users').doc(uid).get().then(function(doc) {
            if (doc.data().activeTab) {
                setActiveTab(doc.data().activeTab);
            }
            else {
                DATABASE.collection('users').doc(uid).update({
                    activeTab: 'todo'
                });
                setActiveTab('todo');
            }
            if (doc.data().theme) {
                setTheme(doc.data().theme);
            }
            else {
                DATABASE.collection('users').doc(uid).update({
                    theme: false
                });
                setTheme(false);
            }
        });
    }, [uid]);

    return (
        <ThemeProvider theme={appliedTheme}>
            <CssBaseline />
            <div className="App">
                <header className="App-header">
                    <Heading />
                    <BrowserRouter>
                        <Switch>
                            <PrivateRoute path="/todos">
                                <Tabs
                                    name="utilities"
                                    handleSelect={(selectedTab, namespace) => {
                                        setActiveTab(selectedTab);
                                        DATABASE.collection('users').doc(uid).update({
                                                    activeTab: selectedTab
                                                });
                                    }}
                                    selectedTab={activeTab}
                                    //renderActiveTabContentOnly={true}
                                    activeLinkStyle={{borderBottom: 'solid 2px', borderBottomColor: 'Primary', borderRadius: '0px'}}
                                >
                                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                                        <div style={{marginRight: "1vw"}}>
                                            <TabLink
                                                to="weather"
                                                component={Button}
                                            >
                                                Weather
                                            </TabLink>
                                        </div>
                                        <Divider orientation="vertical" flexItem />
                                        <div style={{marginRight: "1vw", marginLeft: "1vw"}}>
                                            <TabLink
                                                to="todo"
                                                component={Button}
                                            >
                                                Todo
                                            </TabLink>
                                        </div>
                                        <Divider orientation="vertical" flexItem />
                                        <div style={{marginLeft: "1vw"}}>
                                            <TabLink
                                                to="passwordmanager"
                                                component={Button}
                                            >
                                                Password Manager
                                            </TabLink>
                                        </div>
                                    </div>
                                    <TabContent for="weather">
                                        <Weather />
                                    </TabContent>
                                    <TabContent for="todo">
                                        <TodoInterface />
                                    </TabContent>
                                    <TabContent for="passwordmanager">
                                        <PasswordManager />
                                    </TabContent>
                                </Tabs>
                                <SignOut />
                                <Typography variant="subtitle2">{displayName}</Typography>
                            </PrivateRoute>
                            <Route path="/">
                                <SignIn/>
                            </Route>
                        </Switch>
                    </BrowserRouter>
                    {/*Dark Mode toggle*/}
                    <br/>
                    <IconButton
                        edge="end"
                        color="inherit"
                        aria-label="mode"
                        onClick={() => {
                            if (uid) {
                                DATABASE.collection('users').doc(uid).update({
                                    theme: !theme
                                });
                            }
                            setTheme(!theme);
                        }}
                        href=""
                    >
                        {icon}
                    </IconButton>
                </header>
            </div>
        </ThemeProvider>
    );
}



export default App;
