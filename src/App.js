import React, { useState } from "react";
import {Switch, Route} from "react-router-dom";
import { ThemeProvider, IconButton } from '@material-ui/core';
import { createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline"
import { Brightness3, Brightness5 } from '@material-ui/icons';
import Heading from './components/heading';
import TodoInterface from './components/todos';
import PrivateRoute from './components/privateRoute';
import SignIn from './components/signIn';
import SignOut from './components/signOut';
import './App.css';

function App() {
    // theme
    const [theme, setTheme] = useState(false);
    const icon = !theme ? <Brightness5 /> : <Brightness3 />;
    const appliedTheme = createMuiTheme(theme ? light : dark);

    return (
        <ThemeProvider theme={appliedTheme}>
            <CssBaseline />
            <div className="App">
                <header className="App-header">
                    <Heading />
                    <Switch>
                        <PrivateRoute path = "/todos">
                            <TodoInterface />
                            <SignOut />
                        </PrivateRoute>
                        <Route path = "/">
                            <SignIn/>
                        </Route>
                    </Switch>
                    {/*Dark Mode toggle*/}
                    <br/>
                    <IconButton
                        edge="end"
                        color="inherit"
                        aria-label="mode"
                        onClick={() => setTheme(!theme)}
                        href=""
                    >
                        {icon}
                    </IconButton>
                </header>
            </div>
        </ThemeProvider>
    );
}

export const dark ={
    palette: {
        type: 'dark',
        background: {
            default: '#222222'
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

export default App;
