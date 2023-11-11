<template>
  <div class="app flex h-screen flex-col py-0 bg-slate-600">
    <!-- 头部配置 -->
    <div class="app-header">
      <!-- title -->
      <h1 class="text-center text-slate-200 mt-8 pb-4 font-bold text-2xl">
        JSON To Dart
      </h1>
    </div>
    <div class="app-main flex-1 flex gap-4 p-4 max-lg:px-8 mx-auto xl: xl:w-full 2xl:w-4/5">
      <!-- 左右textarea -->
      <div class="flex-1 h-full overflow-hidden">
        <div class="flex justify-between items-center bg-black rounded-md mb-2 px-4 h-10">
          <div></div>

          <div
            class="text-slate-400 text-xs select-none cursor-pointer px-2 py-1 rounded-md hover:text-slate-300 hover:bg-slate-800 transition-all">
            CLEAR
          </div>
        </div>

        <codemirror v-model="code" placeholder="Code goes here..." :style="{ height: '100%' }" :autofocus="false"
          :indent-with-tab="true" :tab-size="2" :extensions="extensions" @ready="handleReady"
          @change="log('change', $event)" @focus="log('focus', $event)" @blur="log('blur', $event)" />
      </div>
      <div class="flex-1 h-full overflow-hidden">
        <div class="flex justify-between items-center bg-black rounded-md mb-2 px-3 select-none relative h-10">
          <!-- config -->
          <div class="flex items-center gap-4">
            <input v-model="setting.name" type="text" placeholder="Root类名"
              class="bg-transparent border border-slate-500 text-xs rounded-md px-2 py-1 text-slate-300 outline-none" />
            <span class="text-red-500 text-sm select-text"> {{ genFileName || 'root' }}.dart</span>
          </div>
          <div v-if="showSetting"
            class="flex items-center bg-slate-800 p-4 shadow-md shadow-slate-850 rounded-md absolute top-11 right-2 z-10"
            @click.stop.capture>
            <!-- serializable -->
            <label class="inline-flex items-center">
              <input type="checkbox" class="form-checkbox" v-model="setting.serializable" />
              <span class="ml-2 text-slate-400 text-xs">serializable</span>
            </label>
            <!-- final -->
            <label class="inline-flex items-center ml-4">
              <input type="checkbox" class="form-checkbox" v-model="setting.final" />
              <span class="ml-2 text-slate-400 text-xs">final</span>
            </label>
            <!-- camelCase -->
            <label class="inline-flex items-center ml-4">
              <input type="checkbox" class="form-checkbox" v-model="setting.camelCase" />
              <span class="ml-2 text-slate-400 text-xs">camelCase</span>
            </label>
            <label class="inline-flex items-center ml-4">
              <input type="checkbox" class="form-checkbox" v-model="setting.required" />
              <span class="ml-2 text-slate-400 text-xs">required</span>
            </label>
          </div>
          <!-- copy -->
          <div class="flex items-center gap-4">
            <div
              class="text-slate-400 text-xs select-none cursor-pointer px-2 py-1 rounded-md hover:text-slate-300 hover:bg-slate-800 transition-all"
              @click.stop.capture="handleOpenSetting">
              SETTING
            </div>
            <div
              class="text-slate-400 text-xs select-none cursor-pointer px-2 py-1 rounded-md hover:text-slate-300 hover:bg-slate-800 transition-all"
              @click="handleCopyCode">
              COPY
            </div>
          </div>
        </div>

        <codemirror v-model="resultCode" disabled placeholder="Code goes here..." :style="{ height: '100%' }"
          class="rounded-md" :autofocus="false" :indent-with-tab="true" :tab-size="2" :extensions="extensions"
          @ready="handleReady" @change="log('change', $event)" @focus="log('focus', $event)"
          @blur="log('blur', $event)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, shallowRef, watch } from "vue";
import { Codemirror } from "vue-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { StreamLanguage } from "@codemirror/language";
import { dart } from "@codemirror/legacy-modes/mode/clike";
import { json } from "@codemirror/legacy-modes/mode/javascript";
import { GenerateDart } from "./lib/generate";
import { EditorView } from "codemirror";

const log = console.log;

let settingCache = null;

try {
  settingCache = JSON.parse(localStorage.getItem('setting') || 'null');
} catch (error) {
  console.log("error", error);
}

const setting = reactive(settingCache || {
  serializable: true,
  final: true,
  camelCase: true,
  required: false,

  name: "",
});

watch(setting, () => {
  // save
  localStorage.setItem("setting", JSON.stringify(setting));
});

