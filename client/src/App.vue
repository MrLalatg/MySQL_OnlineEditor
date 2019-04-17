<template>
    <div id="content">
        <div id="tree">
            <treeItem
                v-for="item in content"
                :key="item.id"
                :tableName="item.TABLE_NAME"
                @open-full="onOpenFull"
                @confirm-delete="onConfirmDelete"
                @new-row="onNewRow"
                ref="tree"
            ></treeItem>
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

        <el-dialog title="Новая запись" :visible.sync="newRow">
            <span style="font-size: 17px">Если вы хотите создать новую запись в таблице {{curTable}}, заполните данные и нажмите OK</span>
            <hr>
            <div id="newRowDialog">
                <table>
                    <tr><th>Название</th><th>Значение</th></tr>
                    <tr v-for="(data, key) in newRowData" :key="key">
                        <td>{{key}}</td>
                        <td><el-input size="medium" type="text" v-model="newRowData[key]"></el-input></td>
                    </tr>
                </table>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button type="danger" @click="newRowData = {}; newRow = false">Отмена</el-button>
                <el-button type="success" @click="onInsert()">Сохранить</el-button>
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
        newRow: false,
        newRowData: null,
        treeReload: null,
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
      },

      onNewRow(tableCols, tableName, reload){
          this.curTable = tableName;
          this.treeReload = reload;
          this.newRow = true;
          this.newRowData = {};
          tableCols.forEach((column) => {
              if(column['name'] != "id" && column['name'] != "key_name") {
                  this.$set(this.newRowData, `${column['name']}`, null)
              }
          });
      },

      async onInsert(){
          await db.insertIntoTable(this.curTable, this.newRowData);
          this.newRow = false;
          this.newRowData = null;
          this.treeReload();
          this.treeReload = null;
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

    #newRowDialog{
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
</style>
