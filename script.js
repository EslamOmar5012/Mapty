'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  id = Number(new Date()).toString().slice(-5);
  date = new Date();
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; //in Km
    this.duration = duration; //in Min
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cedence) {
    super(coords, distance, duration);
    this.cedence = cedence;
    this.calcPace();
  }

  calcPace() {
    //min/km
    this.pace = this.duration / this.distance;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
  }
}

///////////////////////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE
class App {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Geolocation is not supported by this browser.');
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude, longitude, accuracy } = position.coords;

    console.log(
      `Latitude: ${latitude}, Longitude: ${longitude}, Accuracy: ${accuracy} meters`
    );

    this.#map = L.map('map').setView([latitude, longitude], 16);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this._addMarker(
      latitude,
      longitude,
      `<p>~YourLocation</p>`,
      'running-popup'
    );

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(e) {
    this.#mapEvent = e;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField(e) {
    e.preventDefault();
    inputCadence.parentElement.classList.toggle('form__row--hidden');
    inputElevation.parentElement.classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInput = (...inputs) => inputs.every(el => !isNaN(el));
    const positiveInput = (...inputs) => inputs.every(el => el > 0);
    e.preventDefault();

    //get data from th form
    const { lat, lng } = this.#mapEvent.latlng;
    const type = inputType.value;
    const distance = Number(inputDistance.value) || NaN;
    const duration = Number(inputDuration.value) || NaN;
    let workout, className;

    //If activity is cycling, create cycling object
    if (type === 'running') {
      const cadence = Number(inputCadence.value) || NaN;
      //check if data is valid
      if (
        !validInput(distance, duration, cadence) ||
        !positiveInput(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers');

      workout = new Running([lat, lng], distance, duration, cadence);

      className = 'running';
    }

    //If activity is running, create running object
    if (type === 'cycling') {
      const elevation = Number(inputElevation.value) || NaN;
      //check if data is valid
      if (
        !validInput(distance, duration, elevation) ||
        !positiveInput(distance, duration)
      )
        return alert('Inputs have to be positive numbers');

      workout = new Cycling([lat, lng], distance, duration, elevation);

      className = 'cycling';
    }

    //add new object to workout array
    this.#workouts.push(workout);
    console.log(this.#workouts);

    //render workout map as a marker
    this._addMarker(
      ...workout.coords,
      `${workout.distance.toString()} Km`,
      `${className}-popup`
    );

    //render worout as a list

    //hide form + clear input fields
    inputDistance.value = inputCadence.value = inputDuration.value = '';
  }

  //display marker
  _addMarker(lat, lng, popup, className) {
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          maxHeight: 100,
          autoClose: false,
          closeOnClick: false,
          className: className,
        })
      )
      .setPopupContent(popup)
      .openPopup();
  }
}

const app = new App();
