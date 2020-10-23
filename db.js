const low = require('lowdb')
const {cloneDeep, range} = require('lodash')
const FileSync = require('lowdb/adapters/FileSync')


const dbs = ['db.json', 'db2.json', 'db3.json'].map(dbName => {
    const adapter = new FileSync(dbName)
    const db = low(adapter)

    const serverInfo = {
        maxTemperature: 30
    };

    const protocolList = ['OPCUA']

    const plcInfo = {
        protocolList,
        protocol: protocolList[0],
        OPCUA: {
            url: '',
            productId: '',
            data: range(10).map(n => ({
                dataName: `data${n + 1}`,
                nodeId: `node${n + 1}`
            }))
        }
    };

    const plcData = [];

    db.defaults({password: '123', serverInfo, plcInfo, plcData}).write();

    return db;
});

exports.setDB = (index, name, value) => {
    dbs[index].set(name, value).write()
};

exports.getDB = (index, name) => cloneDeep(dbs[index].get(name).value());

exports.addDB = (index, name, value) => {
    dbs[index].get(name).unshift(value).write()
};



