import React from 'react';
import axios from 'axios';
var socket = io('http://interview.optumsoft.com:80');


// axios.get('http://interview.optumsoft.com/sensornames')
//   .then(function (response) {
//     console.log(response);
//   })
//   .catch(function (error) {
//     console.log(error);
//   });

function getSensors() {
  return axios.get('http://interview.optumsoft.com/sensornames');
}

function getSensorConfig() {
  return axios.get('http://interview.optumsoft.com/config');
}


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
  constructor(props) {
    super(props);
    this.state = {
      sensors: ['Select'],
      value: '?',
      sensorConfig:{}
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    getSensors().then(response => {
      this.setState({
        sensors: response.data
      });
    });
    getSensorConfig().then(response => {
      this.setState({
        sensorConfig: response.data
      });
    });
  }

  handleChange(e) {
    this.setState({value: e.target.value});
    var obj = e.target.value;
    console.log(this.state.sensorConfig[obj]);
  }

   render() {
      return (
         <div>
            <form>
              <div className="form-group">
                <label htmlFor="sel">Select Sensor : </label>
                <select className="form-control" id="sel" onChange={this.handleChange} value={this.state.value}>
                  <option value="select">Select</option>
                  {
                    this.state.sensors.map(function(temp, index){
                      return <option key={'temp' + index} value={ temp }>{temp}</option>;
                    })
                  }
                </select>
              </div>
          </form>
           <h1>Selected Value: {this.state.value}</h1>
        </div>
      );
   }
}

export default Sensor;