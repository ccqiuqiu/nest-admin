import { defineConfig } from '@vben/vite-config';

import AutoImport from 'unplugin-auto-import/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Icons from 'unplugin-icons/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      plugins: [
        AutoImport({
          dts: './types/auto-imports.d.ts', // 生成类型声明文件
          imports: ['vue', 'vue-router', 'pinia'],
          vueTemplate: true, // 支持在模板中直接使用 API
        }),
        Icons({
          autoInstall: true,
          compiler: 'vue3',
          defaultClass: 'inline-block',
          scale: 1,
        }),
        Components({
          dirs: ['node_modules/@vben/common-ui/src/components/page'],
          dts: './types/components.d.ts', // 输出类型文件
          resolvers: [
            AntDesignVueResolver({
              importStyle: false, // css in js
            }),
            IconsResolver({
              prefix: 'icon', // <IconMaterialSymbols3dRounded/>
            }),
          ],
        }),
      ] as any[],
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, '/api'),
            // mock代理目标地址
            target: 'http://localhost:8080',
            ws: true,
          },
          '/profile/': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/profile/, '/profile'),
            // mock代理目标地址
            target: 'http://localhost:8080',
            ws: true,
          },
        },
      },
    },
  };
}) as any;
