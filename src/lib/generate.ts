export interface GenerateOptions {
  // TODO: 是否生成注释
  // comment?: boolean;
  // 必填
  required?: boolean;
  // 是否启用serializable 注解
  serializable?: boolean;
  // 驼峰命名
  camelCase?: boolean;
  // 是否使用final
  final?: boolean;
  // name
  name?: string;
}

export class GenerateDart {
  constructor(private options: GenerateOptions) {}

  generateType(value: any): string {
    if (typeof value === "string") {
      return "String";
    } else if (typeof value === "number") {
      // double or int
      if (value % 1 !== 0) {
        return "double";
      }
      return "int";
    } else if (typeof value === "boolean") {
      return "bool";
    } else if (typeof value === "object") {
      if (Array.isArray(value)) {
        return "List";
      } else if (value == null) {
        return "dynamic";
      } else {
        return "Map";
      }
    } else {
      return "dynamic";
    }
  }

  generateName(name: string, first = false): string {
    const camelCase = this.options.camelCase ?? true;
    if (!camelCase) {
      return name;
    }
    // 将下划线转换为驼峰
    const result = name.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    if (first) {
      return result[0].toUpperCase() + result.slice(1);
    } else {
      return result[0].toLowerCase() + result.slice(1);
    }
  }

  generateFileName() {
    const name = this.options.name || "Root";
    // convert PascalCase
    const pascalCaseName = name[0].toLowerCase() + name.slice(1);
    // convert snake_case
    const snakeCaseName = pascalCaseName
      .replace(/([A-Z])/g, "_$1")
      .toLowerCase();

    return `${snakeCaseName}`;
  }

  generateClass(name: string, json: Record<string, any>): string[] {
    const { serializable, final, required } = this.options;

    let currentCode = `class ${name} {\n`;

    if (serializable) {
      currentCode = `@JsonSerializable(explicitToJson: true)\n${currentCode}`;
    }

    const result: string[] = [];
    // 根据类型排序，复杂类型放在后面
    const keys = Object.keys(json).sort((a, b) => {
      const typeA = typeof json[a];
      const typeB = typeof json[b];
      if (typeA === "object") {
        return 1;
      }
      return -1;
    });

    keys.forEach((key) => {
      const element = json[key];
      let type = this.generateType(element);
      if (["Map", "List"].includes(type)) {
        const childClassName = this.generateName(`${name}_${key}`, true);
        let childElement = element;
        if (type === "List") {
          childElement = element[0];
          type = `${type}<${childClassName}>`;
        } else if (type === "Map") {
          childElement = element;
          type = childClassName;
        }
        const classResult = this.generateClass(
          childClassName,
          childElement || {}
        );
        result.push(...classResult);
      }
      let keyCode = `\n  ${final ? "final " : ""}${type}${
        !required ? "?" : ""
      } ${this.generateName(key)};\n`;
      if (serializable) {
        keyCode = `\n  @JsonKey(name: '${key}')${keyCode}`;
      }
      currentCode += keyCode;
    });

    // 生成构造函数
    if (keys.length) {
      currentCode += `\n  ${name}({\n`;
      currentCode += keys
        .map((key) => `    this.${this.generateName(key)},\n`)
        .join("");
      currentCode += "  });\n";
    } else {
      currentCode += `\n  ${name}();\n`;
    }

    // 生成fromJson方法
    currentCode += `\n  factory ${name}.fromJson(Map<String, dynamic> json) => _$${name}FromJson(json);\n`;
    // 生成toJson方法
    currentCode += `\n  Map<String, dynamic> toJson() => _$${name}ToJson(this);\n`;
    // 生成toString方法
    currentCode += `\n  @override\n  String toString() => toJson().toString();\n`;

    currentCode += "\n}";

    result.unshift(currentCode);

    return result;
  }

  generate(jsonCode: string) {
    const { name } = this.options;
    let json = JSON.parse(jsonCode);

    if (typeof json !== "object") {
      throw new Error("JSON must be an object");
    }
    if (Array.isArray(json)) {
      json = json[0];
    }

    const fileName = this.generateFileName();

    const resultClass = this.generateClass(name || "Root", json);

    const resultClassCode = resultClass.join("\n\n\n");

    const headerImportCode = `import 'package:json_annotation/json_annotation.dart';\n\n`;
    const headerGeneratedCode = `part '${fileName}.g.dart';\n\n\n`;

    return {
      code: headerImportCode + headerGeneratedCode + resultClassCode,
      fileName,
    };
  }
}
