# JSON to Dart

地址：[https://json2dart.vercel.app/](https://json2dart.vercel.app/)

项目参考 [json2dart](https://github.com/caijinglong/json2dart) 进行优化。

## 优化内容
1. 界面
2. 更多配置项
3. 构造函数可选
4. 增加toString

## 生成内容参考
```dart
import 'package:json_annotation/json_annotation.dart';

part 'bucai_test_user_info_join.g.dart';


@JsonSerializable(explicitToJson: true)
class BucaiTestUserInfoJoin {

  @JsonKey(name: 'request_id')
  final String? requestId;

  @JsonKey(name: 'message')
  final String? message;

  @JsonKey(name: 'status')
  final int? status;

  @JsonKey(name: 'n')
  final dynamic? n;

  @JsonKey(name: 'testArr')
  final List<BucaiTestUserInfoJoinTestArr>? testArr;

  @JsonKey(name: 'result')
  final BucaiTestUserInfoJoinResult? result;

  BucaiTestUserInfoJoin({
    this.requestId,
    this.message,
    this.status,
    this.n,
    this.testArr,
    this.result,
  });

  factory BucaiTestUserInfoJoin.fromJson(Map<String, dynamic> json) => _$BucaiTestUserInfoJoinFromJson(json);

  Map<String, dynamic> toJson() => _$BucaiTestUserInfoJoinToJson(this);

  @override
  String toString() => toJson().toString();

}
```


## 如何开发

1. 下载项目
2. npm install
3. npm run dev
