<template>
    <div>
        <input style="margin: 0 auto; display: block" type="text" v-model="tableName" placeholder="Введите название таблицы">
        <table>
            <tr><th>Тип поля</th><th>Название поля</th></tr>
            <tr v-for="(row, idx) in rows" :key="idx">
                <td>
                    <select name="Тип" v-model="row.type">
                        <option value="VARCHAR(255)">Строка</option>
                        <option value="INT">Целое Число</option>
                        <option value="BOOLEAN">Логическое значение</option>
                    </select>
                </td>

                <td>
                    <input type="text" v-model="row.colName">
                </td>

                <td>
                    <button @click="removeRow(idx)">-</button>
                </td>

            </tr>
        </table>

        <button @click="addRow">+</button>
        <button @click="createTable">Создать</button>
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

            createTable(){
                db.createTable(this.tableName, this.rows);
            }
        }
    }
</script>

<style scoped>

</style>