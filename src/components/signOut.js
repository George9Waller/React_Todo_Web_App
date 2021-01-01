import React from "react";
import {useFirebase} from "react-redux-firebase";
import {useHistory} from "react-router-dom";
import Button from "@material-ui/core/Button"

const SignOut = () => {
    const firebase = useFirebase();
    const history = useHistory();

    const SignOut = () => {
        firebase
            .logout()
            .then(() => {
                history.push("/");
            });
    };

    return (
        <div>
            <br/>
            <Button
                onClick={(event) => {
                    event.preventDefault();
                    SignOut();
                }}
            >
                Sign Out
            </Button>
        </div>
    );
};
export default SignOut;
