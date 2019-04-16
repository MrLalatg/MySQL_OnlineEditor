<template>
    <div>
        <table>
            <tr><th>Название</th><th>Значение</th></tr>
            <tr v-for="(data, key) in rowData" :key="key">
                <td>{{key}}</td>
                <td><el-input size="medium" type="text" v-model="rowData[key]"></el-input></td>
            </tr>
        </table>
        <el-button size="small" type="success" plain @click="onSaveClick" v-if="modified">Сохранить</el-button>
    </div>
</template>

<script>
import db from '../db';
import _ from 'lodash';

export default {
    name: "tableEdit",
    data() {
        return {
            unsaved: false,
            copyData: null,
        }
    },

    methods: {
        onSaveClick(){
            db.setValue(this.curTable, this.rowData);
            //alert('CLICK!');
            this.unsaved = false;
        },
    },

    props: {
        rowData: Object,
        curTable: String
    },

    watch: {
        "rowData.id": function(){
            this.copyData = _.cloneDeep(this.rowData);
        },
    },

    computed: {
        modified(){
            return JSON.stringify(this.rowData) !== JSON.stringify(this.copyData);
        }
    },
}
</script>

<style scoped>
    table{
        font-family: "Trebuchet MS", Helvetica, sans-serif;
        font-size: 18px;
    }

    input{
        font-family: inherit;
        font-size: inherit;
        padding-left: 5px;
    }
</style>
