<template>
    <div id="content">
        <div id="tree">
            <treeItem v-for="item in content" :key="item.id" :tableName="item.TABLE_NAME" @open-full="onOpenFull"></treeItem>
            <div id="addTable" @click="onCreateTable">+</div>
        </div>
        
        <div style="border-left:1px solid #808080; height: 100%; position: fixed; margin-left: 35%;"></div>
          
        <div id="crud">
            <div id="editView">
                <tableEdit v-if="fullRow" :rowData="fullRow" :curTable="curTable"></tableEdit>
                <tableCreate v-if="tableCreating"></tableCreate>
            </div>

            <hr>

            <div id="tips">
                
            </div>
        </div>
    </div>
</template>

<script>
import treeItem from './components/treeItem'
import tableEdit from './components/tableEdit'
import db from './db'
import tableCreate from './components/tableCreate'
export default {
  name: 'app',
  data() {
    return {
        content:null,
        fullRow: null,
        curTable: null,
        tableCreating: false,
    }
  },
  components: {
      treeItem,
      tableEdit,
      tableCreate
  },
  async mounted() {
     this.content = await db.getTablesList();
  },

  methods: {
      onOpenFull(column, table){
          this.fullRow = column;
          this.curTable = table;
          this.tableCreating = false;
      },

      onCreateTable(){
          this.fullRow = null;
          this.tableCreating = true;
      }
  },
}
</script>

<style scoped>
    hr{
        border: 0;
        display:block;
        width: 100%;               
        background-color:rgb(182, 182, 182);
        height: 1px;
    }

    #addTable{
        color: forestgreen;
        border:1px solid red;
        margin-bottom: 5px;
        font-family: "Trebuchet MS", Helvetica, sans-serif;
        font-size: 18px;
        padding-left: 10px;
        padding-bottom: 3px;
    }

    #content{
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 100%;
    }

    #tree{
        width: 30%;
        position: fixed;
    }

    #crud{
        display: flex;
        flex-direction: column;
        width: 65%;
        height: 100%;
        position: fixed;
        margin-left: 35%;
    }

    #editView{
        height: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    #tips{
        height: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
