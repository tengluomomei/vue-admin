module.exports = {
  title: 'Vue Element Admin',

  /**
   * @type {boolean} true | false
   * @description Whether show the settings right-panel
   */
  showSettings: true,

  /**
   * @type {boolean} true | false
   * @description Whether need tagsView
   */
  tagsView: true,

  /**
   * @type {boolean} true | false
   * @description Whether fix the header
   */
  fixedHeader: false,

  /**
   * @type {boolean} true | false
   * @description Whether show the logo in sidebar
   */
  sidebarLogo: false,

  /**
   * @type {string | array} 'production' | ['production', 'development']
   * @description Need show err logs component.
   * The default is only used in the production env
   * If you want to also use it in dev, you can pass ['production', 'development']
   */
  errorLog: 'production',
  // 富文本编辑器CDN地址
  tinyMcECDN: 'https://cdn.tiny.cloud/1/0pxrzw5eywze8gp0e3hxbz8mhriu4hz3c6cpijz2hfs3y7nx/tinymce/5/tinymce.min.js',
  // 腾讯
  gosTinyMcECDN: `https://pic.iyingdi.com/resstatic/web/plugin/tinymce/tinymce.min.js`,

  // GOS视频、音频上传配置 视频上传自动截图生成封面，封面图与视频文件名一致
  gosMediaConfig: {
    host: `https://gos.gaeamobile.net`,
    cdn_host: `https://video.iyingdi.com`,
    cdn_cover_host: `https://video.iyingdi.com/screenshot`,
    cdn_cover_suffix: `_snapshotByOffset_10_0.jpg`,
    key: `d5cae68f233ee067`,
    bucket_name: `6f033c187dbb6f3a4d7623fc4aec7a81`,
    bucket_path: `/admin/media`
  },

  // GOS图片上传配置
  gosImageConfig: {
    host: `https://gos.gaeamobile.net`,
    cdn_host: `https://pic.iyingdi.com`,
    key: `f17b8ac4d26aca60`,
    bucket_name: `f5e7699a3d90a5b5427165ced2956fb7`,
    bucket_path: `/admin/img`
  }
}
