<template>
    <div id="content">
        <div id="tree" style="display: flex; justify-content: stretch; flex-direction: column" >
            <el-tree
                    style="overflow: auto;flex-grow: 1"
                    v-if="showTree"
                    ref="tree"
                    :props="props"
                    :load="loadTable"
                    node-key="TABLE_NAME"
                    lazy
                    @node-click="onOpenFull">
                        <div class="custom-tree-node" slot-scope="{ node, data }">
                            <div>{{ node.label }}</div>
                            <div>
                                <el-button
                                        type="text"
                                        size="mini"
                                        v-if="node.data.type === 'table'"
                                        @click="() => onNewRow(node, data)">
                                    Добавить строку
                                </el-button>
                                <el-button
                                        style="color: red"
                                        type="text"
                                        size="medium"
                                        icon="el-icon-delete"
                                        v-if="node.data.type === 'table' || node.data.type === 'row'"
                                        @click="() => deleteNode(node, data)">
                                </el-button>
                            </div>
                        </div>
            </el-tree>
            <el-button type="success" size="mini" style="font-size: 14px;margin-bottom: 20px" @click="onCreateTable">Создать таблицу
            </el-button>
        </div>

        <div style="border-left:1px solid #808080; height: 100%; position: fixed; margin-left: 35%;"></div>

        <div id="crud">
            <div id="editView">
                <tableEdit v-if="fullRow" :row-data="fullRow" :cur-table="curTable"
                           :node-parent="nodeParent"></tableEdit>
                <tableCreate v-if="tableCreating" @reload="reload" @new-table="onNewTable"
                             :all-tables="content"></tableCreate>
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
                    <tr>
                        <th>Название</th>
                        <th>Значение</th>
                    </tr>
                    <tr v-for="(data, key) in newRowData" :key="key">
                        <td>{{key}}</td>
                        <td>
                            <el-input size="medium" type="text" v-model="newRowData[key]"></el-input>
                        </td>
                    </tr>
                    <tr v-for="item in newRowRefsData" :key="item">
                        <td>{{item.key}}</td>
                        <td>
                            <el-select v-model="item.id" filterable>
                                <el-option v-for="autoitem in getAutocompleteData(item.key)" :value="autoitem.id" :label="autoitem.key_name"></el-option>
                            </el-select>
                        </td>
                    </tr>
                </table>
                <el-button v-for="ref in newRowRefs" :key="ref.key" type="primary" plain size="medium"
                           @click="addRefData(ref.key)">Добавить связь с {{ref.key}}
                </el-button>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button type="danger" @click="newRowData = {}; newRow = false">Отмена</el-button>
                <el-button type="success" @click="onInsert()">Сохранить</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import tableEdit from './components/tableEdit'
    import db from './db'
    import tableCreate from './components/tableCreate'
    import _ from 'lodash'

    export default {
        name: 'app',
        data() {
            return {
                showTree: true,
                content: null,
                fullRow: null,
                curTable: null,
                tableCreating: false,
                confirmDeleteVis: false,
                tableModal: null,
                newRow: false,
                newRowData: null,
                treeReload: null,
                props: {label: "name", isLeaf: "leaf"},
                nodeParent: null,
                nodeDel: null,
                treeId: 0,
                parentNodeNewRow: null,
                newRowRefs: null,
                newRowRefsData: [],
            }
        },
        components: {
            tableEdit,
            tableCreate,
        },

        async mounted() {
            this.content = await db.getTablesList();
        },

        methods: {
            onOpenFull(data, node) {
                if (node.data.leaf) {
                    this.fullRow = node.data;
                    this.nodeParent = node.parent.data;
                    this.tableCreating = false;
                    this.curTable = node.data.table;
                }
            },

            onCreateTable() {
                this.fullRow = null;
                this.tableCreating = true;
            },

            async reload() {
                this.content = await db.getTablesList();
            },

            getAutocompleteData(tableName){
                return _.find(this.newRowRefs, el => el.key === tableName).data;
            },

            addRefData(tableName) {
                this.newRowRefsData.push({key: tableName, id: null});
            },

            onNewTable(newTable) {
                this.$refs.tree.root.data = [];
                newTable.name = newTable.TABLE_NAME;
                Object.assign(newTable, {tbl: 1});
                this.$refs.tree.append(newTable, this.$refs.tree.root);
                this.$refs.tree.root.data = undefined;
            },

            async deleteNode(node, data) {
                this.curTable = data.table;
                if (data.tbl) {
                    this.onConfirmDelete(data.TABLE_NAME);
                    this.nodeDel = node;
                } else if (data.isRow) {
                    await db.deleteRow(this.curTable, data.id);
                    this.$refs.tree.remove(node);
                }
            },

            async deleteTable() {
                await db.deleteTable(this.tableModal);
                this.confirmDeleteVis = false;
                this.$refs.tree.remove(this.nodeDel.data.TABLE_NAME);
                await this.reload();
            },

            onConfirmDelete(table) {
                this.confirmDeleteVis = true;
                this.tableModal = table;
            },

            async onNewRow(node, data) {
                this.curTable = data.TABLE_NAME;
                this.newRowData = {};
                let columnsData = await db.getTableColumns(data.TABLE_NAME);
                columnsData.columns.forEach((column) => {
                    if (column['COLUMN_NAME'] !== "id" && column['COLUMN_NAME'] !== "key_name") {
                        this.$set(this.newRowData, `${column['COLUMN_NAME']}`, null)
                    }
                });

                this.newRowRefs = columnsData.autocompleteData;

                this.newRow = true;
                this.parentNodeNewRow = node;
            },

            async onInsert() {
                let createdRow = await db.insertIntoTable(this.curTable, this.newRowData, this.newRowRefsData);
                Object.assign(createdRow, {name: createdRow.key_name, isRow: 1});
                this.$refs.tree.append(createdRow, this.parentNodeNewRow);
                this.newRow = false;
                this.newRowData = null;
                this.parentNodeNewRow = null;
            },

            async loadTable(node, resolve) {
                if (node.level === 0) {
                    let data = await db.getTablesList();
                    data = data.map(r => Object.assign(r, {name: r.TABLE_NAME}));
                    data = data.filter(r => r.TABLE_NAME !== 'relationships');
                    return resolve(data)
                }

                //tbl represents whenever node is table or not
                if (node.data.type === 'table') {
                    let data = (await db.getContent(node.data.TABLE_NAME));
                    data = data.map(r => Object.assign(r, {name: r.key_name, table: node.data.TABLE_NAME}));
                    resolve(data);
                } else {
                    let data = [];
                    for (let prop in node.data) {
                        if (prop !== "id" && prop !== "key_name" && prop !== "type" && prop !== "name" && prop !== "table") {
                            data.push({
                                prop: prop,
                                value: node.data[prop],
                                name: node.data[prop],
                                leaf: true,
                                table: node.data.table,
                                rowId: node.data.id
                            });
                        }
                    }
                    let refs = await db.getReferences(node.data.table, node.data.id);
                    let refData = refs.reduce((acc, item) => {
                        return acc.concat(item.data.map(obj => Object.assign(obj, {name: item.name, table: item.name})));
                    }, []);

                    data.push(...refData);

                    resolve(data);
                }
            },
        },
    }
</script>

<style>
    hr {
        border: 0;
        display: block;
        width: 100%;
        background-color: rgb(182, 182, 182);
        height: 1px;
    }

    #content {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 100%;
    }

    .el-tree-node__children{
        overflow: inherit!important;
    }

    #tree {
        width: 30%;
        height: 100%;
        position: fixed;
        overflow-x: auto;
        overflow-y: auto;
    }

    #crud {
        display: flex;
        flex-direction: column;
        width: 65%;
        height: 100%;
        position: fixed;
        margin-left: 35%;
    }

    #editView {
        height: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    #tips {
        height: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    #newRowDialog {
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        padding-right: 8px;
    }

</style>
