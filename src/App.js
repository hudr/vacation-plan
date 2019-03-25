import React, { Component, Fragment } from 'react';

import { Button, Form, FormGroup, Label, Input, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';

import './App.css';

import TripService from "./services/TripService";

class App extends Component {

  constructor() {
    super();
    this.state = {
      cities: [],
      weathers: [],
      cityActive: undefined,
      weatherActive: undefined,
      days: 0,
      modal: false,
      dataFiltered: {}
    }

    //Modal Reactstrap
    this.toggle = this.toggle.bind(this);
  }

  async componentWillMount() {
    const cities = await TripService.getCities();
    const weathers = await TripService.getWeather();    
    this.setState({ cities, weathers });

  }

  //Modal reactstrap
  toggle() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  //Pegando valor da cidade (city.woeid)
  setCity(e) {
    this.setState({
      cityActive: e.target.value
    })
  }

  //Pegando valor do clima (weather.name)
  setWeather(e) {
    this.setState({
      weatherActive: e.target.value
    })
  }

  setDays(e) {
    this.setState({
      days: e.target.value
    })
  }


  //Pegando número de meses repetidos e retornando o maior.
  min_most_duplicate(arr) {
    var result = {},
      max = 0,
      res;

    arr = arr.slice(0); // make a copy of the array
    arr.sort(function (a, b) { return (a - b); }); // sort it numerically

    for (var i = 0, total = arr.length; i < total; ++i) {
      var val = arr[i],
        inc = (result[val] || 0) + 1;

      result[val] = inc;

      if (inc > max) {
        max = inc;
        res = val;
      }
    }

    return res;
  }

  filterWeather(data, weather) {

    const items = data.filter(item => item.weather === weather);

    //Meses do ano com determinada temperatura
    console.log('Datas com temperatura selecionada', items);

    const itemsFiltred = [];

    // Filtrando datas acima do dia de hoje. 
    items.forEach(item => {
      const currentDay = new Date();
      let firstDate = new Date(item.date);
      firstDate.setDate(firstDate.getDate() + 1);

      if (firstDate > currentDay) {
        itemsFiltred.push(item);
      }
    });

    console.log('Filtro sem datas anteriores\n', itemsFiltred);

    var months = [];

    console.log('Número de repetições nos meses\n')

    itemsFiltred.forEach((item) => {
      let aux = new Date(item.date);
      aux.setDate(aux.getDate() + 1);
      let month = aux.getMonth() + 1;
      months.push(month);

      //Mês com mais dias
      console.log(month);
    })

    const $self = this;

    const monthMoreDays = this.min_most_duplicate(months);

    let firstPeriodDay = null;
    let lastPeriodDay = null;
    
    let resultFilters = {};

    //Loop que transforma todos os dias em datas cheias, gerando primeiro e último dia.
    for (let index = 0; index < itemsFiltred.length; index++) {
      const item = itemsFiltred[index];
      let date = new Date(item.date);
      date.setDate(date.getDate() + 1);

      if ((date.getMonth() + 1) === monthMoreDays) {
        firstPeriodDay = new Date(date);
        lastPeriodDay = new Date(date);

        lastPeriodDay.setDate(lastPeriodDay.getDate() + Number($self.state.days));
        break;
      }
    }

    resultFilters = {
      firstPeriodDay: firstPeriodDay,
      lastPeriodDay: lastPeriodDay
    };

    //Imprimindo resultado do filtro
    console.log('Sugestoes de datas', resultFilters);

    return resultFilters;

  }

  async find() {

    const { cityActive, weatherActive, days } = this.state;

    const sbmForm = {

      city: cityActive,

      weather: weatherActive,

      currentYear: new Date().getFullYear(),
      
      days: Number(days)
    }

    try {

      const response = await fetch(`${'http://localhost:3000/cities/' +
      sbmForm.city}/year/${sbmForm.currentYear}`);
      
      const data = await response.json();

      console.log('resultado sem filtro', data);

      const dataFiltered = await this.filterWeather(data, sbmForm.weather);

      this.setState({ dataFiltered, modal: true });

    } catch (error) {

      console.error(error);

    }
  }

  render() {

    const { cities, weathers, cityActive, weatherActive, days, dataFiltered } = this.state;

    const isValid = cityActive && weatherActive && days > 0 && days <= 15 && days.length <= 2;

    //Adicionando mês Javascript - Primeiro e último dia.
    const mesInicio = new Date(dataFiltered.firstPeriodDay).getMonth() + 1;
    const mesFim = new Date(dataFiltered.lastPeriodDay).getMonth() + 1;

    return (
      <Fragment>
        <Form className="form-signin">
          <div className="text-center mb-4">
            <img className="airplane-logo mb-4" alt="" src="https://image.flaticon.com/icons/svg/761/761505.svg" width="82" height="82"></img>
            <h1 className="h3 mb-3 font-weight-bold text-white">PLANO DE FÉRIAS</h1>
            <p className="text-white">Encontre o período perfeito para suas viagens.</p>
          </div>
          <FormGroup>
            <Input type="select" className="form-control form-control-lg" defaultValue={false} required onChange={this.setCity.bind(this)}>
              <option value={false} disabled={true}>Selecione o destino...</option>
              {
                cities.map((city) => {
                  return <option key={city.woeid} value={city.woeid}>{city.district}</option>
                })
              }
            </Input>
          </FormGroup>
          <FormGroup>
            <Input type="select" className="form-control form-control-lg" defaultValue={false} required onChange={this.setWeather.bind(this)}>
              <option value={false} disabled={true}>Seleciona o clima...</option>
              {
                weathers.map((weather) => {

                  return <option key={weather.id} value={weather.name}>{weather.name.charAt(0).toUpperCase() + weather.name.slice(1)}</option>
                })
              }
            </Input>
          </FormGroup>
          <FormGroup className="form-label-group">

            <Input type="number" id="diasFerias" className="form-conrol" placeholder="Dias de férias" onChange={this.setDays.bind(this)} />
            <Label htmlFor="diasFerias">Dias de férias</Label>
          </FormGroup>
          <Button
            disabled={!isValid}
            color="primary"
            className="btn-block"
            onClick={this.find.bind(this)}
          >
            Encontrar
          </Button>
        </Form>

        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}>

            {dataFiltered.firstPeriodDay !== null && dataFiltered.lastPeriodDay !== null ?

              "Hora de fazer as malas :)" : "Oops! Não conseguimos encontrar :("

            }

          </ModalHeader>
          <ModalBody>

            {dataFiltered.firstPeriodDay !== null && dataFiltered.lastPeriodDay !== null ?

              'Melhor período: ' +

              new Date(dataFiltered.firstPeriodDay).getDate() + '/' +
              mesInicio + '/' +
              new Date(dataFiltered.firstPeriodDay).getFullYear().toString().substr(2, 2)

              + ' a ' +

              new Date(dataFiltered.lastPeriodDay).getDate() + '/' +
              mesFim + '/' +
              new Date(dataFiltered.lastPeriodDay).getFullYear().toString().substr(2, 2) + '.'

              :

              <div>

                <p>Não achamos nenhuma sugestão para estas condições!</p>
                <p>Mas fique tranquilo, que tal fazer uma nova busca?</p>

              </div>
            }
          </ModalBody>
          <ModalFooter>

            {dataFiltered.firstPeriodDay !== null && dataFiltered.lastPeriodDay !== null ?

              <Button color="success" onClick={this.toggle}>Já anotei!</Button>

              :

              <Button color="danger" onClick={this.toggle}>Tentar novamente</Button>
            }
          </ModalFooter>
        </Modal>
      </Fragment>
    );
  }
}

export default App;
