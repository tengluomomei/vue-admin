<template>
  <div>
    <el-button class="pic_button" type="primary" :size="btnSize" @click.stop.prevent="toUpload">{{ loading ? '上传中...' : msg }}</el-button>
    <span></span>
  </div>
</template>

<script type="text/ecmascript-6">
import { GosUpload } from '@/utils/GosUpload'
import { gosImageConfig } from '@/settings'
import { fileRename } from '@/utils/index'
export default {
  components: {},
  props: {
    ifMulti: {
      type: Boolean,
      default: false // 默认单个文件上传
    },
    msg: {
      type: String,
      default: '上传'
    },
    btnSize: {
      type: String,
      default: 'small'
    },
    accept: {
      type: String,
      default: 'image/*' // 文件格式
    },
    maxSize: {
      type: Number,
      default: 500 * 1024 * 1024 // 单位M
    }
  },
  data() {
    return {
      loading: false,
      resultArr: [],
      failArr: []
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    const _this = this
    this.fileGosUpload = new GosUpload({
      host: gosImageConfig.host,
      key: gosImageConfig.key,
      bucketName: gosImageConfig.bucket_name,
      bucketPath: gosImageConfig.bucket_path,
      fileUploaded: _this.fileUploadSuccess,
      error: (error) => {
        console.log(error)
        this.$message.error('上传失败，请稍候再试')
        _this.vLoading = false
      }
    })
  },
  methods: {
    toUpload() {
      this.fileUpload()
    },
    fileUpload() {
      this.fileGosUpload.count = 0
      const input = document.createElement('input')
      input.setAttribute('type', 'file')
      input.setAttribute('multiple', 'multiple')
      input.setAttribute('accept', this.accept)
      input.click()
      input.onchange = this.fileInputOnchange
    },
    fileInputOnchange() {
      this.loading = true
      const result = this.fileRuleCheck(event.target.files)
      this.fileGosUpload.fileArr = result
      this.fileGosUpload.start()
    },
    fileRuleCheck(files) {
      const resultArr = []
      const failArr = []
      for (const file of files) {
        if (file.size / 1024 / 1024 > this.maxSize) {
          failArr.push(file)
          continue
        }
        resultArr.push(fileRename(file, file.type))
      }
      if (failArr.length > 0) {
        this.$message.warning(`您上传的文件,有${failArr.length}张超过${this.maxSize}M限制`)
        failArr.length === files.length ? this.loading = false : null
      }
      this.resultArr = resultArr
      this.failArr = failArr
      return resultArr
    },
    fileUploadSuccess(file, info) {
      this.fileGosUpload.count += 1
      if (this.fileGosUpload.fileArr.length === this.fileGosUpload.count) {
        this.loading = false
        this.fileGosUpload.count = 0
        this.fileGosUpload.fileArr = []
      }
      const url = `${gosImageConfig.cdn_host}/${info.Key}`
      this.$emit('uploadSuccess', url)
    }
  }
}
</script>

<style lang="scss" type="scss" scoped>
</style>
