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

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude, accuracy } = position.coords;
      console.log(
        `Latitude: ${latitude}, Longitude: ${longitude}, Accuracy: ${accuracy} meters`
      );

      const map = L.map('map').setView([latitude, longitude], 17);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const marker = L.marker([latitude, longitude])
        .bindPopup('<b>≈ Current location</b>')
        .addTo(map);
    },
    error => {
      if (error.code === 1) {
        alert('We want your permission');
      }
      console.error(`Error (${error.code}): ${error.message}`);
    },
    {
      enableHighAccuracy: true, // Requests more accurate results
      timeout: 100000, // Timeout in milliseconds
      maximumAge: 0, // No cached results
    }
  );
} else {
  console.error('Geolocation is not supported by this browser.');
}
