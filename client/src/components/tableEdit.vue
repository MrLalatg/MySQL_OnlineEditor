<template>
    <div>
        <table>
            <tr><th>Название</th><th>Значение</th></tr>
            <template v-for="(data, key) in rowData">
                <tr :key="key" v-if="key != 'id' && key != 'key_name'">
                    <td>{{key}}</td>
                    <td><el-input size="medium" type="text" v-model="rowData[key]"></el-input></td>
                </tr>
            </template>
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
            copyData: null,
        }
    },

    mounted() {
        this.rowData && (this.copyData = _.cloneDeep( this.rowData));
    },

    methods: {
        onSaveClick(){
            db.setValue(this.curTable, this.rowData);
            //alert('CLICK!');
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
