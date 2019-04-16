<template>
    <div>
        <div style="margin: 0 auto; display: block;">
            <el-input style="margin: 5px auto; display: block; width: 50%" type="text" v-model="tableName" placeholder="Введите название таблицы"></el-input>
            <el-select style="margin: 5px auto; display: block; width: 50%" placeholder="Ключевое значение" v-model="keyName">
                <el-option v-for="columnName in rows.map(row => row.colName)" :value="columnName" :label="columnName" :key="columnName"></el-option>
            </el-select>
        </div>

        <table>
            <tr><th>Тип поля</th><th>Название поля</th></tr>
            <tr v-for="(row, idx) in rows" :key="idx">
                <td>
                    <el-select placeholder="Тип поля" v-model="row.type" size="medium">
                        <el-option value="VARCHAR(255)" label="Строка"></el-option>
                        <el-option value="INT" label="Целое Число"></el-option>
                        <el-option value="BOOLEAN" label="Логическое значение"></el-option>
                    </el-select>
                </td>

                <td>
                    <el-input type="text" v-model="row.colName" size="medium"></el-input>
                </td>

                <td>
                    <el-button type="danger" plain size="medium" icon="el-icon-delete" @click="removeRow(idx)"></el-button>
                </td>

            </tr>
        </table>



        <el-button type="success" size="medium" plain icon="el-icon-plus" @click="addRow"></el-button>
        <el-button type="success" size="medium"  @click="createTable">Создать</el-button>
    </div>
</template>
`
<script>
    import db from '../db';
    export default {
        name: "tableCreate",
        data(){
            return {
                rows: [{colName: null, type: null}],
                tableName: "",
                keyName: "",
            }
        },

        props: {

        },

        methods: {
            addRow(){
                this.rows.push({colName: null, type: null});
            },

            removeRow(idx){
                this.rows.splice(idx, 1);
            },

            async createTable(){
                await db.createTable(this.tableName, this.rows, this.keyName);
                this.$emit('reload');
            }
        }
    }
</script>

<style scoped>

</style>