const extensions = [
  oneDark,
  StreamLanguage.define(dart),
  StreamLanguage.define(json),
  EditorView.lineWrapping,
];
const code = ref(
  '{\n  "status": 0,\n "n": null,\n  "message": "query ok",\n  "testArr": [],\n  "request_id": "fb818b22-5f56-47a3-bebb-93afa43d31c9",\n  "result": {\n    "location": {\n      "lat": 39.984154,\n      "lng": 116.30749\n    },\n    "address": "北京市海淀区北四环西路66号",\n    "formatted_addresses": {\n      "recommend": "海淀区中关村中国技术交易大厦(彩和坊路西)",\n      "rough": "海淀区中关村中国技术交易大厦(彩和坊路西)",\n      "standard_address": "北京市海淀区北四环西路66号"\n    },\n    "address_component": {\n      "nation": "中国",\n      "province": "北京市",\n      "city": "北京市",\n      "district": "海淀区",\n      "street": "北四环西路",\n      "street_number": "北四环西路66号"\n    },\n    "ad_info": {\n      "nation_code": "156",\n      "adcode": "110108",\n      "phone_area_code": "010",\n      "city_code": "156110000",\n      "name": "中国,北京市,北京市,海淀区",\n      "location": {\n        "lat": 39.959893,\n        "lng": 116.2977\n      },\n      "nation": "中国",\n      "province": "北京市",\n      "city": "北京市",\n      "district": "海淀区"\n    },\n    "address_reference": {\n      "business_area": {\n        "id": "14178584199053362783",\n        "title": "中关村",\n        "location": {\n          "lat": 39.9806,\n          "lng": 116.311\n        },\n        "_distance": 0,\n        "_dir_desc": "内"\n      },\n      "famous_area": {\n        "id": "14178584199053362783",\n        "title": "中关村",\n        "location": {\n          "lat": 39.9806,\n          "lng": 116.311\n        },\n        "_distance": 0,\n        "_dir_desc": "内"\n      },\n      "crossroad": {\n        "id": "529961",\n        "title": "彩和坊路/海淀北一街(路口)",\n        "location": {\n          "lat": 39.98395,\n          "lng": 116.30823\n        },\n        "_distance": 61.5,\n        "_dir_desc": "西"\n      },\n      "town": {\n        "id": "110108012",\n        "title": "海淀街道",\n        "location": {\n          "lat": 39.975116,\n          "lng": 116.313581\n        },\n        "_distance": 0,\n        "_dir_desc": "内"\n      },\n      "street_number": {\n        "id": "595672509379194165901290",\n        "title": "北四环西路66号",\n        "location": {\n          "lat": 39.98409,\n          "lng": 116.30804\n        },\n        "_distance": 47.4,\n        "_dir_desc": "西"\n      },\n      "street": {\n        "id": "9217092216709107946",\n        "title": "彩和坊路",\n        "location": {\n          "lat": 39.9804,\n          "lng": 116.308311\n        },\n        "_distance": 46.3,\n        "_dir_desc": "西"\n      },\n      "landmark_l2": {\n        "id": "3629720141162880123",\n        "title": "中国技术交易大厦",\n        "location": {\n          "lat": 39.984253,\n          "lng": 116.307472\n        },\n        "_distance": 0,\n        "_dir_desc": "内"\n      }\n    },\n    "poi_count": 10,\n    "pois": [\n      {\n        "id": "3629720141162880123",\n        "title": "中国技术交易大厦",\n        "address": "北京市海淀区北四环西路66号",\n        "category": "房产小区:商务楼宇",\n        "location": {\n          "lat": 39.984253,\n          "lng": 116.307472\n        },\n        "ad_info": {\n          "adcode": "110108",\n          "province": "",\n          "city": "北京市",\n          "district": "海淀区"\n        },\n        "_distance": 0,\n        "_dir_desc": "内"\n      },\n      {\n        "id": "9969038414753335812",\n        "title": "腾讯科技(北京)有限公司(中国技术交易大厦)",\n        "address": "北京市海淀区北四环西路66号中国技术交易大厦B座18层D18217",\n        "category": "公司企业:公司企业",\n        "location": {\n          "lat": 39.98413,\n          "lng": 116.3075\n        },\n        "ad_info": {\n          "adcode": "110108",\n          "province": "",\n          "city": "北京市",\n          "district": "海淀区"\n        },\n        "_distance": 2.8\n      },\n      {\n        "id": "3724888736111897241",\n        "title": "万学教育集团",\n        "address": "北京市海淀区北三环西路66号中国技术交易大厦17层",\n        "category": "公司企业:公司企业",\n        "location": {\n          "lat": 39.984084,\n          "lng": 116.307424\n        },\n        "ad_info": {\n          "adcode": "110108",\n          "province": "",\n          "city": "北京市",\n          "district": "海淀区"\n        },\n        "_distance": 9.6\n      },\n      {\n        "id": "404948428189199472",\n        "title": "国家知识产权局专利局北京代办处",\n        "address": "北京市海淀区北四环西路66号中国技术交易大厦2层中国(北京)知识产权保护中心大厅",\n        "category": "机构团体:政府机关",\n        "location": {\n          "lat": 39.984178,\n          "lng": 116.307517\n        },\n        "ad_info": {\n          "adcode": "110108",\n          "province": "",\n          "city": "北京市",\n          "district": "海淀区"\n        },\n        "_distance": 3.5\n      },\n      {\n        "id": "8553338688660412261",\n        "title": "北京中技所知识产权服务有限公司",\n        "address": "北京市海淀区北四环西路66号中国技术交易大厦B座1519室",\n        "category": "公司企业:公司企业",\n        "location": {\n          "lat": 39.984109,\n          "lng": 116.307436\n        },\n        "ad_info": {\n          "adcode": "110108",\n          "province": "",\n          "city": "北京市",\n          "district": "海淀区"\n        },\n        "_distance": 6.8\n      },\n      {\n        "id": "17466448585349227463",\n        "title": "滕州市张汪镇苏河涯村文哲制衣厂",\n        "address": "北京市海淀区张汪镇苏河涯村文哲制衣厂",\n        "category": "公司企业:企业/工厂",\n        "location": {\n          "lat": 39.984185,\n          "lng": 116.307503\n        },\n        "ad_info": {\n          "adcode": "110108",\n          "province": "",\n          "city": "北京市",\n          "district": "海淀区"\n        },\n        "_distance": 3.6\n      },\n      {\n        "id": "3270455285456994684",\n        "title": "消防器材",\n        "address": "北京市海淀区惠工路生产资料市场13栋15号",\n        "category": "公司企业:其它公司企业",\n        "location": {\n          "lat": 39.984185,\n          "lng": 116.307503\n        },\n        "ad_info": {\n          "adcode": "110108",\n          "province": "",\n          "city": "北京市",\n          "district": "海淀区"\n        },\n        "_distance": 3.6\n      },\n      {\n        "id": "18055517301577378725",\n        "title": "卡凡美容美发沙龙",\n        "address": "北京市海淀区彩和坊路与海淀北一街交叉口西60米",\n        "category": "生活服务:美容美发:美发",\n        "location": {\n          "lat": 39.984185,\n          "lng": 116.307503\n        },\n        "ad_info": {\n          "adcode": "110108",\n          "province": "",\n          "city": "北京市",\n          "district": "海淀区"\n        },\n        "_distance": 3.6\n      },\n      {\n        "id": "4873532092691531725",\n        "title": "文文商店",\n        "address": "北京市海淀区北四环西路66号中国技术交易大厦b座",\n        "category": "购物:便利店",\n        "location": {\n          "lat": 39.984207,\n          "lng": 116.30755\n        },\n        "ad_info": {\n          "adcode": "110108",\n          "province": "",\n          "city": "北京市",\n          "district": "海淀区"\n        },\n        "_distance": 7.8\n      },\n      {\n        "id": "11760548235446732369",\n        "title": "中国技术交易大厦F7邮件中心",\n        "address": "北京市海淀区北四环西路66号中国技术交易大厦",\n        "category": "生活服务:邮局速递:邮局",\n        "location": {\n          "lat": 39.984083,\n          "lng": 116.307544\n        },\n        "ad_info": {\n          "adcode": "110108",\n          "province": "",\n          "city": "北京市",\n          "district": "海淀区"\n        },\n        "_distance": 9.1\n      }\n    ]\n  }\n}'
);
const result = computed(() => {
  try {
    const result = new GenerateDart({
      serializable: setting.serializable,
      final: setting.final,
      camelCase: setting.camelCase,
      required: setting.required,
      name: setting.name,
    }).generate(code.value);

    return result;
  } catch (error) {
    console.log("error", error);
    return null;
  }
});

