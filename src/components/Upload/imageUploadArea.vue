<template>
  <div class="image-show-area" :style="{ width: `${width}px`, height: `${height}px` }" @click.stop.prevent="uploadPic">
    <img v-if="url !== ''" :src.sync="url">
    <div v-else-if="url === '' && msg !== ''" class="text">
      <div>{{ msg }}</div>
    </div>
    <ImageUploadModal :dialogvisible.sync="visible" :ratio="ratio" :accept="accept" @uploadedSuccess="uploadSuccess" />
  </div>
</template>

<script type="text/ecmascript-6">
import ImageUploadModal from '@/components/Upload/imageUpload'
import { GosUpload } from '@/utils/GosUpload'
import { gosImageConfig } from '@/settings'
import { fileRename } from '@/utils/index'

export default {
  components: { ImageUploadModal },
  props: {
    url: {
      type: String,
      default: '' // 图片地址
    },
    width: {
      type: Number,
      default: 300 // 单位px
    },
    height: {
      type: Number,
      default: 200 // 单位px
    },
    ifCut: {
      type: Boolean,
      default: false // 是否需要剪裁
    },
    accept: {
      type: String,
      default: 'image/*' // 文件格式
    },
    maxSize: {
      type: Number,
      default: 500 * 1024 * 1024 // 单位M
    },
    msg: {
      type: String,
      default: '' // 图片上传区域内显示的文本信息(可用来显示约定尺寸)
    }
  },
  data() {
    return {
      visible: false,
      ratio: 1.5
    }
  },
  watch: {},
  created() {},
  mounted() {
    const _this = this
    this.ratio = Number((this.width / this.height).toFixed(3))
    this.imageGosUpload = new GosUpload({
      host: gosImageConfig.host,
      key: gosImageConfig.key,
      bucketName: gosImageConfig.bucket_name,
      bucketPath: gosImageConfig.bucket_path,
      fileUploaded: _this.imageFileUploadSuccess,
      error: (error) => {
        console.log(error)
        this.$message.error('上传图片失败，请稍候再试')
        _this.vLoading = false
      }
    })
  },
  methods: {
    uploadPic() {
      if (this.ifCut) {
        this.visible = true
      } else {
        // @TODO
        this.imageFileUpload()
      }
    },
    imageFileUpload() {
      const input = document.createElement('input')
      input.setAttribute('type', 'file')
      input.setAttribute('accept', this.accept)
      input.click()
      input.onchange = this.imageInputOnchange
    },
    imageInputOnchange() {
      const result = this.fileRuleCheck(event.target.files)
      this.imageGosUpload.upload(result[0])
    },
    fileRuleCheck(files) {
      const resultArr = []
      const failArr = []
      for (const file of files) {
        if (file.size > this.maxSize) {
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
    imageFileUploadSuccess(file, info) {
      const url = `${gosImageConfig.cdn_host}/${info.Key}`
      this.uploadSuccess(url)
    },
    uploadSuccess(url) {
      this.$emit('update:url', url)
    }
  }
}
</script>

<style lang="scss" type="scss" scoped>
.image-show-area {
  cursor: pointer;
  background-color: #f0f0f0;
  color: #9b9b9b;
  border-radius: 4px;
  overflow: hidden;
  &:hover {
    border: 1px dotted #409eff;
  }
  img {
    width: 100%;
    height: 100%;
  }
  .text {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    >div {
      width: 80%;
      text-align: center;
    }
  }
}
</style>
