import React from 'react';
import axios from 'axios';
var socket = io('http://interview.optumsoft.com:80');


axios.get('http://interview.optumsoft.com/sensornames')
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });

socket.on('connection', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
});
// socket.emit("subscribe", "temperature0");

socket.on('data', function (data) {
    console.log('data is', data);
    socket.emit('my other event', { my: 'data' });
});
class Sensor extends React.Component {
   render() {
      return (
         <div>
            <h2> Sensor Name </h2>
         </div>
      );
   }
}

export default Sensor;