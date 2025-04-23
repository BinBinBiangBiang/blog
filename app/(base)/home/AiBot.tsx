'use client';
import { useEffect } from 'react';

export function AiBot() {
  useEffect(() => {
    // 动态加载脚本
    const loadSdk = async () => {
      await loadScript('https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.6/libs/cn/index.js');
      new (window as any).CozeWebSDK.WebChatClient({
        config: {
            bot_id: '7496365408627523635',
            isIframe: false,
        },
        componentProps: {
            title: '可可',
        },
        auth: {
            type: 'token',
            token: 'pat_i61x7E0wqEjKoCk5u8DbCbtlSI56X5sSOc7AaeyEhRG3afaL2Z4UROQZ8cRhH0It',
            onRefreshToken: function () {
                return 'pat_i61x7E0wqEjKoCk5u8DbCbtlSI56X5sSOc7AaeyEhRG3afaL2Z4UROQZ8cRhH0It'
            }
        }
      });
    };
    loadSdk();
  }, []);

  return <div id="coze-chat-container" />;
}

// 动态加载JS的工具函数
function loadScript(src: string) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}