"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  // Portal 需要在客户端挂载后才能使用
  useEffect(() => {
    setMounted(true);
  }, []);

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

  /* ── 抽屉面板内容（通过 Portal 渲染到 body，脱离 Header 层叠上下文） ── */
  const drawerContent = isOpen ? (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 99999 }}
    >
      {/* 遮罩层 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
        onClick={() => setIsOpen(false)}
      />

      {/* 抽屉面板 */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "100%",
          maxWidth: "384px",
          display: "flex",
          flexDirection: "column",
          background: "var(--surface-1, #0f1117)",
          borderLeft: "1px solid var(--line-2, rgba(255,255,255,0.08))",
          boxShadow: "-8px 0 30px rgba(0,0,0,0.5)",
        }}
      >
        {/* 头部 */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--line-1, rgba(255,255,255,0.06))",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                display: "grid",
                placeItems: "center",
                width: "36px",
                height: "36px",
                borderRadius: "12px",
                border: "1px solid var(--line-2, rgba(255,255,255,0.08))",
                background: "var(--surface-2, #1a1d27)",
                color: "#a3e635",
              }}
            >
              <Sparkles style={{ width: 16, height: 16 }} />
            </span>
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1, #f0f0f0)", margin: 0 }}>
                AI 大模型配置
              </h3>
              <p style={{ fontSize: "11px", color: "var(--text-3, #6b7280)", margin: "2px 0 0 0" }}>
                配置专属 API 密钥或使用系统默认
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              padding: "6px",
              borderRadius: "8px",
              border: "none",
              background: "transparent",
              color: "var(--text-3, #6b7280)",
              cursor: "pointer",
            }}
            title="关闭 (Esc)"
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* 内容区 - 可滚动 */}
        <form
          id="ai-settings-drawer-form"
          onSubmit={handleSave}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            overscrollBehavior: "contain",
          }}
        >
          {/* API Key */}
          <div
            style={{
              borderRadius: "12px",
              padding: "16px",
              border: "1px solid var(--line-2, rgba(255,255,255,0.08))",
              background: "var(--surface-2, #1a1d27)",
            }}
          >
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", fontWeight: 600 }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#a3e635" }}>
                <Key style={{ width: 16, height: 16 }} />
                API Key（大模型密钥）
              </span>
              <span style={{ fontSize: "10px", fontWeight: 400, color: "var(--text-3, #6b7280)" }}>
                留空走系统 DeepSeek
              </span>
            </label>
            <div style={{ position: "relative", marginTop: "10px" }}>
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="在此输入您的 API Key（如 sk-...）"
                autoFocus
                className="input"
                style={{
                  width: "100%",
                  paddingRight: "40px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  height: "40px",
                  borderColor: "var(--line-3, rgba(255,255,255,0.12))",
                  background: "var(--surface-1, #0f1117)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "4px",
                  border: "none",
                  background: "transparent",
                  color: "var(--text-3, #6b7280)",
                  cursor: "pointer",
                }}
                title={showKey ? "隐藏密钥" : "显示密钥"}
              >
                {showKey ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          {/* 快捷预设 */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-3, #6b7280)" }}>
              <Zap style={{ width: 12, height: 12, color: "#fbbf24" }} />
              一键填入常用预设
            </label>
            <div style={{ marginTop: "8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {(Object.keys(DEFAULT_PRESETS) as Array<keyof typeof DEFAULT_PRESETS>).map(
                (key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleApplyPreset(key)}
                    style={{
                      borderRadius: "8px",
                      padding: "8px",
                      textAlign: "left",
                      fontSize: "12px",
                      border: "1px solid var(--line-1, rgba(255,255,255,0.06))",
                      background: "var(--surface-2, #1a1d27)",
                      color: "var(--text-2, #c0c0c0)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 500, fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{DEFAULT_PRESETS[key].label}</div>
                    <div style={{ fontSize: "10px", fontFamily: "monospace", marginTop: "2px", color: "var(--text-3, #6b7280)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {DEFAULT_PRESETS[key].model}
                    </div>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Base URL */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 500, color: "var(--text-2, #c0c0c0)" }}>
              <Globe style={{ width: 14, height: 14, color: "var(--text-3, #6b7280)" }} />
              API Base URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.deepseek.com"
              className="input"
              style={{ marginTop: "6px", width: "100%", fontFamily: "monospace", fontSize: "12px", height: "36px" }}
            />
          </div>

          {/* Model */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 500, color: "var(--text-2, #c0c0c0)" }}>
              <Cpu style={{ width: 14, height: 14, color: "var(--text-3, #6b7280)" }} />
              Model（模型名称）
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="deepseek-chat 或 gpt-4o-mini"
              className="input"
              style={{ marginTop: "6px", width: "100%", fontFamily: "monospace", fontSize: "12px", height: "36px" }}
            />
          </div>

          {/* 当前状态 */}
          <div
            style={{
              borderRadius: "12px",
              padding: "12px",
              fontSize: "12px",
              lineHeight: 1.6,
              border: "1px solid var(--line-1, rgba(255,255,255,0.06))",
              background: "var(--surface-2, #1a1d27)",
              color: "var(--text-3, #6b7280)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 500, color: "var(--text-2, #c0c0c0)" }}>
              {hasCustomKey ? (
                <>
                  <CheckCircle2 style={{ width: 16, height: 16, flexShrink: 0, color: "#a3e635" }} />
                  <span>已启用自定义专属 API 密钥</span>
                </>
              ) : (
                <>
                  <Sparkles style={{ width: 16, height: 16, flexShrink: 0, color: "#818cf8" }} />
                  <span>使用系统内置 DeepSeek 官方接口</span>
                </>
              )}
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: "11px", lineHeight: 1.5 }}>
              密钥仅存于当前浏览器 LocalStorage，不会上传服务器。
            </p>
          </div>
        </form>

        {/* 底部操作栏 */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            borderTop: "1px solid var(--line-1, rgba(255,255,255,0.06))",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !apiKey.trim()}
              className="btn btn-secondary btn-sm"
              style={{ height: "32px", padding: "0 12px", fontSize: "12px" }}
            >
              {testing ? (
                <Loader2 style={{ width: 14, height: 14, marginRight: 4 }} className="animate-spin" />
              ) : (
                <Zap style={{ width: 14, height: 14, marginRight: 4, color: "#fbbf24" }} />
              )}
              {testing ? "测试中..." : "测试连接"}
            </button>
            {hasCustomKey && (
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-ghost btn-sm"
                style={{ height: "32px", padding: "0 10px", fontSize: "12px", color: "var(--text-3, #6b7280)" }}
                title="清空自定义配置，恢复系统默认"
              >
                <RotateCcw style={{ width: 12, height: 12, marginRight: 4 }} />
                恢复默认
              </button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost btn-sm"
              style={{ height: "32px", padding: "0 12px", fontSize: "12px" }}
            >
              取消
            </button>
            <button
              type="submit"
              form="ai-settings-drawer-form"
              className="btn btn-primary btn-sm"
              style={{ height: "32px", padding: "0 16px", fontSize: "12px", fontWeight: 500 }}
            >
              保存生效
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* 触发按钮 —— 留在 Header 内 */}
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

      {/* 通过 Portal 将抽屉渲染到 document.body，彻底脱离 Header 的 z-index 层叠上下文 */}
      {mounted && drawerContent && createPortal(drawerContent, document.body)}
    </>
  );
}
