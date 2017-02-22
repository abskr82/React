import React from 'react';
import axios from 'axios';
const ReactHighcharts = require('react-highcharts/ReactHighstock.src');
var socket = io('http://interview.optumsoft.com:80');

var opts  = ReactHighcharts.Highcharts;

function getSensors() {
  return axios.get('http://interview.optumsoft.com/sensornames');
}

function getSensorConfig() {
  return axios.get('http://interview.optumsoft.com/config');
}


class Sensor extends React.Component {
  constructor(props) {
    super(props);
    this.recent_data = [];
    this.minute_data = [];
    this.state = {
      sensors: ['Select'],
      value: 'select',
      sensorConfig:{},
      scale:'recent',
      config:{
				chart: {
					type: 'area',
				},
				title: {
					text: 'Live Temperature data'
				},
				xAxis: {
					type: 'datetime',
					tickPixelInterval: 150,
					maxZoom: 20 * 1000
				},
				yAxis: {
					minPadding: 0.2,
					maxPadding: 0.2,
					title: {
						text: 'Value',
						margin: 80
					}
				},
				series: [{
					name: 'Temperature data',
					data: []
				}]
			}
    };
    this.config = this.state.config;
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
    var prev_value = this.state.value;
    var new_val = e.target.value;
    this.recent_data = [];
    this.minute_data = [];
    this.setState({value: e.target.value});
    this.setState((prevState, props) => ({
      value: new_val
    }));
    this.getMeData(prev_value, new_val);
  }

  getScale(e) {
    if (this.state.value !== 'select') {
      this.chart = this.refs.chart.getChart();
      this.chart.series[0].setData([]); 
    }
    this.setState({scale: e.target.value});
  }

getMeData(prev_type, new_type) {
  // check if we are listening already
  if (prev_type != 'select'){
    console.log('unsubscribe to', prev_type);
    socket.emit('unsubscribe', prev_type);
  }
  //now subscribe to the given type
  if (new_type != 'select') {
    let dataColor = '#099e3b' // green
    let minTh  = this.state.sensorConfig[new_type].min;
    let maxTh  = this.state.sensorConfig[new_type].max;
    console.log('Subscribing to ', new_type);
    socket.emit("subscribe", new_type);
    socket.on('data', data => {
      if (data !== null) {
        if (data.val < maxTh && data.val > minTh){
          dataColor = '#099e3b';
        } else{
          dataColor = '#ed1010'
        }

        if(data.type === 'init'){

        }
        this.clasifyData(data, dataColor);
        
      }
    });
  }
}

clasifyData(data, dataColor) {
  console.log(data);
  this.chart = this.refs.chart.getChart();
    if(data.type === 'init'){
      if(this.state.scale === 'recent'){
        for (let i = 0; i <data.recent.length; i++){
          this.chart.series[0].addPoint({x:data.recent[i].key, y:data.recent[i].val});
        }
      }
      if(this.state.scale === 'minute'){
        for (let i = 0; i <data.minute.length; i++){
          this.chart.series[0].addPoint({x:data.minute[i].key, y:data.minute[i].val});
        }
      }
    }

  // if (data.scale === 'recent') {
  //   if (this.recent_data.length === 0){
  //     this.chart.series[0].setData([]);           
  //   }
  //   if (data.type === 'update') {
  //     this.recent_data.push({key: data.key, val: data.val});
  //     if (this.state.scale === 'recent') {
  //       this.chart.series[0].addPoint({x: data.key, y:data.val, color: dataColor});
  //     }
  //   }else if (data.type === 'delete') {
  //     var index = this.deleteData(data.key, this.recent_data);
  //     if (index){
  //       console.log('Data is ', this.chart.series[0].data);
  //       this.chart.series[0].data[index].remove();
  //     }
  //   }
  // } else {
  //   if (this.minute_data.length === 0){
  //      this.chart.series[0].setData([]); 
  //     }
  //   if (data.type === 'update') {
  //     this.minute_data.push({key: data.key, val: data.val});
  //     if (this.state.scale === 'minute') {
  //       this.chart.series[0].addPoint({x: data.key, y:data.val, color: dataColor});
  //     }
  //   }else if (data.type === 'delete') {
  //     var index = this.deleteData(data.key, this.minute_data);
  //     console.log('Data is 1', this.chart.series[0].data);
  //     console.log('index', index);
  //     if (index){
  //       this.chart.series[0].data[index].remove();
  //     }
  //   }
  // }
}


deleteData(key, source) {
  if (source.length > 0){
    for (let i = 0; i < source.length; i++){
      if (source[i].key === key) {
        console.log('Deletede data with key ', key);
        return i;
      }
    }
  }
}

   render() {
     let selectedDisplay = <div></div>;
     if (this.state.value !== 'Select'){
      let selectedDisplay = <h1>Selected Value: {this.state.value}</h1>;
     }
     

      return (
         <div className= "container">
           <SomeHeader />
            <form>
              <div className="form-group">
                <div className="row">
                  <div className="col-sm-3">
                    <label htmlFor="sel">Select Sensor : </label>
                  </div>
                  <div className="col-sm-6">
                    <select className="form-control" id="sel" onChange={this.handleChange} value={this.state.value}>
                      <option value="select">Select</option>
                      {
                        this.state.sensors.map(function(temp, index){
                          return <option key={'temp' + index} value={ temp }>{temp}</option>;
                        })
                      }
                    </select>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-3">
                    <label htmlFor="scale">Select Scale : </label>
                  </div>
                  <div className="col-sm-3">
                    <div onChange={this.getScale.bind(this)}>
                      <label className="radio-inline">
                        <input type="radio" name="scale" value='recent' defaultChecked/>Recent
                      </label>
                      <label className="radio-inline">
                        <input type="radio" name="scale" value="minute"/>Minute
                      </label>
                    </div>
                  </div>
                </div>
              </div>
          </form>
           { this.state.value !== 'select' ? <Results result={this.state.value}/> : null }
           { this.state.value !== 'select' ? <ReactHighcharts config={this.config} ref="chart"></ReactHighcharts> : null }
        </div>
      );
   }
}

export default Sensor;

var Results = React.createClass({
    render: function() {
        return (
            <h4> Showing Graph for {this.props.result}</h4>
        );
    }
});

var SomeHeader = React.createClass({
  render: function() {
    return (
      <div className="jumbotron">
        <h1>Welcome to Temperature Portal!</h1>      
        <p>Select sensor to see real time temperature chart.</p>
      </div>
    )
  }
})
