"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateDart = void 0;
var GenerateDart = /** @class */ (function () {
    function GenerateDart(options) {
        this.options = options;
    }
    GenerateDart.prototype.generateType = function (value) {
        if (typeof value === "string") {
            return "String";
        }
        else if (typeof value === "number") {
            // double or int
            if (value % 1 !== 0) {
                return "double";
            }
            return "int";
        }
        else if (typeof value === "boolean") {
            return "bool";
        }
        else if (typeof value === "object") {
            if (Array.isArray(value)) {
                return "List";
            }
            else if (value == null) {
                return "dynamic";
            }
            else {
                return "Map";
            }
        }
        else {
            return "dynamic";
        }
    };
    GenerateDart.prototype.generateName = function (name, first) {
        var _a;
        if (first === void 0) { first = false; }
        var camelCase = (_a = this.options.camelCase) !== null && _a !== void 0 ? _a : true;
        if (!camelCase) {
            return name;
        }
        // 将下划线转换为驼峰
        var result = name.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
        if (first) {
            return result[0].toUpperCase() + result.slice(1);
        }
        else {
            return result[0].toLowerCase() + result.slice(1);
        }
    };
    GenerateDart.prototype.generateFileName = function () {
        var name = this.options.name || "Root";
        // convert PascalCase
        var pascalCaseName = name[0].toLowerCase() + name.slice(1);
        // convert snake_case
        var snakeCaseName = pascalCaseName
            .replace(/([A-Z])/g, "_$1")
            .toLowerCase();
        return "".concat(snakeCaseName);
    };
    GenerateDart.prototype.generateClass = function (name, json) {
        var _this = this;
        var _a = this.options, serializable = _a.serializable, final = _a.final, required = _a.required;
        var currentCode = "class ".concat(name, " {\n");
        if (serializable) {
            currentCode = "@JsonSerializable(explicitToJson: true)\n".concat(currentCode);
        }
        var result = [];
        // 根据类型排序，复杂类型放在后面
        var keys = Object.keys(json).sort(function (a) {
            var typeA = typeof json[a];
            // const typeB = typeof json[b];
            if (typeA === "object") {
                return 1;
            }
            return -1;
        });
        keys.forEach(function (key) {
            var element = json[key];
            var type = _this.generateType(element);
            if (["Map", "List"].includes(type)) {
                var childClassName = _this.generateName("".concat(name, "_").concat(key), true);
                var childElement = element;
                if (type === "List") {
                    childElement = element[0];
                    type = "".concat(type, "<").concat(childClassName, ">");
                }
                else if (type === "Map") {
                    childElement = element;
                    type = childClassName;
                }
                var classResult = _this.generateClass(childClassName, childElement || {});
                result.push.apply(result, classResult);
            }
            var keyCode = "\n  ".concat(final ? "final " : "").concat(type).concat(!required ? "?" : "", " ").concat(_this.generateName(key), ";\n");
            if (serializable) {
                keyCode = "\n  @JsonKey(name: '".concat(key, "')").concat(keyCode);
            }
            currentCode += keyCode;
        });
        // 生成构造函数
        if (keys.length) {
            currentCode += "\n  ".concat(name, "({\n");
            currentCode += keys
                .map(function (key) { return "    this.".concat(_this.generateName(key), ",\n"); })
                .join("");
            currentCode += "  });\n";
        }
        else {
            currentCode += "\n  ".concat(name, "();\n");
        }
        // 生成fromJson方法
        currentCode += "\n  factory ".concat(name, ".fromJson(Map<String, dynamic> json) => _$").concat(name, "FromJson(json);\n");
        // 生成toJson方法
        currentCode += "\n  Map<String, dynamic> toJson() => _$".concat(name, "ToJson(this);\n");
        // 生成toString方法
        currentCode += "\n  @override\n  String toString() => toJson().toString();\n";
        currentCode += "\n}";
        result.unshift(currentCode);
        return result;
    };
    GenerateDart.prototype.generate = function (jsonCode) {
        var name = this.options.name;
        var json = JSON.parse(jsonCode);
        if (typeof json !== "object") {
            throw new Error("JSON must be an object");
        }
        if (Array.isArray(json)) {
            json = json[0];
        }
        var fileName = this.generateFileName();
        var resultClass = this.generateClass(name || "Root", json);
        var resultClassCode = resultClass.join("\n\n\n");
        var headerImportCode = "import 'package:json_annotation/json_annotation.dart';\n\n";
        var headerGeneratedCode = "part '".concat(fileName, ".g.dart';\n\n\n");
        return {
            code: headerImportCode + headerGeneratedCode + resultClassCode,
            fileName: fileName,
        };
    };
    return GenerateDart;
}());
exports.GenerateDart = GenerateDart;
