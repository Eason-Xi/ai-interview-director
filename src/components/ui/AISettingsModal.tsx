"use client";

import { useEffect, useState } from "react";
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
  ShieldAlert,
} from "lucide-react";
import clsx from "clsx";
import {
  getAISettings,
  saveAISettings,
  clearAISettings,
  DEFAULT_PRESETS,
  SETTINGS_CHANGE_EVENT,
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

  // ESC 键快捷关闭
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
    toast.info(`已选用 ${p.label} 模板`, "已自动填入 Base URL 和 Model，请填入您的 API Key 即可。");
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
        ? "已切换至您的专属自定义大模型"
        : "已恢复为服务端系统内置 DeepSeek 官方服务"
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

  /* ── 抽屉面板内容（100% 纯黑实体背板 + 超高对比度文字） ── */
  const drawerContent = isOpen ? (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      {/* 遮罩层 - 深沉暗黑模糊 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.72)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          transition: "opacity 0.25s ease",
        }}
        onClick={() => setIsOpen(false)}
      />

      {/* 抽屉面板 - 100% 不透明实心纯黑背景，拒绝任何透底 */}
      <div
        className="animate-fade"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "460px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0d1117", // 纯色实心黑曜石底色，绝不透底
          borderLeft: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "-12px 0 45px rgba(0, 0, 0, 0.85)",
          color: "#f1f5f9",
        }}
      >
        {/* 1. 顶部 Header */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            backgroundColor: "#111620", // 稍浅实心纯色
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                display: "grid",
                placeItems: "center",
                width: "38px",
                height: "38px",
                borderRadius: "12px",
                backgroundColor: "rgba(201, 255, 99, 0.12)",
                border: "1px solid rgba(201, 255, 99, 0.28)",
                color: "#c9ff63",
              }}
            >
              <Sparkles style={{ width: 18, height: 18 }} />
            </span>
            <div>
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                AI 大模型接入配置
              </h3>
              <p
                style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  margin: "3px 0 0 0",
                }}
              >
                配置您的专属 API 密钥或使用系统默认
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{
              padding: "8px",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              color: "#94a3b8",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              transition: "all 0.15s ease",
            }}
            title="关闭 (Esc)"
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* 2. 中间表单区域 - 独立滚动 */}
        <form
          id="ai-settings-drawer-form"
          onSubmit={handleSave}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            backgroundColor: "#0d1117",
          }}
        >
          {/* API Key 核心输入区 */}
          <div
            style={{
              borderRadius: "14px",
              padding: "16px 18px",
              backgroundColor: "#141924",
              border: "1px solid rgba(201, 255, 99, 0.25)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.35)",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  color: "#c9ff63",
                }}
              >
                <Key style={{ width: 16, height: 16 }} />
                API Key（大模型密钥）
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 400,
                  color: "#94a3b8",
                }}
              >
                留空走系统 DeepSeek
              </span>
            </label>

            <div style={{ position: "relative", marginTop: "12px" }}>
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="在此粘贴 API Key（如 sk-xxx）"
                autoFocus
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 44px 0 14px",
                  borderRadius: "10px",
                  backgroundColor: "#0b0e14",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  color: "#ffffff",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#c9ff63";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201, 255, 99, 0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.16)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "6px",
                  border: "none",
                  background: "transparent",
                  color: "#94a3b8",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
                title={showKey ? "隐藏密钥" : "显示密钥"}
              >
                {showKey ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          {/* 快捷预设卡片组 */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#94a3b8",
              }}
            >
              <Zap style={{ width: 14, height: 14, color: "#fbbf24" }} />
              一键填入常用大模型预设
            </label>

            <div
              style={{
                marginTop: "10px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
              }}
            >
              {(Object.keys(DEFAULT_PRESETS) as Array<keyof typeof DEFAULT_PRESETS>).map(
                (key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleApplyPreset(key)}
                    style={{
                      borderRadius: "10px",
                      padding: "10px 12px",
                      textAlign: "left",
                      backgroundColor: "#141924",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#1a2130";
                      e.currentTarget.style.borderColor = "rgba(201, 255, 99, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#141924";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#f1f5f9",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {DEFAULT_PRESETS[key].label}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#94a3b8",
                        fontFamily: "var(--font-mono, monospace)",
                        marginTop: "3px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {DEFAULT_PRESETS[key].model}
                    </div>
                  </button>
                )
              )}
            </div>
          </div>

          {/* API Base URL 输入框 */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#cbd5e1",
              }}
            >
              <Globe style={{ width: 14, height: 14, color: "#94a3b8" }} />
              API Base URL（接口根地址）
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.deepseek.com"
              style={{
                marginTop: "8px",
                width: "100%",
                height: "40px",
                padding: "0 14px",
                borderRadius: "10px",
                backgroundColor: "#141924",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "12px",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#c9ff63";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              }}
            />
          </div>

          {/* Model 输入框 */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#cbd5e1",
              }}
            >
              <Cpu style={{ width: 14, height: 14, color: "#94a3b8" }} />
              Model（模型名称）
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="deepseek-chat 或 gpt-4o-mini"
              style={{
                marginTop: "8px",
                width: "100%",
                height: "40px",
                padding: "0 14px",
                borderRadius: "10px",
                backgroundColor: "#141924",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "12px",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#c9ff63";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              }}
            />
          </div>

          {/* 当前状态与安全性提示卡片 */}
          <div
            style={{
              borderRadius: "12px",
              padding: "14px 16px",
              backgroundColor: "#141924",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                fontWeight: 600,
                color: hasCustomKey ? "#c9ff63" : "#818cf8",
              }}
            >
              {hasCustomKey ? (
                <>
                  <CheckCircle2 style={{ width: 16, height: 16, flexShrink: 0 }} />
                  <span>当前状态：已启用自定义专属 API 密钥</span>
                </>
              ) : (
                <>
                  <Sparkles style={{ width: 16, height: 16, flexShrink: 0 }} />
                  <span>当前状态：使用系统内置 DeepSeek 官方服务</span>
                </>
              )}
            </div>
            <p
              style={{
                margin: "6px 0 0 0",
                fontSize: "11px",
                lineHeight: "1.6",
                color: "#94a3b8",
              }}
            >
              密钥严格保存在您浏览器的本地 LocalStorage 中，不会泄露或写入公共代码库。
            </p>
          </div>
        </form>

        {/* 3. 固定吸底操作栏 */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            backgroundColor: "#111620", // 实心不透明底色
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !apiKey.trim()}
              style={{
                height: "36px",
                padding: "0 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#f1f5f9",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                cursor: testing || !apiKey.trim() ? "not-allowed" : "pointer",
                opacity: testing || !apiKey.trim() ? 0.45 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {testing ? (
                <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
              ) : (
                <Zap style={{ width: 14, height: 14, color: "#fbbf24" }} />
              )}
              {testing ? "测试中..." : "测试连接"}
            </button>

            {hasCustomKey && (
              <button
                type="button"
                onClick={handleReset}
                style={{
                  height: "36px",
                  padding: "0 10px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#94a3b8",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
                title="清空自定义配置，恢复系统默认"
              >
                <RotateCcw style={{ width: 12, height: 12 }} />
                恢复默认
              </button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                height: "36px",
                padding: "0 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 500,
                color: "#94a3b8",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              取消
            </button>
            <button
              type="submit"
              form="ai-settings-drawer-form"
              style={{
                height: "36px",
                padding: "0 18px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                backgroundColor: "#c9ff63",
                color: "#0b0c0f",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(201, 255, 99, 0.4)",
              }}
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

      {/* 通过 Portal 挂载到 body 顶层 */}
      {mounted && drawerContent && createPortal(drawerContent, document.body)}
    </>
  );
}
