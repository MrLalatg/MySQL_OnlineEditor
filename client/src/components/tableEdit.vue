<template>
    <div>
        <table>
            <tr><th>Название</th><th>Значение</th></tr>
            <tr>
                <td>{{rowData['prop']}}</td>
                <td><el-input size="medium" type="text" v-model="rowData['value']"></el-input></td>
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
            copyData: null,
        }
    },

    mounted() {
        this.rowData && (this.copyData = _.cloneDeep( this.rowData));
    },

    methods: {
        onSaveClick(){
            this.rowData.name = this.rowData.value;
            this.rowData.key_name = this.rowData.value;
            if(this.nodeParent.key_name === this.copyData.value){
                this.nodeParent.name = this.rowData.value;
            }
            db.setValue(this.curTable, this.rowData);
        },
    },

    props: {
        rowData: Object,
        curTable: String,
        nodeParent: Object,
    },

    watch: {
        "rowData.prop": function(){
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
