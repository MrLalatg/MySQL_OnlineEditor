<template>
    <div class="content">
        <div @click="onTableClick">
           {{tableName}}
        </div>
        <template v-for="item in tableContent">

            <div :key="item.id" v-if="vis">
                <div @click="$emit('open-full', item, tableName)" class="children" style="display: inline-block; width: 75%">
                    {{item.key_name}}
                </div>

                <el-button type="danger" plain size="mini" icon="el-icon-delete" style="display: inline-block; vertical-align: middle"></el-button>
            </div>
        </template>
        <el-row v-if="vis">
            <hr>
            <el-col><el-button type="success" size="mini" class="controls">Добавить запись</el-button></el-col>
            <el-col><el-button @click="vis = false; $emit('confirm-delete', tableName)" type="danger" size="mini" class="controls">Удалить таблицу</el-button></el-col>
        </el-row>
    </div>
</template>

<script>
import db from '../db';

export default {
    name: "treeItem",
    data() {
        return {
            vis: false,
            tableContent: null,
            confirmDeleteVis: false,
        }
    },

    methods: {
        async onTableClick(){
            if(!this.tableContent){
                this.tableContent = await db.getContent(this.tableName);
            }
            this.vis = !this.vis;
        },
    },

    props: {
        tableName: String,
    },
}
</script>

<style scoped>
    hr{
        margin-right: 10px;
        margin-bottom: 5px;
        margin-top: 5px;
    }

    .content{
        border:1px solid red;
        border-radius: 5px;
        margin-bottom: 5px;
        font-family: "Trebuchet MS", Helvetica, sans-serif;
        font-size: 18px;
        padding-left: 10px;
        padding-bottom: 3px;
    }

    .children{
        border: 1px solid grey;
        border-radius: 5px;
        margin: 5px;
        padding-left: 10px;
    }

    .controls{
        margin-left: 5px;
        margin-bottom: 5px;
        margin-right: 5px;
        font-size: 14px;
        width: 95%;
    }
</style>
