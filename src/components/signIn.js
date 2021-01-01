import React from "react";
import {useFirebase} from "react-redux-firebase";
import {useHistory} from "react-router-dom";
import Button from "@material-ui/core/Button"

const SignIn = () => {
    const firebase = useFirebase();
    const history = useHistory();

    const SignInWithGoogle = () => {
        firebase
            .login({
                provider: "google",
                type: "popup",
            })
            .then(() => {
                history.push("/todos");
            });
    };

    return (
        <div>
            <Button
                variant="contained"
                onClick={(event) => {
                    event.preventDefault();
                    SignInWithGoogle();
                }}
            >
                Sign In with Google
            </Button>
        </div>
    );
};
export default SignIn;
