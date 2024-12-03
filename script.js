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

class App {
  #map;
  #mapEvent;
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

    this._addMarker(latitude, longitude, `<p>Workout</p>`, 'running-popup');

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
    e.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;
    this._addMarker(lat, lng, 'Workout', 'running-popup');
    inputDistance.value = inputCadence.value = inputDuration.value = '';
  }

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

// if (navigator.geolocation) {
//   navigator.geolocation.getCurrentPosition(
//     position => {
//       const { latitude, longitude, accuracy } = position.coords;
//       console.log(
//         `Latitude: ${latitude}, Longitude: ${longitude}, Accuracy: ${accuracy} meters`
//       );

//       const map = L.map('map').setView([latitude, longitude], 17);

//       L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution:
//           '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//       }).addTo(map);

//       addMarker = function (lat, lng, popup, className) {
//         L.marker([lat, lng])
//           .addTo(map)
//           .bindPopup(
//             L.popup({
//               maxWidth: 250,
//               minWidth: 100,
//               maxHeight: 100,
//               autoClose: false,
//               closeOnClick: false,
//               className: className,
//             })
//           )
//           .setPopupContent(popup)
//           .openPopup();
//       };

//       map.on('click', e => {
//         mapEvent = e;
//         form.classList.remove('hidden');
//         inputDistance.focus();
//       });
//     },
//     error => {
//       if (error.code === 1) {
//         alert('We want your permission');
//       }
//       console.error(`Error (${error.code}): ${error.message}`);
//     },
//     {
//       enableHighAccuracy: true, // Requests more accurate results
//       timeout: 100000, // Timeout in milliseconds
//       maximumAge: 0, // No cached results
//     }
//   );
// } else {
//   console.error('Geolocation is not supported by this browser.');
// }

// form.addEventListener('submit', function (e) {
//   e.preventDefault();
//   const { lat, lng } = mapEvent.latlng;
//   addMarker(lat, lng, 'Workout', 'running-popup');
//   inputDistance.value = inputCadence.value = inputDuration.value = '';
// });

// inputType.addEventListener('change', function (e) {
//   e.preventDefault();
//   inputCadence.parentElement.classList.toggle('form__row--hidden');
//   inputElevation.parentElement.classList.toggle('form__row--hidden');
// });
