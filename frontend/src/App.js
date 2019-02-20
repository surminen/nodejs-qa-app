import React, { Component } from 'react';
import NavBar from './NavBar/NavBar';
import {Route} from 'react-router-dom';
import Questions from './Questions/Questions';
import Question from './Question/Question';

class App extends Component {
  render() {
    return (
      <div>

        <NavBar/>

        <Route exact path='/' component={Questions}/>
        <Route exact path='/question/:questionId' component={Question}/>

      </div>
    );
  }
}

export default App;