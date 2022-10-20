
import React, { Component } from 'react';
import './App.css';
import VideoTo01 from './page/VideoTo01'
import VideoToView from './page/VideoToView'

class App extends Component {

    /**
     * 在渲染前调用
     * */
    componentWillMount() {
    }


    render() {
        return (<VideoTo01 />)
    }
}

export default App;
