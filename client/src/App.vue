<template>
    <div id="content">
        <div id="tree">
            <treeItem v-for="item in content" :key="item.id" :tableName="item.TABLE_NAME" @open-full="onOpenFull" @confirm-delete="onConfirmDelete"></treeItem>
            <el-button type="success" size="mini" style="font-size: 14px" @click="onCreateTable">Создать таблицу</el-button>
        </div>
        
        <div style="border-left:1px solid #808080; height: 100%; position: fixed; margin-left: 35%;"></div>
          
        <div id="crud">
            <div id="editView">
                <tableEdit v-if="fullRow" :rowData="fullRow" :curTable="curTable"></tableEdit>
                <tableCreate v-if="tableCreating" @reload="reload"></tableCreate>
            </div>

            <hr>

            <div id="tips">
                
            </div>
        </div>

        <el-dialog title="Удалить таблицу?" :visible.sync="confirmDeleteVis" width="30%" class="">
            <span>Вы действительно хотите удалить таблицу "{{tableModal}}"?</span>
            <span slot="footer" class="dialog-footer">
                <el-button type="danger" @click="confirmDeleteVis = false">Нет, я ошибся</el-button>
                <el-button type="success" @click="deleteTable">Да, это не ошибка</el-button>
            </span>
        </el-dialog>
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
        confirmDeleteVis: false,
        tableModal: null,
    }
  },
  components: {
      treeItem,
      tableEdit,
      tableCreate,
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
      },

      async reload(){
          this.content = await db.getTablesList();
      },


      async deleteTable(){
          await db.deleteTable(this.tableModal);
          this.confirmDeleteVis = false;
          this.reload();
      },

      onConfirmDelete(table){
          this.confirmDeleteVis = true;
          this.tableModal = table;
      }
  },
}
</script>

<style scoped>
    hr {
        border: 0;
        display: block;
        width: 100%;
        background-color: rgb(182, 182, 182);
        height: 1px;
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
