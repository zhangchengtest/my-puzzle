<template>
  <div>
  <div class="file-input-wrapper">
    <img :src="imageUrl" v-if="imageUrl">
    <input type="file" @change="handleFileChange" class="myfile">
    <input type="text" placeholder="文件名" v-model="fileName" class="filename">
    <input type="text" placeholder="文件地址" v-model="fileUrl" class="filename">
  </div>
  <button @click="uploadFile" class="uploadBtn">上传</button>
  <button @click="copyUrl" class="uploadBtn">复制地址</button>
</div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      file: null,
      imageUrl: null,
      fileName: '',
      fileUrl: '',
    }
  },
  methods: {
    handleFileChange(event) {
      this.file = event.target.files[0]
      this.imageUrl = URL.createObjectURL(this.file)
    },
    uploadFile() {
      let formData = new FormData()
      formData.append('file', this.file)
      formData.append('fileName', this.fileName)
      axios.post('https://clock.cuiyi.club/openapi/upload/', formData).then(response => {
        this.fileUrl = response.data.data
      }).catch(error => {
        console.log(error)
      })
    },
    copyUrl() {
    const input = document.createElement('input')
    input.setAttribute('value', this.fileUrl)
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    alert('链接已复制到剪贴板')
  }
  }
}
</script>

<style>

.filename{
  height: 30px;
  line-height: 30px;
  font-size: 15px;
}
.uploadBtn{
  margin-top: 20px;
}
.file-input-wrapper {
display: flex;
justify-content: flex-start;
flex-direction: column;
}
.file-input-wrapper img {
max-width: 80%;
max-height: 80%;
object-fit: contain;
margin: 0 auto;
}
.myfile{
  margin-top: 10px;
}
button {
display: block;
margin: 0 auto;
width: 150px; /* 设置按钮宽度为150px */
}
</style>