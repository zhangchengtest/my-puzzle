<template>
  <div style="padding: 20px; font-family: monospace;">
    <h2>SQL ➜ 实体类 + Mapper 接口 + XML 文件生成器</h2>

    <div>
      <label for="bian">请输入 Bian 目录名：</label>
      <input id="bian" v-model="bian" placeholder="请输入目录名" />
    </div>

    <textarea v-model="createTableSQL" rows="12" cols="80" placeholder="请输入 CREATE TABLE SQL" />

    <div style="margin-top: 10px;">
      <button @click="generateFiles">生成</button>
      <button @click="downloadAll" :disabled="!entityCode">下载所有文件（ZIP）</button>
    </div>

    <h3>实体类代码：</h3>
    <pre v-if="entityCode">{{ entityCode }}</pre>

    <h3>Mapper 接口代码：</h3>
    <pre v-if="mapperCode">{{ mapperCode }}</pre>

    <h3>XML 映射代码：</h3>
    <pre v-if="xmlCode">{{ xmlCode }}</pre>
  </div>
</template>

<script>
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default {
  data() {
    return {
      createTableSQL: '',
      entityCode: '',
      mapperCode: '',
      xmlCode: '',
      bian: 'bian', // 默认目录名为 bian
      className: 'BianOrder',
      tableName: 'bian_order',
      packageName: 'com.elephant.music.mapper',
      modelPackage: 'com.elephant.common.model.bian', // 使用 bian 变量来构建路径
    };
  },
  methods: {
    generateFiles() {
      const tableNameMatch = this.createTableSQL.match(/CREATE TABLE `?(\w+)`?/i);
      this.tableName = tableNameMatch ? tableNameMatch[1] : 'unknown_table';
      this.className = this.pascalCase(this.tableName);

      // 根据用户输入的 bian 动态生成包路径
      this.modelPackage = `com.elephant.common.model.${this.bian}`;
      this.packageName = `com.elephant.${this.bian}.mapper`;

      const columnRegex = /`(\w+)`\s+(\w+)(?:\([^)]+\))?/g;
      let match;
      const fields = [];
      while ((match = columnRegex.exec(this.createTableSQL)) !== null) {
        const [_, name, sqlType] = match;
        fields.push({ column: name, property: this.camelCase(name), javaType: this.mapSQLTypeToJava(sqlType.toUpperCase()) });
      }

      // 实体类
      let entity = `package ${this.modelPackage};\n\n` +
        `import lombok.Data;\nimport com.baomidou.mybatisplus.annotation.TableName;\nimport java.math.BigDecimal;\nimport java.util.Date;\n\n` +
        `@Data\n@TableName("${this.tableName}")\npublic class ${this.className} {\n`;
      fields.forEach(field => {
        entity += `    private ${field.javaType} ${field.property};\n`;
      });
      entity += `}\n`;
      this.entityCode = entity;

      // Mapper 接口
      const mapper = `package ${this.packageName};\n\n` +
        `import ${this.modelPackage}.${this.className};\n` +
        `import com.cunw.orm.mapper.IBaseMapper;\n` +
        `import org.apache.ibatis.annotations.Mapper;\n\n` +
        `/**\n * ${this.className}-Mapper\n *\n * @author cunw generator\n` +
        ` * date ${new Date().toISOString().split('T')[0]}\n` +
        ` * 湖南新云网科技有限公司版权所有.\n */\n` +
        `@Mapper\npublic interface ${this.className}Mapper extends IBaseMapper<${this.className}, String> {\n\n}`;
      this.mapperCode = mapper;

      // XML 文件
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">\n` +
        `<mapper namespace="${this.packageName}.${this.className}Mapper">\n\n` +
        `    <!-- 通用查询映射结果 -->\n` +
        `    <resultMap id="BaseResultMap" type="${this.modelPackage}.${this.className}">\n`;
      fields.forEach((field, index) => {
        const tag = index === 0 ? 'id' : 'result';
        xml += `        <${tag} column="${field.column}" property="${field.property}" />\n`;
      });
      xml += `    </resultMap>\n</mapper>\n`;
      this.xmlCode = xml;
    },

    mapSQLTypeToJava(sqlType) {
      const mapping = {
        BIGINT: 'Long',
        VARCHAR: 'String',
        DECIMAL: 'BigDecimal',
        BOOLEAN: 'Boolean',
        INT: 'Integer',
        TEXT: 'String',
        DATETIME: 'Date',
      };
      return mapping[sqlType] || 'String';
    },

    camelCase(str) {
      return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    },

    pascalCase(str) {
      const camel = this.camelCase(str);
      return camel.charAt(0).toUpperCase() + camel.slice(1);
    },

    async downloadAll() {
      const zip = new JSZip();

      // 使用 bian 变量来生成路径
      const entityFilePath = `src/main/java/com/elephant/common/model/${this.bian}/${this.className}.java`;
      const mapperFilePath = `src/main/java/com/elephant/${this.bian}/mapper/${this.className}Mapper.java`;
      const xmlFilePath = `src/main/resources/com/elephant/${this.bian}/mapper/${this.className}Mapper.xml`;

      zip.file(entityFilePath, this.entityCode);
      zip.file(mapperFilePath, this.mapperCode);
      zip.file(xmlFilePath, this.xmlCode);

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${this.className}_code.zip`);
    }
  }
};
</script>

<style scoped>
textarea {
  width: 100%;
  font-family: monospace;
  padding: 10px;
}
button {
  margin-right: 10px;
  padding: 6px 12px;
}
pre {
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  padding: 10px;
  white-space: pre-wrap;
}
</style>
