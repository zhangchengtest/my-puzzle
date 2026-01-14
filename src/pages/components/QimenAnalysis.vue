<template>
  <div class="analysis-result" v-if="analysisResult">
    <h3>分析结果</h3>
    <div class="result-content">
      <div class="result-question">
        <strong>求测事项：</strong>{{ question }}
      </div>
      <div class="result-analysis">
        <div v-for="(item, index) in analysisResult.items" :key="index" class="result-item">
          <h4>{{ item.title }}</h4>
          <p>{{ item.content }}</p>
          <div v-if="item.reference" class="result-reference">
            <strong>参考规则：</strong>
            <span>{{ item.reference }}</span>
          </div>
        </div>
      </div>
      <div class="result-summary">
        <h4>综合建议</h4>
        <p>{{ analysisResult.summary }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QimenAnalysis',
  props: {
    analysisResult: {
      type: Object,
      default: null
    },
    question: {
      type: String,
      default: ''
    }
  }
};
</script>

<style scoped>
.analysis-result {
  margin-top: 30px;
  padding: 20px;
  background-color: #f0f9ff;
  border-radius: 8px;
  border: 2px solid #409eff;
}

.analysis-result h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #409eff;
  font-size: 20px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
}

.result-content {
  color: #333;
}

.result-question {
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  border-left: 4px solid #409eff;
}

.result-question strong {
  color: #409eff;
}

.result-analysis {
  margin-bottom: 20px;
}

.result-item {
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-item h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #409eff;
  font-size: 16px;
}

.result-item p {
  margin: 0;
  line-height: 1.6;
  color: #666;
}

.result-reference {
  margin-top: 12px;
  padding: 10px;
  background-color: #f5f7fa;
  border-left: 3px solid #909399;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.6;
}

.result-reference strong {
  color: #606266;
  display: block;
  margin-bottom: 5px;
}

.result-reference span {
  color: #606266;
  display: block;
}

.result-summary {
  background-color: #fff9e6;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #e6a23c;
}

.result-summary h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #e6a23c;
  font-size: 16px;
}

.result-summary p {
  margin: 0;
  line-height: 1.6;
  color: #666;
}
</style>

