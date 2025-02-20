import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Client from './components/Client';
import Server from './components/Server';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/client" element={<Client />} />
                <Route path="/server" element={<Server />} />
            </Routes>
        </Router>
    );
}

export default App;
