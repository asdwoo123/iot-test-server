const express = require('express');
const SocketIO = require('socket.io');
const cors = require('cors')
const { range } = require('lodash');
const {setDB, getDB, addDB} = require('./db');

[1000, 2000, 3000].forEach((port, index) => {
    const app = express();
    app.set('port', port);
    app.use(cors())
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.post('/auth', (req, res) => {
        const {password} = req.body
        let same
        same = password === getDB(index, 'serverInfo').password;
        return res.json({
            result: same
        });
    });


    app.get('/serverInfo', (req, res) => {
        return res.json({
            serverInfo: getDB(index, 'serverInfo')
        });
    });

    app.post('/getPlcInfo', (req, res) => {
        const { password } = req.body;
        if (password === getDB(index, 'password')) {
            return res.json({
                plcInfo: getDB(index, 'plcInfo'),
                result: true
            });

        } else {
            return res.json({
                result: false
            })
        }
    });

    app.post('/setPlcInfo', (req, res) => {
        const { plcInfo } = req.body

        let result;

        if (plcInfo) {
            setDB(index, 'plcInfo', plcInfo)
            result = true
        } else {
            result = false
        }

        return res.json({
            result
        });
    });

    app.get('/plcData', (req, res) => {
        return res.json({
            plcData: getDB(index, 'plcData')
        });
    });

    const server = app.listen(app.get('port'), () => {
        console.log(`${app.get('port')} server start...`);
    });

    const io = SocketIO(server, { path: '/socket.io' });

    setInterval(() => {
        const data = range(10).map(n => ({
            dataName: `data${n + 1}`,
            dataValue: Math.floor(Math.random() * 1000)
        }));

        const stationData = {
            data,
            createdAt: new Date()
        }

        io.emit('data', stationData);
        addDB(index, 'plcData', stationData);
    }, 5000);
})

