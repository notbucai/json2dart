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
            class="text-slate-400 text-xs select-none cursor-pointer px-2 py-1 rounded-md hover:text-slate-300 hover:bg-slate-800 transition-all"
            @click="handleClearCode">
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
const code = ref('');
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

const handleClearCode = () => {
  code.value = "";
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
