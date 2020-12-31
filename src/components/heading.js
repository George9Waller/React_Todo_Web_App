import React from "react";
import Typography from "@material-ui/core/Typography";
import Clock from 'react-live-clock';

export default function Heading() {
    return (
        <div>
            {/*Title*/}
            <Typography
                variant="h1"
                style={{borderBottom: "solid 2px", borderBottomColor: "primary", marginBottom: "1vh"}}
            >
                GW Todo
            </Typography>

            {/*Clock*/}
            <Typography
                varient="subtitle"
                style={{marginBottom: "10vh", color: "error"}}
            >
                <Clock
                    format={'dddd, MMMM Do, YYYY, hh:mm:ss A'}
                    ticking={true}
                />
            </Typography>
        </div>
    )
}
