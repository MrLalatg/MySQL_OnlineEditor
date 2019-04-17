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

    static async createTable(table, columns, keyname){
        const res = await axios.post(`${url}`, {tableName: table, cols: columns, keyname: keyname});
        return res.data;
    }

    static async deleteTable(table){
        const res = await axios.delete(`${url}${table}`);
        return res.data;
    }

    static async insertIntoTable(table, data){
        const res = await axios.post(`${url}insert/${table}`, data);
        return res.data;
    }
}