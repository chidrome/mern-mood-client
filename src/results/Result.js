import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import SERVER_URL from '../constants/server';
import Weather from './Weather';
import Food from './Food';
import Movie from './Movie';
import Output from './Output'
import axios from 'axios';
import Loader from 'react-loader-spinner' //module for loading gif
import Restaurant from './Restaurant';
import Giphy from './Giphy';
import { Row, Col } from 'react-materialize';
// import SpotifyPlayer from 'react-spotify-player'
// import Music from './SpotifyPlayer';


// Need all of the gets to pass down as props for each component?
class Result extends Component {
  constructor(){
    super()
    this.state = {
      film: '',
      weather: '',
      weatherTemp: '',
      food: [],
      address:[],
      phone: [],
      rating: [],
      poster: [],
      isLoading: true,
      rainSaying: '',
      snowSaying: ''
    }
  }

  componentDidMount(){
    this.getFilms()
    this.getWeather()
    this.getFood()
    this.getGiphy()
    this.getSayingNorm()
    // this.setState({isLoading: false}) // This is used for acutal loader usage:
    setTimeout(() => this.setState({isLoading: false}), 1000)  //  Set to 3 sec timeout to see the effect
  }

  getFilms = () => {
    fetch(`https://api.themoviedb.org/3/genre/35/movies?api_key=b1b4d1f42d4ead1ab1d5fb013cb9340d`)
    .then(response => response.json())
    .then(json=> {
      console.log('films got')
      const filmObj = json.results.sort(function() { return 0.5 - Math.random() });
      this.setState({
        film: filmObj[0]
      })
    })
    .catch(error => {
      console.log("Error:", error)
    })
  }
  

  getFood = () => {
    let token = localStorage.getItem('serverToken');
    axios.post(SERVER_URL+'/result/restaurant', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      const shuffledData = response.data.sort(function() { return 0.5 - Math.random() });
      const restaurantList = shuffledData.map((obj, i) => {
        return obj.name;
      })
      const restaurantAddress = shuffledData.map((obj, i) => {
        return obj.location.display_address;
      })
      const restRate = shuffledData.map((obj, i) => {
        return obj.rating;
      })
      const restPhone = shuffledData.map((obj, i) => {
        return obj.phone;
      })
      const restaurantImg = shuffledData.map((obj, i) => {
        return obj.image_url;    
      })
      // console.log(restaurantImg);
      this.setState({ 
        food: restaurantList,
        poster: restaurantImg,
        address: restaurantAddress,
        rating: restRate,
        phone: restPhone
      })
    })
    .catch(err => {
      console.log(err)
    })
  }
  
  getGiphy = () => {
    let token = localStorage.getItem('serverToken');
    axios.post(SERVER_URL + '/result/giphy/'+this.state.weather.summary, {
      headers: { 'Authorization' : `Bearer ${token}` }
    })
    .then(response => {
      console.log("giphy got",response)
      const giphyList = response.data.data.sort(function() { return 0.5 - Math.random() });
      const giphyItem = giphyList.map((obj, i) => {
        return obj;
      })
      this.setState({ 
        giphy: giphyItem[0].images.original.url
      })
    })
    .catch(error => {
      console.log(error)
    })
  .catch(err => {
    console.log(err)
  })
}

  getWeather = () => {
    let token = localStorage.getItem('serverToken');
    axios.post(SERVER_URL+'/result/weather', {
      headers: { 'Authorization' : `Bearer ${token}` }
    })
    .then(json => {
      console.log("weather got", json);
      const currWeather=json.data.currently;
      this.setState({ weather: currWeather})
    })
    .catch(err => {
      console.log(err)
    })
  }
  
  getSayingNorm = () => {
    let token = localStorage.getItem('serverToken');
    axios.post(SERVER_URL + '/result/saying', {
      headers: { 'Authorization' : `Bearer ${token}` }
    })
    .then(json => {
      console.log('THESE ARE THE SAYING NORM', json)
      const rainSaying = json.data[0].output.rain.map((obj, i) => {
        return obj.output;
      })
      const snowSaying = json.data[0].output.snow.map((obj, i) => {
        return obj.output
      })
      this.setState({
        rainSaying: rainSaying,
        snowSaying: snowSaying
      })
    })
    .catch(error => {
      console.log('ERROR RETRIEVING NORM SAYING', error) 
    })
  }


  render() {
    if(this.state.isLoading){
      return(
        <div className="loading"><Loader type="Hearts" color="#B0C0BF" height={120} width={120} /> </div>
      )
    }
    if(this.props.user){
      // const filmList = this.state.films.map((film, i) => <Movie key={i} films={film} />)
      return(
        <div className="results">
        <Row>
          <div className="weather-field">
            <Weather summary={this.state.weather.summary} temp={this.state.weather.temperature} cssClass={this.state.weather.icon}/>
            {/* <WeatherTemp cssClass={this.state.weather.temperature}/> */}
          </div>
          <div className="output-field">
            <Output saying={this.state.rainSaying} />
          </div>
        </Row>
        <Row>
        <Col s={4} className='grid-example'>
          <div className="giphy-field">
            <Giphy giphy={this.state.giphy} />
          </div>
        </Col>
        <Col s={4} className='grid-example'>
          <div className="food-field">
            <Restaurant poster={this.state.poster} /> 
            <Food foodItem={this.state.food} address={this.state.address} rating={this.state.rating} phone={this.state.phone} />
          </div>
        </Col>
        <Col s={4} className='grid-example'>
          <div className="movie-field">
            <Movie films={this.state.film.original_title} filmVote={this.state.film.vote_average} filmOverview={this.state.film.overview} filmPoster={this.state.film.poster_path} />
          </div>
        </Col>
        </Row>
        </div>
      );
    }
    return (
      <div>
					<p><Link to="/login">Log In</Link> or <Link to="/signup">Sign up</Link> to get started!</p>
      </div>
    )
  }
}
export default Result