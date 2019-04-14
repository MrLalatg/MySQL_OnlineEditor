import axios from 'axios';

const url = 'http://localhost:5000/api/db/'

export default class db{
    static async getContent(table){
        const res = await axios.get(`${url}${table}`);
        return res.data;
    }

    static async getTablesList(){
        const res = await axios.get(`${url}`);
        return res.data;
    }

    static async setValue(table, data){
        const res = await axios.post(`${url}${table}`, data);
        return res.data;
    }

    static async createTable(table, columns){
        const res = axios.post(`${url}`, {tableName: table, cols: columns});
        return res.data();
    }
}