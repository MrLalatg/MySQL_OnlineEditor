<template>
    <div>
        <table>
            <tr><th>Название поля</th><th>Тип поля</th></tr>
            <tr>
                <td>
                    <input type="text">
                </td>
                <td>
                    <select name="Тип" @select="onTypeSelected()">
                        <option value="varchar">Строка</option>
                        <option value="int">Целое Число</option>
                        <option value="float">Дробное Число</option>
                    </select>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
    export default {
        name: "tableCreate",
        data(){
            return {

            }
        },

        props: {

        },

        methods: {
            onTypeSelected(){

            }
        }
    }
</script>

<style scoped>

</style>