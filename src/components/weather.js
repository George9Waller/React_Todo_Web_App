import React, {useState, useEffect, useLayoutEffect} from "react";
import firebase from "firebase";
import {useSelector} from "react-redux";
import { makeStyles } from '@material-ui/core/styles';
import TextField from "@material-ui/core/TextField/TextField";
import Button from "@material-ui/core/Button";
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Typography from "@material-ui/core/Typography";
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import NightsStayIcon from '@material-ui/icons/NightsStay';
import Brightness5Icon from '@material-ui/icons/Brightness5';
import CircularProgress from '@material-ui/core/CircularProgress';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Switch from '@material-ui/core/Switch';
import {Forecast} from './forecast.js';
import {WeatherApiKey, MapBoxApiKey} from '../api/apiKey.js';
import * as base_weather_data from './base_weather_data.json';
import {DATABASE} from "../firebase_config";

const weatherApiKey = WeatherApiKey();
const mapBoxApiKey = MapBoxApiKey();

const useStyles = makeStyles((theme) => ({
    root: {
        marginBottom: '5px',
        marginTop: '5px',
        fontFamily: 'Roboto, sans-serif',
        fontSize: 'large',
    },
    small: {
        fontSize: 'small'
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
}));


export default function Weather() {
    const classes = useStyles();
    const [weatherData, setWeatherData] = useState(base_weather_data);
    const [units, setUnits] = useState(null);
    const [unitsSymbol, setUnitsSymbol] = useState('C');
    const [inputCountry, setInputCountry] = useState('UK');
    const [inputCity, setInputCity] = useState('Brighton');
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');
    const [roundTo, setRoundTo] = useState(1);
    const [showUnitSymbols, setShowUnitSymbols] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { uid } = useSelector((state) => state.firebase.auth);


    useEffect( ()  => {

        DATABASE.collection('users').doc(uid).get().then(function(doc) {
            console.log(doc.data(), "read")
            if (doc.data().weatherCity) {
                console.log('read city: ', doc.data().weatherCity)
                setInputCity(doc.data().weatherCity);
            }
            else {
                DATABASE.collection('users').doc(uid).update({
                    weatherCity: 'Brighton',
                });
                setInputCity('Brighton')
            }

            if (doc.data().weatherCountry) {
                setInputCountry(doc.data().weatherCountry);
            }
            else {
                DATABASE.collection('users').doc(uid).update({
                    weatherCountry: '',
                });
            }
        });
    }, []);

    useEffect( ()  => {
        if (inputCity){
            console.log('input city', inputCity)
            DATABASE.collection('users').doc(uid).get().then(function(doc) {
                if (doc.data().weatherRounding) {
                    setRoundTo(doc.data().weatherRounding);
                }
                else {
                    DATABASE.collection('users').doc(uid).update({
                        weatherRounding: 1,
                    });
                }

                try {
                    setShowUnitSymbols(doc.data().weatherShowUnitSymbols);
                }
                catch {
                    DATABASE.collection('users').doc(uid).update({
                        weatherShowUnitSymbols: true,
                    });
                }

                if (doc.data().weatherUnits) {
                    setUnits(doc.data().weatherUnits);
                }
                else {
                    DATABASE.collection('users').doc(uid).update({
                        weatherUnits: 'metric',
                    });
                    setUnits('metric')
                }

            });
        }
    }, []);

    useEffect(() => {
        if (units) {
            //handleSearchCurrentLocation(true);
            getWeather()
            setIsLoading(true);
        }
    }, [units]);

    // useEffect(() => {
    //     DATABASE.collection('users').doc(uid).update({
    //         weatherCity: city,
    //     });
    // }, [city])
    //
    // useEffect(() => {
    //     DATABASE.collection('users').doc(uid).update({
    //         weatherCountry: country,
    //     });
    // }, [country])

    const getWeather = async (lat, lon) => {
        console.log(inputCity, inputCountry, lat, lon)
        setIsLoading(true);

        let api_call
        if (lat && lon) {
            api_call = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${units}&exclude={part}&appid=${weatherApiKey}`);
        } else {
            const place = encodeURI(`${inputCity}, ${inputCountry}`);
            let res
            if (place !== ', ') {
                const locationCall = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json?access_token=${mapBoxApiKey}`);
                res = await locationCall.json();
            }
            let lat;
            let lon;
            try {
                lat = res.features[0].geometry.coordinates[1];
                lon = res.features[0].geometry.coordinates[0];
            }
            catch {
                lat = 50.83;
                lon = -0.1;
            }
            api_call = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${units}&exclude={part}&appid=${weatherApiKey}`);
        }
        const response = await api_call.json();

        const callGeocode = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${response.lon},${response.lat}.json?access_token=${mapBoxApiKey}`);
        const place = await callGeocode.json();

        console.log(place);
        let tempCity
        let tempCountry
        for (let i = place.features.length - 1; i >= 0; i--) {
            if (place.features[i].place_type[0] === 'place' || place.features[i].place_type[0] === 'region') {
                tempCity = place.features[i].text;
            }
            else if (place.features[i].place_type[0] === 'country') {
                tempCountry = place.features[i].text;
            }
         }
        setCity(tempCity);
        setCountry(tempCountry)
        setWeatherData(response);
        console.log('response', response, Object.entries(response));
        setInputCity('');
        setInputCountry('');

        DATABASE.collection('users').doc(uid).update({
            weatherCity: tempCity,
            weatherCountry: tempCountry,
        });
    }

    useEffect(() => {
        try {
            if (weatherData.daily[0].temp.day) {
                setIsLoading(false)
                return <h1>Data loaded</h1>
            }
        }
        catch {
            setIsLoading(true)
        }
    }, [weatherData])

    const handleSearch = () =>
    {
        // DATABASE.collection('users').doc(uid).update({
        //     weatherCity: inputCity,
        //     weatherCountry: inputCountry
        // });
        getWeather();
    }

    const handleSearchCurrentLocation = (force) => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(function(position) {
                setWeatherData(getWeather(position.coords.latitude, position.coords.longitude));
                return;
            });
        }
        else {
            setWeatherData(getWeather())
        }
    }

    const getDay = (index) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[index];
    }

    const getTime = (unix) => {
        const d = new Date(unix * 1000);
        return d.toLocaleTimeString().slice(0, 5);
    }

    const getTemp = (temp) => {
        return `${Math.round( temp * roundTo + Number.EPSILON ) / roundTo}\u00B0${showUnitSymbols ? unitsSymbol : ""}`
    }

    const handleUnitChange = (e) => {
        setUnits(e.target.value);
        switch (e.target.value) {
            case 'metric':
                setUnitsSymbol('C')
                break;

            case 'imperial':
                setUnitsSymbol('F')
                break;

            case 'standard':
                setUnitsSymbol('K')
                break;

            default:
                setUnitsSymbol('?')
        }

        DATABASE.collection('users').doc(uid).update({
            weatherUnits: e.target.value,
        });
    }

    const handleRoundingChange = (e) => {
        setRoundTo(parseInt(e.target.value));

        DATABASE.collection('users').doc(uid).update({
            weatherRounding: parseInt(e.target.value),
        });
    }

    const handleShowUnitSymbols = (e) => {
        setShowUnitSymbols(e.target.checked);

        DATABASE.collection('users').doc(uid).update({
            weatherShowUnitSymbols: e.target.checked,
        });
    }

    function minmaxTemp(min, max, feelday, feelnight) {
        const box = {
            backgroundColor: '#00000022',
            borderRadius: '3px',
            padding: '1vw'
        }
        return (
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                <div>
                    <small className={classes.root}>Feels Like</small>
                    <h4 className={classes.root} style={box}>{getTemp(feelday)}<span style={{color: 'grey'}}>/{getTemp(feelnight)}</span></h4>
                </div>
                <div style={{width: '2vw'}}></div>
                <div>
                    <small className={classes.root}>Low</small>
                    <h4 className={classes.root} style={box}>{getTemp(min)}</h4>
                </div>
                <div style={{width: '2vw'}}></div>
                <div>
                    <small className={classes.root}>High</small>
                    <h4 className={classes.root} style={box}>{getTemp(max)}</h4>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return <CircularProgress color="secondary" />
    }
    return (
        // <>
        //     <h1>Loaded main page</h1>
        //     <p>{weatherData.daily[0].temp.day}</p>
        // </>
        <div className="container" style={{marginTop: '5vh'}}>
            <Card>
                <CardContent>
                    <TextField
                        id="standard-basic"
                        autoComplete="off"
                        label="City"
                        value={inputCity}
                        onChange={(e) => {
                            setInputCity(e.target.value);
                            e.target.value = '';
                        }}
                        style={{marginBottom: "0"}}
                    />
                    <TextField
                        id="standard-basic"
                        autoComplete="off"
                        label="Country"
                        value={inputCountry}
                        onChange={(e) => {
                            setInputCountry(e.target.value);
                            e.target.value = '';
                        }}
                        style={{marginBottom: "0"}}
                    />
                    <Button
                        type="button"
                        variant="outlined"
                        color="default"
                        onClick={handleSearch}
                        style={{marginLeft: "2vw"}}
                    >
                        Search
                    </Button>
                    <Button
                        type="button"
                        variant="outlined"
                        color="secondary"
                        onClick={handleSearchCurrentLocation}
                        style={{marginLeft: "2vw"}}
                    >
                        Current Location
                    </Button>
                </CardContent>
            </Card>
            <div style={{height: '2vh'}}></div>
            <Card>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item lg={8}>
                            <Typography variant="h2">{city}</Typography>
                            <Typography variant="subtitle2">{country}</Typography>
                            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '5px'}}>
                                <div style={{display: 'flex', flexDirection: 'row'}}>
                                    <Brightness5Icon />
                                    <p style={{fontSize: 'small', paddingBottom: '50px', marginLeft: '5px'}} className={classes.root}>{getTime(weatherData.daily[0].sunrise)}</p>
                                </div>
                                <div style={{width: '2vw'}}></div>
                                <div style={{display: 'flex', flexDirection: 'row'}}>
                                    <NightsStayIcon />
                                    <p style={{fontSize: 'small', paddingBottom: '50px', marginLeft: '5px'}} className={classes.root}>{getTime(weatherData.daily[0].sunset)}</p>
                                </div>
                            </div>
                            <Typography variant="h1" style={{marginTop: '3vh'}}><i className={`wi wi-owm-${weatherData.current.weather[0].id} display-1`} /></Typography>
                            <Typography variant="overline" style={{marginTop: '3vh'}}>{weatherData.current.weather[0].description}</Typography>
                            <h3 style={{marginTop: '3vh', marginBottom: '5px'}}>{getTemp(weatherData.daily[0].temp.day)}<span style={{color: 'grey', size: 'small'}}>/{getTemp(weatherData.daily[0].temp.night)}</span></h3>
                            <p style={{fontSize: 'small', paddingBottom: '50px'}} className={classes.root}>Day    <span style={{color: 'grey'}}>Night</span></p>
                            {minmaxTemp(weatherData.daily[0].temp.min, weatherData.daily[0].temp.max, weatherData.daily[0].feels_like.day, weatherData.daily[0].feels_like.night)}
                        </Grid>
                        <Grid item xl={4}>
                            <div >
                                {weatherData.hourly.slice(0, 16).map((hour, index) => (
                                    index % 1 === 0 ?
                                        <div style={{width: '100%'}}>
                                            <Paper style={{padding: '3px'}}>
                                                <div style={{display: 'flex', flexDirection: 'row wrap', marginBottom: '3px', alignItems: 'center', justifyContent: 'space-between'}}>
                                                    <Typography variant="h4"><i className={`wi wi-owm-${hour.weather[0].id} display-1`} /></Typography>
                                                    <Typography variant="body2" style={{marginLeft: '3px'}}>{`${getTime(hour.dt)}`}</Typography>
                                                    <Typography variant="body2" style={{marginLeft: '3px'}}>{Math.round( hour.pop * roundTo + Number.EPSILON ) / roundTo}% <i className={`wi wi-raindrops`} /></Typography>
                                                    <Typography variant="body2" style={{marginLeft: '3px'}}>{getTemp(hour.temp)} <span style={{color: 'grey'}}><i>{getTemp(hour.feels_like)}</i></span></Typography>
                                                </div>
                                            </Paper>
                                        </div>
                                        :
                                        ""


                                ))}
                            </div>
                        </Grid>
                    </Grid>

                    <div style={{height: '2vh'}}></div>

                    <Divider variant='fullWidth' />

                    <div style={{height: '2vh'}}></div>
                    <div className={classes.root}>
                        <Grid container spacing={3}>
                            {weatherData.daily.slice(1).map(day => (
                                <Grid item xs>
                                    <Paper className={classes.paper}>
                                        <h3>{getDay(new Date(day.dt * 1000).getDay())}</h3>
                                        <Typography variant="h3"><i className={`wi wi-owm-${day.weather[0].id}`}></i></Typography>
                                        <Typography variant="overline" style={{marginTop: '3vh', fontSize: 'x-small'}}>{day.weather[0].description}</Typography>
                                        <p>{getTemp(day.temp.day)}<span style={{color: 'grey', size: 'small'}}>/{getTemp(day.temp.night)}</span></p>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </div>

                </CardContent>
            </Card>
            <div style={{height: '2vh'}}></div>
            <Card>
                <CardContent style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Units</FormLabel>
                        <RadioGroup row aria-label="position" name="position" defaultValue={units} onChange={handleUnitChange}>
                            <FormControlLabel
                                value="metric"
                                control={<Radio color="default" />}
                                label="Celsius"
                                labelPlacement="bottom"
                            />
                            <FormControlLabel
                                value="imperial"
                                control={<Radio color="default" />}
                                label="Fahrenheit"
                                labelPlacement="bottom"
                            />
                            <FormControlLabel
                                value="standard"
                                control={<Radio color="default" />}
                                label="Kelvin"
                                labelPlacement="bottom"
                            />
                        </RadioGroup>
                    </FormControl>

                    <Divider orientation="vertical" flexItem />

                    <FormControl component="fieldset">
                        <FormLabel component="legend">Rounding</FormLabel>
                        <RadioGroup row aria-label="position" name="position" defaultValue={roundTo.toString()} onChange={handleRoundingChange}>
                            <FormControlLabel
                                value="1"
                                control={<Radio color="default" />}
                                label="Whole"
                                labelPlacement="bottom"
                            />
                            <FormControlLabel
                                value="10"
                                control={<Radio color="default" />}
                                label="1 decimal"
                                labelPlacement="bottom"
                            />
                            <FormControlLabel
                                value="100"
                                control={<Radio color="default" />}
                                label="2 decimal"
                                labelPlacement="bottom"
                            />
                        </RadioGroup>
                    </FormControl>

                    <Divider orientation="vertical" flexItem />

                    <FormGroup row>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showUnitSymbols}
                                    onChange={handleShowUnitSymbols}
                                    name="showUnitSymbols"
                                />
                            }
                            label="Show unit symbols"
                        />
                    </FormGroup>

                </CardContent>
            </Card>
        </div>
    );

}