<template>
    <div id="content">
        <div id="tree">
            <treeItem v-for="item in content" :key="item.id" :tableName="item.TABLE_NAME" @open-full="onOpenFull"></treeItem>
        </div>
        
        <div style="border-left:1px solid #808080; height: 100%; position: fixed; margin-left: 35%;"></div>
          
        <div id="crud">
            <div id="editView">
                <tableEdit v-if="fullRow" :rowData="fullRow" :curTable="curTable"></tableEdit>
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
export default {
  name: 'app',
  data() {
    return {
      content:null,
      fullRow: null,
      curTable: null
    }
  },
  components: {
    treeItem,
    tableEdit
  },
  async mounted() {
     this.content = await db.getTablesList();
  },

  methods: {
      onOpenFull(column, table){
          this.fullRow = column;
          this.curTable = table;
      },
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
