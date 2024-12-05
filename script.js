'use strict';

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
  constructor(coords, distance, duration, type) {
    this.coords = coords;
    this.distance = distance; //in Km
    this.duration = duration; //in Min
    this.type = type;
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase() + this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, type, cedence) {
    super(coords, distance, duration, type);
    this.cedence = cedence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    //min/km
    this.pace = this.duration / this.distance;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, type, elevationGain) {
    super(coords, distance, duration, type);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
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
  #zoomLevel = 16;
  #workouts = [];
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
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

    this.#map = L.map('map').setView([latitude, longitude], this.#zoomLevel);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this._addMarker(latitude, longitude, `<p>~YourLocation</p>`, '_');

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(e) {
    this.#mapEvent = e;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  //hide Form
  _hideForm() {
    inputDistance.value = inputDuration.value = inputCadence.value = '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
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
    let workout;

    //If activity is cycling, create cycling object
    if (type === 'running') {
      const cadence = Number(inputCadence.value) || NaN;
      //check if data is valid
      if (
        !validInput(distance, duration, cadence) ||
        !positiveInput(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers');

      workout = new Running([lat, lng], distance, duration, 'running', cadence);
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

      workout = new Cycling(
        [lat, lng],
        distance,
        duration,
        'cycling',
        elevation
      );
    }

    //add new object to workout array
    this.#workouts.push(workout);
    console.log(this.#workouts);

    //render workout map as a marker
    this._addMarker(
      ...workout.coords,
      `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}${workout.description}`,
      `${workout.type}-popup`
    );

    //render worout as a list
    this._renderWorkout(workout);

    //hide form + clear input fields
    this._hideForm();
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

  //render workout
  _renderWorkout(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;

    if (workout.type === 'running') {
      html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cedence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
    }

    if (workout.type === 'cycling') {
      html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;
    }

    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    if (workoutEl === null) return;
    const workout = this.#workouts.find(
      element => element.id === workoutEl.dataset.id
    );
    this.#map.setView(workout.coords, this.#zoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
}

const app = new App();
