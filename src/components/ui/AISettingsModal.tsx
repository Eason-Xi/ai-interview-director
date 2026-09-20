"use client";

import { useEffect, useState } from "react";
import {
  Settings2,
  X,
  Key,
  Globe,
  Cpu,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import clsx from "clsx";
import {
  getAISettings,
  saveAISettings,
  clearAISettings,
  DEFAULT_PRESETS,
  SETTINGS_CHANGE_EVENT,
  type AISettings,
} from "@/lib/client-settings";
import { toast } from "@/components/ui/Feedback";

export default function AISettingsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [hasCustomKey, setHasCustomKey] = useState(false);

  const loadSettings = () => {
    const s = getAISettings();
    setApiKey(s.apiKey);
    setBaseUrl(s.baseUrl);
    setModel(s.model);
    setHasCustomKey(Boolean(s.apiKey));
  };

  useEffect(() => {
    loadSettings();
    const handleSync = () => loadSettings();
    window.addEventListener(SETTINGS_CHANGE_EVENT, handleSync);
    return () => window.removeEventListener(SETTINGS_CHANGE_EVENT, handleSync);
  }, []);

  // ESC 键关闭
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // 打开时锁定 body 滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleApplyPreset = (presetKey: keyof typeof DEFAULT_PRESETS) => {
    const p = DEFAULT_PRESETS[presetKey];
    setBaseUrl(p.baseUrl);
    setModel(p.model);
    toast.info(`已应用 ${p.label} 模板`, "已自动填入 Base URL 和 Model，请在上方填入您的 Key 即可。");
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveAISettings({
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim(),
      model: model.trim(),
    });
    setHasCustomKey(Boolean(apiKey.trim()));
    toast.success(
      "AI 配置已保存",
      apiKey.trim()
        ? "已成功切换至您的专属自定义大模型"
        : "已恢复为服务端系统默认 DeepSeek 官方服务"
    );
    setIsOpen(false);
  };

  const handleReset = () => {
    clearAISettings();
    setApiKey("");
    setBaseUrl("");
    setModel("");
    setHasCustomKey(false);
    toast.info("已重置", "已恢复为服务端系统内置的官方 DeepSeek 服务。");
    setIsOpen(false);
  };

  const handleTestConnection = async () => {
    const targetKey = apiKey.trim();
    if (!targetKey) {
      toast.error("未输入 API Key", "请先输入 API Key 再进行连通性测试。");
      return;
    }
    const targetBaseUrl = baseUrl.trim() || "https://api.openai.com/v1";
    const targetModel = model.trim() || "deepseek-chat";

    setTesting(true);
    try {
      const cleanUrl = targetBaseUrl.replace(/\/+$/, "");
      const startTime = performance.now();
      const res = await fetch(`${cleanUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${targetKey}`,
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 5,
        }),
      });

      const elapsed = Math.round(performance.now() - startTime);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`[${res.status}] ${errText.slice(0, 100)}`);
      }
      toast.success("连接测试成功！", `模型 ${targetModel} 响应正常，耗时 ${elapsed}ms`);
    } catch (e: any) {
      toast.error("测试失败", e.message || "无法连接到该 AI 接口，请检查 URL 和 Key 是否有效");
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      {/* 触发按钮 */}
      <button
        onClick={() => {
          loadSettings();
          setIsOpen(true);
        }}
        className={clsx(
          "relative flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition-all duration-200",
          hasCustomKey
            ? "border-lime-500/40 bg-lime-500/10 text-lime-400 hover:bg-lime-500/20"
            : "border-line-2 bg-surface-2 text-2 hover:border-line-3 hover:text-1"
        )}
        title="配置自定义大模型 API"
      >
        <Settings2 className="h-4 w-4" />
        <span className="hidden sm:inline">
          {hasCustomKey ? "自定义 AI" : "AI 设置"}
        </span>
        {hasCustomKey ? (
          <span className="h-1.5 w-1.5 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(201,255,99,0.8)]" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
        )}
      </button>

      {/* 右侧抽屉 Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex">
          {/* 遮罩层 - 点击关闭 */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* 抽屉面板 - 从右侧弹出，固定宽度，全屏高度 */}
          <div
            className="absolute right-0 top-0 h-full w-full max-w-sm flex flex-col shadow-2xl"
            style={{
              background: "var(--surface-1, #0f1117)",
              borderLeft: "1px solid var(--line-2, rgba(255,255,255,0.08))",
            }}
          >
            {/* 头部 - 固定 */}
            <div
              className="shrink-0 flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid var(--line-1, rgba(255,255,255,0.06))" }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                  style={{
                    border: "1px solid var(--line-2, rgba(255,255,255,0.08))",
                    background: "var(--surface-2, #1a1d27)",
                    color: "#a3e635",
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight" style={{ color: "var(--text-1, #f0f0f0)" }}>
                    AI 大模型配置
                  </h3>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3, #6b7280)" }}>
                    配置专属 API 密钥或使用系统默认
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 transition-colors hover:opacity-70"
                style={{ color: "var(--text-3, #6b7280)" }}
                title="关闭 (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 内容区 - 可滚动 */}
            <form
              id="ai-settings-drawer-form"
              onSubmit={handleSave}
              className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
              style={{ overscrollBehavior: "contain" }}
            >
              {/* API Key 输入框 */}
              <div
                className="rounded-xl p-4"
                style={{
                  border: "1px solid var(--line-2, rgba(255,255,255,0.08))",
                  background: "var(--surface-2, #1a1d27)",
                }}
              >
                <label className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5" style={{ color: "#a3e635" }}>
                    <Key className="h-4 w-4" />
                    API Key（大模型密钥）
                  </span>
                  <span className="text-[10px] font-normal" style={{ color: "var(--text-3, #6b7280)" }}>
                    留空走系统 DeepSeek
                  </span>
                </label>
                <div className="relative mt-2.5">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="在此输入您的 API Key（如 sk-...）"
                    autoFocus
                    className="input w-full pr-10 font-mono text-xs h-10"
                    style={{
                      borderColor: "var(--line-3, rgba(255,255,255,0.12))",
                      background: "var(--surface-1, #0f1117)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 transition-opacity hover:opacity-70"
                    style={{ color: "var(--text-3, #6b7280)" }}
                    title={showKey ? "隐藏密钥" : "显示密钥"}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* 快捷预设 */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-3, #6b7280)" }}>
                  <Zap className="h-3 w-3" style={{ color: "#fbbf24" }} />
                  一键填入常用预设
                </label>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {(Object.keys(DEFAULT_PRESETS) as Array<keyof typeof DEFAULT_PRESETS>).map(
                    (key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleApplyPreset(key)}
                        className="rounded-lg p-2 text-left text-xs transition-all hover:opacity-80"
                        style={{
                          border: "1px solid var(--line-1, rgba(255,255,255,0.06))",
                          background: "var(--surface-2, #1a1d27)",
                          color: "var(--text-2, #c0c0c0)",
                        }}
                      >
                        <div className="font-medium text-[11px] truncate">{DEFAULT_PRESETS[key].label}</div>
                        <div className="text-[10px] truncate font-mono mt-0.5" style={{ color: "var(--text-3, #6b7280)" }}>
                          {DEFAULT_PRESETS[key].model}
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Base URL */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--text-2, #c0c0c0)" }}>
                  <Globe className="h-3.5 w-3.5" style={{ color: "var(--text-3, #6b7280)" }} />
                  API Base URL
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.deepseek.com"
                  className="input mt-1.5 w-full font-mono text-xs h-9"
                />
              </div>

              {/* Model */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--text-2, #c0c0c0)" }}>
                  <Cpu className="h-3.5 w-3.5" style={{ color: "var(--text-3, #6b7280)" }} />
                  Model（模型名称）
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="deepseek-chat 或 gpt-4o-mini"
                  className="input mt-1.5 w-full font-mono text-xs h-9"
                />
              </div>

              {/* 当前状态提示 */}
              <div
                className="rounded-xl p-3 text-xs leading-relaxed"
                style={{
                  border: "1px solid var(--line-1, rgba(255,255,255,0.06))",
                  background: "var(--surface-2, #1a1d27)",
                  color: "var(--text-3, #6b7280)",
                }}
              >
                <div className="flex items-center gap-2 font-medium" style={{ color: "var(--text-2, #c0c0c0)" }}>
                  {hasCustomKey ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#a3e635" }} />
                      <span>已启用自定义专属 API 密钥</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 shrink-0" style={{ color: "#818cf8" }} />
                      <span>使用系统内置 DeepSeek 官方接口</span>
                    </>
                  )}
                </div>
                <p className="mt-1 text-[11px] leading-normal">
                  密钥仅存于当前浏览器 LocalStorage，不会上传服务器。
                </p>
              </div>
            </form>

            {/* 底部操作栏 - 固定吸底 */}
            <div
              className="shrink-0 flex items-center justify-between px-5 py-3"
              style={{ borderTop: "1px solid var(--line-1, rgba(255,255,255,0.06))" }}
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing || !apiKey.trim()}
                  className="btn btn-secondary btn-sm h-8 px-3 text-xs"
                >
                  {testing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  ) : (
                    <Zap className="h-3.5 w-3.5 mr-1" style={{ color: "#fbbf24" }} />
                  )}
                  {testing ? "测试中..." : "测试连接"}
                </button>
                {hasCustomKey && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn btn-ghost btn-sm h-8 px-2.5 text-xs"
                    style={{ color: "var(--text-3, #6b7280)" }}
                    title="清空自定义配置，恢复系统默认"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    恢复默认
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn btn-ghost btn-sm h-8 px-3 text-xs"
                >
                  取消
                </button>
                <button
                  type="submit"
                  form="ai-settings-drawer-form"
                  className="btn btn-primary btn-sm h-8 px-4 text-xs font-medium"
                >
                  保存生效
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
