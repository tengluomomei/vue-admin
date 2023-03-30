<template>
  <div class="userListPage">
    <div class="table-top">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="">
          <el-select v-model="searchForm.medal_type" size="large" placeholder="请选择勋章类型">
            <el-option label="徽章" value="badge" />
            <el-option label="名字颜色" value="name_color" />
            <el-option label="头像框" value="border" />
            <el-option label="成就" value="achievement" />
          </el-select>
        </el-form-item>
        <el-form-item label="">
          <el-select v-model="searchForm.is_visible" size="large" placeholder="商品状态">
            <el-option label="已上架" :value="1" />
            <el-option label="未上架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="">
          <el-select v-model="searchForm.acquire_type" size="large" placeholder="获取类型">
            <el-option label="积分兑换" value="1" />
            <el-option label="条件获取" value="2" />
            <el-option label="VIP赠送" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="">
          <el-select v-if="searchForm.acquire_type === '2'" v-model="payType" size="large" placeholder="支付方式">
            <el-option label="创作币" value="coin" />
            <el-option label="萤火币" value="fire" />
          </el-select>
        </el-form-item>
        <el-form-item label="">
          <el-input v-model="searchForm.medal_name" placeholder="请输入勋章名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchData">查询</el-button>
        </el-form-item>
        <el-button v-if="$store.getters.permissions.button['user-medal_create']" type="success" style="float: right" @click="openDialog(null)">添加勋章</el-button>
      </el-form>
    </div>
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column label="ID" align="center" prop="medal_id" />
      <el-table-column label="名称" align="center" prop="medal_name" />
      <el-table-column label="类型" align="center" prop="medal_type">
        <template slot-scope="scope">
          <span>{{ madelTypeMap[scope.row.medal_type] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="获取类型" align="center" prop="acquire_type">
        <template slot-scope="scope">
          <span v-if="scope.row.acquire_type === '1'">积分兑换</span>
          <span v-if="scope.row.acquire_type === '2'">条件获取</span>
          <span v-if="scope.row.acquire_type === '3'">购买</span>
        </template>
      </el-table-column>
      <el-table-column
        label="外观"
        width="100"
        align="center"
        :resizable="false"
      >
        <template slot-scope="scope">
          <img v-if="scope.row.medal_type !== 'name_color'" class="pic-cover" :src="scope.row.medal_appearance" alt="">
          <span v-else> {{ scope.row.medal_appearance }}</span>
        </template>
      </el-table-column>
      <el-table-column label="描述" align="center" prop="medal_desc" />
      <el-table-column label="状态" align="center" prop="is_visible">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.is_visible==='1'" type="success">已上架</el-tag>
          <el-tag v-if="scope.row.is_visible==='0'" type="info">未上架</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="价格" align="center" prop="price">
        <template slot-scope="scope">
          <span>{{ scope.row.price ? scope.row.price: '-' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="有效期" align="center" prop="expired_time">
        <template slot-scope="scope">
          <span v-if="scope.row.expired_type === 'forever'">永久</span>
          <span v-if="scope.row.expired_type === 'since'">{{ scope.row.expired_time }} 天</span>
          <span v-if="scope.row.expired_type === 'fixed'">{{ scope.row.expired_time[0] }} - {{ scope.row.expired_time[1] }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button v-if="$store.getters.permissions.button['user-medal_update']" type="primary" size="small" @click="openDialog(scope.row.medal_id,scope.row)">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="searchForm.page" :limit.sync="searchForm.page_size" @pagination="getList" />

    <el-dialog
      ref="formDialog"
      :title="(dialog.form.medal_id?'修改勋章':'新建勋章')"
      :visible.sync="dialog.status"
      width="540px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :destroy-on-close="true"
      @close="closeDialog"
    >
      <el-form ref="form" :rules="dialog.formRule" :model="dialog.form" label-width="100px" size="small">
        <el-form-item label="类型" prop="medal_type">
          <el-select v-model="dialog.form.medal_type" placeholder="请选择类型" style="width: 100%">
            <el-option label="徽章" :value="'badge'" />
            <el-option label="头像框" :value="'border'" />
            <el-option label="名字颜色" :value="'name_color'" />
            <el-option label="成就" :value="'achievement'" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="dialog.form.medal_type === 'badge' || dialog.form.medal_type === 'border' || dialog.form.medal_type === 'achievement'" label="外观" prop="medal_appearance">
          <el-row>
            <el-col :span="6">
              <fileUpload
                :accept="`image/jpeg;image/jpg;image/png`"
                :msg="`上传图片`"
                :image-size="0.19"
                @uploadSuccess="loadImageSuccess"
              />
            </el-col>
            <el-col :span="2">
              <div v-if="dialog.form.medal_appearance !== ''" class="image-box">
                <img class="cover" :src="dialog.form.medal_appearance" alt="">
              </div>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item v-if="dialog.form.medal_type === 'name_color'" label="外观" prop="medal_appearance">
          <el-input v-model="dialog.form.medal_appearance" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click.stop="onSubmit">确 认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { apiMedalList, apiMedalCreate, apiMedalUpdate } from '@/api/medal'
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils/index'
import fileUpload from '@/components/Upload/fileUploadBtn'

const formData = {
  medal_id: null,
  // 勋章类型
  medal_type: null,
  // 勋章名称
  medal_name: null,
  // 勋章描述
  medal_desc: null,
  // 获取类型
  acquire_type: null,
  // 获取条件
  acquire_condition: null,
  // 获取描述
  acquire_desc: null,
  // 排序标识
  sort_flag: 0,
  // 是否可见
  is_visible: 1,
  // 是否为默认使用
  default_used: 0,
  // 是否绝版
  is_legacy: 0,
  // 有效时间类型
  expired_type: 'forever',
  // 有效时间
  expired_time: null,
  expired_day: '',
  // 内链地址
  inner_link: '',
  // 外观
  medal_appearance: ''
}

export default {
  name: 'MedalList',
  components: { Pagination, fileUpload },
  data() {
    return {
      searchForm: {
        page_size: 20,
        page: 1,
        medal_name: '',
        medal_type: '',
        is_visible: '',
        acquire_type: '', // 1-积分兑换，2-条件获取，3-VIP赠送
        pay_fire: 0, // 是否萤火币
        pay_pcoin: 0 // 是否创作币
      },
      payType: '',
      list: null,
      total: 0,
      listLoading: false,
      madelTypeMap: {
        badge: '徽章',
        name_color: '名字颜色',
        border: '头像框',
        achievement: '成就'
      },
      // 新建/修改Dialog
      dialog: {
        status: false,
        loading: null,
        form: formData,
        formRule: {
          medal_type: [
            { required: true, message: '请选择勋章类型', trigger: 'change' }
          ],
          medal_name: [
            { required: true, message: '请输入勋章名称', trigger: 'blur' },
            { min: 1, max: 10, message: '勋章名称长度在 1 到 10 个字符', trigger: 'blur' }
          ],
          medal_desc: [
            { required: true, message: '请输入勋章描述', trigger: 'blur' },
            { min: 1, max: 100, message: '勋章描述长度在 1 到 100 个字符', trigger: 'blur' }
          ],
          acquire_type: [
            { required: true, message: '请选择获取类型', trigger: 'change' }
          ],
          acquire_condition: [
            { required: true, message: '请输入获取条件', trigger: 'change' }
          ],
          acquire_desc: [
            { required: true, message: '请输入获取描述', trigger: 'change' }
          ],
          medal_appearance: [
            { required: true, message: '请选择外观', trigger: 'change' }
          ]
        }
      },
      // 图片上传相关
      imgUploadVisible: true
    }
  },
  watch: {
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      if (this.payType === 'coin') {
        this.searchForm.pay_pcoin = 1
        this.searchForm.pay_fire = 0
      } else if (this.payType === 'fire') {
        this.searchForm.pay_fire = 1
        this.searchForm.pay_pcoin = 0
      }
      apiMedalList(this.searchForm).then(response => {
        const data = response.data
        this.list = data.rows
        for (let i = 0; i < this.list.length; i++) {
          if (this.list[i].expired_time !== null && this.list[i].expired_time !== undefined) {
            if (JSON.parse(this.list[i].expired_time).type === 'forever') {
              this.list[i].expired_time = ''
              this.list[i].expired_type = 'forever'
            } else if (JSON.parse(this.list[i].expired_time).type === 'since') {
              this.list[i].expired_time = JSON.parse(this.list[i].expired_time).day
              this.list[i].expired_type = 'since'
            } else if (JSON.parse(this.list[i].expired_time).type === 'fixed') {
              const arry = []
              arry.push(this.timeToStr(JSON.parse(this.list[i].expired_time).start_time))
              arry.push(this.timeToStr(JSON.parse(this.list[i].expired_time).end_time))
              this.list[i].expired_time = arry
              this.list[i].expired_type = 'fixed'
            }
          }

          if (this.list[i].acquire_type === '1') {
            if (JSON.parse(this.list[i].acquire_condition).pay_fire.consume !== 0) {
              this.list[i].price = JSON.parse(this.list[i].acquire_condition).pay_fire.consume + '萤火币'
            } else {
              this.list[i].price = JSON.parse(this.list[i].acquire_condition).pay_pcoin.consume + '创作币'
            }
          } else {
            this.list[i].price = '-'
          }
        }
        this.total = data.totalCount
        this.listLoading = false
      }).catch(err => {
        console.log(err)
      })
    },
    searchData() {
      this.getList()
    },
    /**
     * 打开 创建/修改的Dialog
     * @param id 虚拟ID（修改才会有）
     * @param item 物品信息
     */
    openDialog(id, item) {
      this.dialog.status = true
      if (!id) {
        return false
      }
      this.dialog.form = {
        medal_id: item.medal_id,
        // 勋章类型
        medal_type: item.medal_type,
        // 勋章名称
        medal_name: item.medal_name,
        // 勋章描述
        medal_desc: item.medal_desc,
        // 获取类型
        acquire_type: item.acquire_type,
        // 获取条件
        acquire_condition: item.acquire_condition,
        // 获取描述
        acquire_desc: item.acquire_desc,
        // 排序标识
        sort_flag: item.sort_flag,
        // 是否可见
        is_visible: Number(item.is_visible),
        // 是否为默认使用
        default_used: Number(item.default_used),
        // 是否绝版
        is_legacy: Number(item.is_legacy),
        // 有效时间类型
        expired_type: item.expired_type,
        // 有效时间
        expired_time: item.expired_time,
        expired_day: item.expired_type === 'since' ? item.expired_time : '',
        // 内链地址
        inner_link: item.inner_link,
        // 外观
        medal_appearance: item.medal_appearance
      }
    },
    /**
     * 关闭 创建/修改的Dialog
     */
    closeDialog() {
      this.dialog.form = formData
      this.dialog.loading = null
      this.$refs['form'].resetFields()
      this.dialog.status = false
    },
    timeToStr(time, format) {
      if (time === -1) {
        return -1
      }
      return parseTime(time, format)
    },
    /**
     * 打开图片上传控件
     * @param type {icon|longIcon|noodIcon}
     */
    openImageCutDialog(type) {
      this.imgUploadVisible = true
    },
    /**
     * 图片上传成功回调
     * @param url
     */
    loadImageSuccess(url) {
      this.dialog.form.medal_appearance = url
    }
  }
}
</script>

<style scoped>
.userListPage {
  padding: 20px;
}
.image-box{
  width: 100px;
  height: 100px;
  overflow: hidden;
}
.image-box img{
  max-width: 100%;
}
.pic-cover{
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
