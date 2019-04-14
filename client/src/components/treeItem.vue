<template>
    <div class="content">
        <div @click="onTableClick">
           {{tableName}}
        </div>
        <template v-for="item in tableContent">
            <div @click="$emit('open-full', item, tableName)" v-if="vis" :key="item.id" class="children">
                {{item.key_name}}
            </div>
        </template>
        <div id="addRow" class="children" v-if="vis">+</div>
    </div>
</template>

<script>
import db from '../db';

export default {
    name: "treeItem",
    data() {
        return {
            vis: false,
            openedRows: [],
            tableContent: null,
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
    .content{
        border:1px solid red;
        margin-bottom: 5px;
        font-family: "Trebuchet MS", Helvetica, sans-serif;
        font-size: 18px;
        padding-left: 10px;
        padding-bottom: 3px;
    }

    .children{
        border: 1px solid grey;
        margin: 5px;
        padding-left: 10px;
    }

    #addRow{
        color: forestgreen;
    }
</style>
