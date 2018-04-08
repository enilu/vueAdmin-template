<template>
  <div class="app-container">

    <el-row :gutter="20">
      <el-col :span="4">
        <el-tree
                :data="treeData"
                :props="defaultProps"
                @node-click="handleNodeClick"
                node-key="id"
                :default-expanded-keys="[0,24]">

        </el-tree>

      </el-col>
      <el-col :span="20">
        <div class="filter-container">
          <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="帐号" v-model="listQuery.account">
          </el-input>
          <el-date-picker
                  v-model="listQuery.beginTime"
                  type="date"
                  placeholder="注册开始日期">
          </el-date-picker>
          <el-date-picker
                  v-model="listQuery.endTime"
                  type="date"
                  placeholder="注册结束日期">
          </el-date-picker>
          <!--<el-select clearable style="width: 90px" class="filter-item" v-model="listQuery.importance" :placeholder="query_imp">-->
            <!--<el-option v-for="item in importanceOptions" :key="item" :label="item" :value="item">-->
            <!--</el-option>-->
          <!--</el-select>-->
          <!--<el-select clearable class="filter-item" style="width: 130px" v-model="listQuery.type" :placeholder="query_type">-->
            <!--<el-option v-for="item in  calendarTypeOptions" :key="item.key" :label="item.display_name+'('+item.key+')'" :value="item.key">-->
            <!--</el-option>-->
          <!--</el-select>-->
          <!--<el-select @change='handleFilter' style="width: 140px" class="filter-item" v-model="listQuery.sort">-->
            <!--<el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">-->
            <!--</el-option>-->
          <!--</el-select>-->
          <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
          <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">重置</el-button>
        </div>
        <div class="filter-container">
          <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">添加</el-button>
          <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">修改</el-button>
          <el-button class="filter-item" type="primary" :loading="downloadLoading" v-waves icon="el-icon-download" @click="handleDownload">删除</el-button>
          <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">重置密码</el-button>
          <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">冻结</el-button>
          <el-button class="filter-item" type="primary" :loading="downloadLoading" v-waves icon="el-icon-download" @click="handleDownload">解除冻结</el-button>
          <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">角色分配</el-button>
        </div>
        <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit highlight-current-row>
          <el-table-column align="center" label='ID' >
            <template scope="scope">
              {{scope.$index}}
            </template>
          </el-table-column>
          <el-table-column label="帐号">
            <template scope="scope">
              {{scope.row.account}}
            </template>
          </el-table-column>
          <el-table-column label="姓名"   align="center">
            <template scope="scope">
              <span>{{scope.row.name}}</span>
            </template>
          </el-table-column>
          <el-table-column label="性别"  align="center">
            <template scope="scope">
              {{scope.row.sexName}}
            </template>
          </el-table-column>
          <el-table-column class-name="status-col" label="角色"   align="center">
            <template scope="scope">
              {{scope.row.roleName}}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="created_at" label="部门"  >
            <template scope="scope">
              <span>{{scope.row.deptName}}</span>
            </template>
          </el-table-column>
          <el-table-column label="邮箱"   align="center">
            <template scope="scope">
              <span>{{scope.row.email}}</span>
            </template>
          </el-table-column>
          <el-table-column label="电话"   align="center">
            <template scope="scope">
              <span>{{scope.row.phone}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="created_at" label="创建时间" width="200">
            <template scope="scope">
              <i class="el-icon-time" v-if="scope.row.createtime !=''"></i>
              <span>{{scope.row.createtime}}</span>
            </template>
          </el-table-column>
          <el-table-column class-name="status-col" label="状态" width="110" align="center">
            <template scope="scope">
              <el-tag :type="scope.row.status | statusFilter">{{scope.row.statusName}}</el-tag>
            </template>
          </el-table-column>

        </el-table>

        <div class="pagination-container">
          <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
                         :current-page="listQuery.page" :page-sizes="[10,20,30, 50]"
                         :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper"
                         :total="total">
          </el-pagination>
        </div>
      </el-col>

    </el-row>

  </div>
</template>

<script>
import { getList,getDeptTree } from '@/api/table'
const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]
// arr to obj ,such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
          acc[cur.key] = cur.display_name
          return acc
        }, {})

export default {
  data() {
    return {
      query_title:'标题',
      query_imp:'重要性',
      query_type:'类型',
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      calendarTypeOptions,
      importanceOptions: [1, 2, 3],
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false,
      listLoading: true,
      treeData:[],
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        "1": 'success',
        "2": 'gray',
        "3": 'danger'
      }
      console.log(status);
      return statusMap[status]
    }
  },
  created() {
    this.getList();
    this.getTreeData();
  },
  methods: {
    getList() {
      this.listLoading = true
      getList(this.listQuery).then(response => {
        this.list = response.data.items;
        this.total = response.data.total
        this.listLoading = false;
      })

    },
    getTreeData(){
      getDeptTree(this.listQuery).then(response => {
        this.treeData = response.data;
    })
    },
    handleFilter(){
      this.listQuery.page = 1
      this.getList()
    },
    handleCreate(){},

    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
  }
}
</script>
