<template>
  <div style="padding: 20px; font-family: monospace;">
    <h2>建表语句生成器（支持字段名转为下划线）</h2>
    <textarea
      v-model="jsonInput"
      rows="15"
      cols="60"
      placeholder="请输入 JSON 字符串"
      style="width: 100%; margin-bottom: 20px;"
    ></textarea>
    <div>
      <label>表名：</label>
      <input v-model="tableName" placeholder="请输入表名" />
    </div>
    <h3>建表语句：</h3>
    <pre>{{ createTableSQL }}</pre>
  </div>
</template>

<script>
export default {
  data() {
    return {
      jsonInput: '',
      tableName: 'your_table',
    };
  },
  computed: {
    createTableSQL() {
      try {
        const obj = JSON.parse(this.jsonInput);
        if (typeof obj !== 'object' || Array.isArray(obj)) return '请输入合法的 JSON 对象';
        const lines = [];

        // 添加主键字段，comment 也加上
        lines.push('  `id` VARCHAR(32) PRIMARY KEY COMMENT \'主键ID\',');

        // 遍历 JSON 字段
        for (const [key, value] of Object.entries(obj)) {
          const snakeKey = this.toSnakeCase(key);
          const type = this.mapType(value);
          const defaultValue = this.getDefaultValue(value);
          const comment = key.replace(/'/g, "\\'"); // 转义单引号，防止注释报错
          lines.push(`  \`${snakeKey}\` ${type} DEFAULT ${defaultValue} COMMENT '${comment}',`);
        }

        // 去掉最后一行逗号
        lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, '');

        return `CREATE TABLE \`${this.tableName}\` (\n${lines.join('\n')}\n) COMMENT='${this.tableName}';`;
      } catch (e) {
        return 'JSON 解析失败，请检查输入格式。';
      }
    },
  },
  methods: {
    mapType(value) {
      const type = typeof value;
      if (type === 'number') {
        return Number.isInteger(value) ? 'BIGINT' : 'DECIMAL(20, 8)';
      }
      if (type === 'boolean') {
        return 'BOOLEAN';
      }
      if (type === 'string') {
        if (/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}/.test(value)) {
          return 'DATETIME';
        }
        if (/^\d+\.\d+$/.test(value)) {
          return 'DECIMAL(20, 8)';
        }
        if (/^\d+$/.test(value)) {
          return 'BIGINT';
        }
        return 'VARCHAR(255)';
      }
      return 'TEXT';
    },
    toSnakeCase(str) {
      return str
        .replace(/([A-Z])/g, '_$1')
        .replace(/[-\s]/g, '_')
        .toLowerCase()
        .replace(/^_+/, '');
    },
    getDefaultValue(value) {
      const type = typeof value;
      if (type === 'number') return 0;
      if (type === 'boolean') return false;
      if (type === 'string') return 'NULL';
      return 'NULL';
    },
  },
};
</script>