const resultCode = computed(() => {
  return result.value?.code || "";
});

const genFileName = computed(() => {
  return result.value?.fileName || "";
});

const view = shallowRef();
const handleReady = (payload: any) => {
  view.value = payload.view;
};

const showSetting = ref(false);
const handleOpenSetting = () => {
  showSetting.value = !showSetting.value;
};
document.addEventListener("click", () => {
  if (showSetting.value) {
    showSetting.value = false;
  }
});

const toast = (message: string) => {
  const toast = document.createElement("div");
  toast.classList.add("fixed", "top-0", "left-0", "right-0", "bottom-0", "flex", "justify-center", "items-center");
  toast.innerHTML = `<div class="bg-slate-800 text-slate-200 px-4 py-2 rounded-md animate-ping">${message}</div>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 800);
}

const handleCopyCode = () => {
  const input = document.createElement("textarea");
  input.value = resultCode.value;
  document.body.appendChild(input);
  input.select();
  // “document.execCommand”的签名“(commandId: string, showUI?: boolean | undefined, value?: string | undefined): boolean”已弃用。ts(6387)
  document.execCommand("Copy");
  navigator.clipboard.writeText(resultCode.value);
  document.body.removeChild(input);

  // toast
  toast("Copied");
};
</script>

<style lang="scss">
.app-main {
  display: flex;
  align-items: center;
  justify-content: space-around;
  overflow: hidden;

  .cm-editor {
    background-color: #090300;
    overflow: hidden;
    padding: 12px;
    border-radius: 6px;
    height: calc(100% - 54px);

    &.cm-focused {
      outline: none;
    }

    // .cm-scroller {
    // }

    .cm-gutters {
      display: none;
    }
  }
}
</style>
