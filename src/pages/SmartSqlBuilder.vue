<template>
  <div class="smart-sql-builder">
    <div class="container">
      <h1 class="title">智能SQL构建器</h1>
      
      <div class="input-section">
        <div class="input-group">
          <label for="sql-input">SQL语句：</label>
          <textarea
            id="sql-input"
            v-model="sqlInput"
            placeholder="请输入SQL语句，使用?作为参数占位符"
            class="sql-textarea"
          ></textarea>
        </div>
        
        <div class="input-group">
          <label for="params-input">参数：</label>
          <textarea
            id="params-input"
            v-model="paramsInput"
            placeholder="请输入参数，格式：值(类型)，例如：150005(Integer), 6(Integer), 1(Integer)"
            class="params-textarea"
          ></textarea>
        </div>
        
        <div class="button-group">
          <button @click="buildSql" class="build-btn">构建SQL</button>
          <button @click="clearAll" class="clear-btn">清空</button>
          <button @click="loadExample" class="example-btn">加载示例</button>
        </div>
      </div>
      
      <div class="output-section" v-if="finalSql">
        <h3>最终SQL：</h3>
        <div class="sql-output">
          <pre>{{ formattedSql }}</pre>
        </div>
        <div class="copy-section">
          <button @click="copyToClipboard" class="copy-btn">复制SQL</button>
        </div>
      </div>
      
      <div class="error-section" v-if="errorMessage">
        <div class="error-message">
          <strong>错误：</strong>{{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const sqlInput = ref('')
const paramsInput = ref('')
const finalSql = ref('')
const errorMessage = ref('')

const formattedSql = computed(() => {
  if (!finalSql.value) return ''
  return formatSql(finalSql.value, 120)
})

const buildSql = () => {
  try {
    errorMessage.value = ''
    
    if (!sqlInput.value.trim()) {
      errorMessage.value = '请输入SQL语句'
      return
    }
    
    if (!paramsInput.value.trim()) {
      errorMessage.value = '请输入参数'
      return
    }
    
    const parsedParams = parseParams(paramsInput.value)
    finalSql.value = buildFinalSql(sqlInput.value, parsedParams)
  } catch (error) {
    errorMessage.value = error.message
    finalSql.value = ''
  }
}

const clearAll = () => {
  sqlInput.value = ''
  paramsInput.value = ''
  finalSql.value = ''
  errorMessage.value = ''
}

const loadExample = () => {
  sqlInput.value = "SELECT id, product, channel_id, account_level, rate_name, account_open_fee, account_manager_fee, account_day_limit, account_recharge_rate, account_withdraw_rate, account_transfer_fee, account_transfer_rate, account_transfer_lower_limit, account_transfer_upper_limit, card_open_fee, card_manager_fee, card_day_limit, card_recharge_rate, card_refund_rate, card_transaction_fee, card_transaction_declined_fee, card_cross_board_fee, card_cross_exchange_rate, card_available_quantity, card_auto_increase_quantity, sales_benefit_rate, card_category_id, tenant_id, rate_type, update_time, rate_scope, audit_status, audit_user, card_bins, attr1, attr2, attr3, attr4, card_trans_fee_expression, card_refund_fee_expression, card_benefit_fee_expression, card_cross_board_fee_expression, usdt_recharge_rate, card_withdraw_fee FROM wallet_rate WHERE ((product = ? AND channel_id = ? AND audit_status = ? AND rate_type = ? AND rate_scope = ? AND card_category_id = ?)) AND tenant_id = '1'"
  paramsInput.value = "150005(Integer), 6(Integer), 1(Integer), 2(Integer), 134(String), 6(Integer)"
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(finalSql.value)
    alert('SQL已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    alert('复制失败，请手动复制')
  }
}

const parseParams = (raw) => {
  const result = []
  const tokens = raw.split(/\),\s*/)
  
  for (let token of tokens) {
    token = token.trim()
    if (!token.endsWith(')')) token += ')'
    
    const lparen = token.lastIndexOf('(')
    const rparen = token.lastIndexOf(')')
    if (lparen === -1 || rparen === -1 || rparen <= lparen) continue
    
    const valueStr = token.substring(0, lparen).trim()
    const typeStr = token.substring(lparen + 1, rparen).trim().toLowerCase()
    
    switch (typeStr) {
      case 'integer':
        result.push(parseInt(valueStr))
        break
      case 'timestamp':
        result.push(new Date(valueStr))
        break
      case 'string':
        result.push(valueStr)
        break
      default:
        result.push(valueStr) // fallback as string
    }
  }
  
  return result
}

const buildFinalSql = (sql, params) => {
  let result = ''
  let paramIndex = 0
  const length = sql.length
  
  for (let i = 0; i < length; i++) {
    const c = sql.charAt(i)
    if (c === '?' && paramIndex < params.length) {
      result += formatValue(params[paramIndex++])
    } else {
      result += c
    }
  }
  
  return result
}

const formatValue = (value) => {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'string' || typeof value === 'number') {
    return "'" + value.toString().replace(/'/g, "''") + "'"
  } else if (value instanceof Date) {
    const sdf = new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    return "'" + sdf.format(value) + "'"
  } else {
    return value.toString()
  }
}

const formatSql = (sql, maxLineLength) => {
  let result = ''
  let start = 0
  
  while (start < sql.length) {
    let end = Math.min(start + maxLineLength, sql.length)
    
    // 如果不是最后一行，往前找空格或逗号进行折行
    if (end < sql.length) {
      const lastSpace = sql.lastIndexOf(' ', end)
      const lastComma = sql.lastIndexOf(',', end)
      const breakPoint = Math.max(lastSpace, lastComma)
      if (breakPoint > start) {
        end = breakPoint + 1
      }
    }
    
    result += sql.substring(start, end).trim() + '\n'
    start = end
  }
  
  return result.trim()
}
</script>

<style scoped>
.smart-sql-builder {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin: 0;
  padding: 30px;
  text-align: center;
  font-size: 2.5rem;
  font-weight: 300;
}

.input-section {
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-group {
  margin-bottom: 25px;
  width: 100%;
  max-width: 800px;
  padding: 0 10px;
  box-sizing: border-box;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.sql-textarea,
.params-textarea {
  width: 100%;
  min-height: 120px;
  padding: 15px;
  margin: 0 10px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.sql-textarea:focus,
.params-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.button-group {
  display: flex;
  gap: 15px;
  margin-top: 20px;
  width: 100%;
  max-width: 800px;
  padding: 0 10px;
  justify-content: center;
  box-sizing: border-box;
}

.build-btn,
.clear-btn,
.example-btn,
.copy-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.build-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.build-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.clear-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 2px solid #e9ecef;
}

.clear-btn:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.example-btn {
  background: #28a745;
  color: white;
}

.example-btn:hover {
  background: #218838;
  transform: translateY(-2px);
}

.output-section {
  padding: 30px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.output-section h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.3rem;
}

.sql-output {
  background: #2d3748;
  color: #e2e8f0;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 20px;
}

.sql-output pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

.copy-section {
  text-align: center;
}

.copy-btn {
  background: #17a2b8;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-btn:hover {
  background: #138496;
  transform: translateY(-2px);
}

.error-section {
  padding: 20px 30px;
  background: #f8d7da;
  border-top: 1px solid #f5c6cb;
}

.error-message {
  color: #721c24;
  font-size: 16px;
}

@media (max-width: 768px) {
  .smart-sql-builder {
    padding: 10px;
  }
  
  .title {
    font-size: 2rem;
    padding: 20px;
  }
  
  .input-section,
  .output-section {
    padding: 20px;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .build-btn,
  .clear-btn,
  .example-btn {
    width: 100%;
  }
}
</style>
