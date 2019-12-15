import React, {Component} from 'react';
import * as $ from 'jquery';
import ScrollView, { ScrollElement } from "./scroller";
import './App.css';

class App extends Component {
  constructor(){
    super();
    const params = this.getHashParams();
    const token = params.access_token;
    this.state = {
      loggedIn: token ? true : false,
      accessToken: token,
      topArtists: [{
        name: "James",
        image: "https://static.scientificamerican.com/sciam/cache/file/32665E6F-8D90-4567-9769D59E11DB7F26_source.jpg?w=590&h=800&7E4B4CAD-CAE1-4726-93D6A160C2B068B2",
        id: null,
        link: null
      }],
      events: [{
        name: "Carter",
        date: null,
        venue: null,
        city: null,
        country: null,
        image: "https://www.petmd.com/sites/default/files/Acute-Dog-Diarrhea-47066074.jpg",
        link: null
      }]
    }
  }

  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
       e = r.exec(q);
    }
    return hashParams;
  }

  getTopArtists() {
    $.ajax({
      url: 'https://api.spotify.com/v1/me/top/artists',
      type: "GET",
      headers: {
        'Authorization' : 'Bearer ' + this.state.accessToken
      },
      success: (json) => {
        console.log(json);
        let i;
        this.state.topArtists = [];
        for(i = 0; i < Object.keys(json.items).length; i++){
          this.setArtistValues(json.items[i]);
        }
        console.log(this.state.topArtists);
      }
    });
  }

  setArtistValues(data) {
    this.setState({
      topArtists: [...this.state.topArtists, {name: data.name, 
        image: data.images[1].url, 
        id: data.uri.substring(15),
        link: data.external_urls.spotify}]
    });
    console.log(data.external_urls.spotify);
  }

  getConcerts(){
    this.state.events = [];
    this.state.topArtists.forEach(e => {this.getConcertForArtist(e.name)});
  }

  getConcertForArtist(artistName){
    $.ajax({
      type:"GET",
      url:"https://app.ticketmaster.com/discovery/v2/events.json?keyword=" + artistName + "&apikey=RYGH6ywE2k7EdbSoj1Ipuq4EMDmzt804",
      async:true,
      dataType: "json",
      success: (json) => {
        if (json.hasOwnProperty('_embedded')) {
          let eventsArr = json._embedded.events;
          let i;
          for(i = 0; i < Object.keys(eventsArr).length; i++){
            this.setEventValues(eventsArr[i]);
          }
        }
      }
    });
  }

  setEventValues(event){
    let venue = event._embedded.venues[0];
    this.setState({
      events: [...this.state.events, {
        name: event.name, 
        date: event.dates.start.localDate, 
        venue: venue.name,
        city: venue.city.name,
        country: venue.country.countryCode,
        image: event.images[0].url,
        link: event.url
      }]
    });
  }

  render() {
    return (
      <div className="App">
        <div className="Header">
          <h1 className="Title">Find Me A Concert</h1>
        </div>

        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css"></link>

        <div className="column">
          <div className="columnHeader">
            <h2 className="fav">Your Favorite Artists</h2>
          </div>
        <ScrollView ref={scroller => this._scroller = scroller}>
          <div className="artistScroller">
            {this.state.topArtists.map(({ name, image }) => {
              return (
                <ScrollElement name={name}>
                  <div className="item">
                    <div class="w3-card-2 w3-hover-shadow">
                      <img src={image} alt={name}/>
                      <div class="w3-container w3-center">
                        <p>{name}</p>
                      </div>
                    </div>
                  </div>
                </ScrollElement>
              );
            })}
          </div>
        </ScrollView>
        </div>

        <div className="column">

          <div className="favArtist">
            Favorite Artist: {this.state.topArtists[0].name}
          </div>

          { !this.state.loggedIn && <a href='http://localhost:8888'>
            <button className="buttons">
              Login To Spotify
            </button>
          </a>
          }

          { this.state.loggedIn &&
          <button className="buttons" onClick={() => this.getTopArtists()}>
            Check Favorite Artist
          </button>
          }

          { this.state.loggedIn && 
          <button className="buttons" onClick={() => this.getConcerts()}>
            Get Concerts
          </button>
          }
          {
            this.state.loggedIn && <h2 className="LoggedIn"> Logged In </h2>
          }
        </div>

        <div className="column">
          <div className="columnHeader">
            <h2 className="fav">Their Events Near You</h2>
          </div>
        <ScrollView ref={scroller => this._scroller = scroller}>
          <div className="eventScroller">
            {this.state.events.map(({ name, date, city, country, image }) => {
              return (
                <ScrollElement name={name}>
                  <div className="item">
                    <div class="w3-card-2 w3-hover-shadow">
                      <img src={image} alt={name}/>
                      <div class="w3-container w3-center">
                        <h3>{name}</h3>
                        <p>{city}, {country}</p>
                        <p>{date}</p>
                      </div>
                    </div>
                  </div>
                </ScrollElement>
              );
            })}
          </div>
        </ScrollView>
        </div>


      </div>
    );
  }
}

export default App;