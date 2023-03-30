<template>
  <div>
    <el-dialog
      title="上传图片"
      :visible="dialogvisible"
      width="700px"
      custom-class="dialog-custom"
      :close-on-click-modal="false"
      :append-to-body="true"
      @close="close"
      @opened="opened"
    >
      <div v-if="!upLoadProcess" class="image-upload-container">
        <div v-if="!imageUrl" class="choose-box">
          <el-upload
            :accept="accept"
            class="upload-image"
            drag
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :on-change="changeUpload"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将图片拖到此处，或<em>点击上传</em></div>
          </el-upload>
        </div>
        <div v-else class="cut-box">
          <div class="cropper">
            <vueCropper
              ref="cropper"
              :img="imageUrl"
              :output-size="cutOption.outputSize"
              :output-type="cutOption.outputType"
              :info="true"
              :full="cutOption.full"
              :can-move="cutOption.canMove"
              :can-move-box="cutOption.canMoveBox"
              :original="cutOption.original"
              :auto-crop="cutOption.autoCrop"
              :fixed="fixed"
              :fixed-number="[ratio, 1]"
              :center-box="cutOption.centerBox"
              :info-true="cutOption.infoTrue"
              :fixed-box="cutOption.fixedBox"
            ></vueCropper>
          </div>
          <el-button size="small" @click="imageUrl=''">重新选择</el-button>
          <el-button size="small" type="primary" @click="confirm">确认</el-button>
        </div>
      </div>
      <div v-else class="process">
        <el-progress :text-inside="true" :stroke-width="25" :percentage="upLoadProcess"></el-progress>
      </div>
    </el-dialog>
  </div>
</template>

<script type="text/ecmascript-6">
import Vue from 'vue'
import VueCropper from 'vue-cropper'
import { gosImageConfig } from '@/settings'
import { GosUpload } from '@/utils/GosUpload'
import { uuid, convertBase64UrlToBlob, imageMimes } from '@/utils/index'

Vue.use(VueCropper)
export default {
  name: 'ImageUpLoad',
  components: { },
  props: {
    dialogvisible: {
      type: Boolean,
      default: false
    },
    ratio: {
      type: Number, // 宽高比例
      default: 1
    },
    accept: {
      type: String,
      default: 'image/jpg,image/jpeg,image/png'
    },
    imageFormat: {
      type: String, // 类型  jpg  png gif  等
      default: 'png'
    },
    imageSize: {
      type: Number, // 图片文件大小 以M为单位，默认5M
      default: 5
    },
    // 是否开启截图框宽高固定比例 默认开启
    fixed: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      // gos上传类
      gosUpload: null,
      imageUrl: '',
      cutOption: {
        info: true, // 裁剪框的大小信息
        outputSize: 0.8, // 裁剪生成图片的质量
        outputType: 'jpg', // 裁剪生成图片的格式
        autoCrop: true, // 是否默认生成截图框
        fixedBox: false, // 是否固定截图框大小
        // fixed: true,  是否开启截图框宽高固定比例
        // fixedNumber: [1, 1], // 截图框的宽高比例
        full: true, // 是否输出原图比例的截图
        canMoveBox: true, // 截图框能否拖动
        original: false, // 上传图片按照原始比例渲染
        centerBox: true, // 截图框是否被限制在图片里面
        infoTrue: true // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
      },
      upLoadProcess: 0
    }
  },
  created() {

  },
  mounted() {

  },
  methods: {
    // 打开浮层
    opened() {
      const _this = this
      this.gosUpload = new GosUpload({
        host: gosImageConfig.host,
        key: gosImageConfig.key,
        bucketName: gosImageConfig.bucket_name,
        bucketPath: gosImageConfig.bucket_path,
        uploadProgress: _this.uploadProgress,
        fileUploaded: _this.uploadSuccess,
        error: (error) => {
          console.log(error)
          _this.$message.error(`图片上传失败，请重新上传`)
          _this.imageUrl = ''
          _this.upLoadProcess = 0
        }
      })
    },
    // 关闭浮层
    close() {
      this.gosUpload = null
      this.imageUrl = ''
      this.$emit('update:dialogvisible', false)
    },

    /**
     * 上传过程处理
     * @param evt  事件初始值
     * @param file 文件
     * @param process 上传进度百分比
     */
    uploadProgress(evt, file, process) {
      this.upLoadProcess = process
    },

    /**
     * 上传成功回调
     * @param file 文件
     * @param info 上传结果
     */
    uploadSuccess(file, info) {
      this.$emit('uploadedSuccess', `${gosImageConfig.cdn_host}/${info.Key}`)
      this.close()
      this.imageUrl = ''
      this.upLoadProcess = 0
    },

    /**
     * 选择改变事件获取图片文件
     * @param file
     * @param fileList
     * @return {boolean}
     */
    changeUpload(file, fileList) {
      const pass = file.size / 1024 / 1024 < this.imageSize
      if (!pass) {
        this.$message.error(`上传文件大小不能超过 ${this.imageSize}MB!`)
        return false
      }
      // 上传成功后将图片地址赋值给裁剪框显示图片
      const _that = this
      const reader = new FileReader()
      reader.readAsDataURL(file.raw)
      reader.onload = function(e) {
        // console.log(e)
        _that.imageUrl = this.result
      }
    },

    /**
     * 确认上传
     */
    confirm() {
      const _that = this
      // 带图片比例的文件名称
      const fmData_fileName = `_w_${_that.$refs.cropper.cropW.toFixed(0)}_h_${_that.$refs.cropper.cropH.toFixed(0)}.${_that.imageFormat}`

      this.$refs.cropper.getCropBlob((data) => {
        const reader = new FileReader()
        reader.readAsDataURL(data)
        reader.onload = function(e) {
          const base64 = this.result
          const imageFile = new File([convertBase64UrlToBlob(base64, _that.imageFormat)], (uuid() + fmData_fileName), { type: imageMimes[_that.imageFormat] })
          _that.gosUpload.fileArr = [imageFile]
          _that.gosUpload.start()
        }
      })
    }
  }
}
</script>

<style lang="scss" type="text/scss" scoped>
  .image-upload-container{
    width: 100%;
    .choose-box{
      width: 100%;
      height: 200px;
    }
  }
  .cut-box{
    width: 100%;
    min-height: 350px;
    .cropper{
      height: 350px;
      margin-bottom: 15px;
    }
  }
</style>

<style lang="scss" type="text/scss">
  .upload-image{
    width: 100%;
    .el-upload{
      width: inherit;
      .el-upload-dragger{
        width: inherit;
        border: none;
        background: #eff0f2;
      }
    }
  }
</style>
