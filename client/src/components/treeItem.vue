<template>
    <div class="content">
        <div @click="onTableClick">
           {{tableName}}
        </div>
        <template v-for="item in tableContent">
            <!-- @click="$emit('open-full', item)" -->
            <div @click="$emit('open-full', item, tableName)" v-if="vis" :key="item.id" class="children">
                {{item.key_name}}
                <!-- <template v-for="column in item">
                    <div @click="$emit('open-full', column)" v-if="openedRows.includes(item.id)" :key="column.id">{{column}}</div>
                </template> -->
            </div>
        </template>
        <div class="children" v-if="vis">+</div>
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
        getContent: function(){
            db.getContent(this.name);
        },

        async onTableClick(){
            if(!this.tableContent){
                this.tableContent = await db.getContent(this.tableName);
            }
            this.vis = !this.vis;
        },

        onRowClick(id){
            if(this.openedRows.includes(id)){
                this.openedRows.forEach((rowId, idx, arr) => {
                    if(rowId === id){
                        arr.splice(idx, 1);
                    }
                });
            } else {
                this.openedRows.push(id);
            }
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
</style>
