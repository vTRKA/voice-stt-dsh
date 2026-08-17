window.__ModuleLoader__.load({
	id: "@local/dsh-parakeet-voice-input",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:D:\Developments\test harness\harness-src\packages\client\ui-voice-input\src\client\VoiceInputButton.module.css.mjs
		const css = ".maC0iG_button{width:28px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:999px;flex:none;place-items:center;padding:0;display:grid}.maC0iG_button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.maC0iG_button:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}.maC0iG_button:disabled{opacity:.45;cursor:default}.maC0iG_listening{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-state-success-primary);box-shadow:0 0 0 2px var(--dsw-alias-state-success-primary);animation:1.2s ease-in-out infinite maC0iG_voice-input-pulse}.maC0iG_status{clip:rect(0, 0, 0, 0);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}@keyframes maC0iG_voice-input-pulse{0%,to{opacity:1}50%{opacity:.55}}";
		const tagId = "@deepseek-ai/dsh-client-ui-voice-input/VoiceInputButton.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-voice-input";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var VoiceInputButton_module_css_default = {
			"voice-input-pulse": "maC0iG_voice-input-pulse",
			"status": "maC0iG_status",
			"listening": "maC0iG_listening",
			"button": "maC0iG_button"
		};
		//#endregion
		//#region src/client/VoiceInputButton.tsx
		const PARAKEET_REALTIME_URL = "ws://127.0.0.1:8080/v1/realtime";
		function defaultShortcut(platform) {
			const mac = /mac/iu.test(platform);
			return {
				ctrl: !mac,
				alt: false,
				shift: false,
				meta: mac,
				key: "e"
			};
		}
		function appendTranscript(base, transcript) {
			const text = transcript.trim();
			if (text === "") return base;
			if (base === "" || /\s$/u.test(base)) return `${base}${text}`;
			return `${base} ${text}`;
		}
		function shortcutLabel(shortcut) {
			const parts = [];
			if (shortcut.ctrl) parts.push("Ctrl");
			if (shortcut.alt) parts.push("Alt");
			if (shortcut.shift) parts.push("Shift");
			if (shortcut.meta) parts.push("Command");
			parts.push(shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key);
			return parts.join("+");
		}
		function stopTracks(stream) {
			for (const track of stream.getTracks()) track.stop();
		}
		function pcm16(samples) {
			const output = new Int16Array(samples.length);
			for (let index = 0; index < samples.length; index += 1) {
				const sample = Math.max(-1, Math.min(1, samples[index] ?? 0));
				output[index] = sample < 0 ? sample * 32768 : sample * 32767;
			}
			return output.buffer;
		}
		function MicrophoneIcon({ active }) {
			return active ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "16",
				height: "16",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: "4",
					y: "4",
					width: "8",
					height: "8",
					rx: "1.5",
					fill: "currentColor"
				})
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: "16",
				height: "16",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: "5.25",
					y: "1.5",
					width: "5.5",
					height: "9",
					rx: "2.75",
					stroke: "currentColor",
					strokeWidth: "1.3"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M3.5 7.75C3.5 10.24 5.51 12.25 8 12.25C10.49 12.25 12.5 10.24 12.5 7.75M8 12.25V14.5M5.75 14.5H10.25",
					stroke: "currentColor",
					strokeWidth: "1.3",
					strokeLinecap: "round"
				})]
			});
		}
		/** Russian push-on/push-off Parakeet TDT v3 control for the composer draft. */
		function VoiceInputButton({ input, inputActions, t }) {
			const sessionRef = (0, react.useRef)(null);
			const generationRef = (0, react.useRef)(0);
			const mountedRef = (0, react.useRef)(true);
			const [phase, setPhase] = (0, react.useState)("idle");
			const [error, setError] = (0, react.useState)(null);
			const [editingShortcut, setEditingShortcut] = (0, react.useState)(false);
			const [shortcut, setShortcut] = (0, react.useState)(() => defaultShortcut(navigator.platform));
			const [shortcutNotice, setShortcutNotice] = (0, react.useState)(null);
			const voiceWindow = window;
			const supported = navigator.mediaDevices?.getUserMedia !== void 0 && voiceWindow.WebSocket !== void 0 && (voiceWindow.AudioContext !== void 0 || voiceWindow.webkitAudioContext !== void 0);
			const locked = input.phase !== "plain";
			(0, react.useEffect)(() => {
				try {
					const stored = localStorage.getItem("dsh.parakeet.shortcut");
					if (stored === null) return;
					const parsed = JSON.parse(stored);
					if (typeof parsed.key !== "string" || parsed.key === "" || typeof parsed.ctrl !== "boolean" || typeof parsed.alt !== "boolean" || typeof parsed.shift !== "boolean" || typeof parsed.meta !== "boolean" || !parsed.ctrl && !parsed.alt && !parsed.shift && !parsed.meta) return;
					setShortcut({
						ctrl: parsed.ctrl,
						alt: parsed.alt,
						shift: parsed.shift,
						meta: parsed.meta,
						key: parsed.key.toLowerCase()
					});
				} catch {
					localStorage.removeItem("dsh.parakeet.shortcut");
				}
			}, []);
			(0, react.useEffect)(() => () => {
				mountedRef.current = false;
				generationRef.current += 1;
				sessionRef.current?.cancel();
				sessionRef.current = null;
			}, []);
			(0, react.useEffect)(() => {
				if (!locked) return;
				generationRef.current += 1;
				sessionRef.current?.stop();
			}, [locked]);
			const start = async () => {
				if (editingShortcut) {
					setEditingShortcut(false);
					setShortcutNotice(null);
					return;
				}
				const AudioContextConstructor = voiceWindow.AudioContext ?? voiceWindow.webkitAudioContext;
				if (!supported || AudioContextConstructor === void 0) {
					setError("error.unsupported");
					return;
				}
				const generation = generationRef.current + 1;
				generationRef.current = generation;
				setError(null);
				setPhase("connecting");
				let stream;
				try {
					stream = await navigator.mediaDevices.getUserMedia({
						audio: {
							channelCount: 1,
							echoCancellation: true,
							noiseSuppression: true
						},
						video: false
					});
				} catch {
					if (mountedRef.current && generationRef.current === generation) {
						setError("error.permission");
						setPhase("idle");
					}
					return;
				}
				if (!mountedRef.current || generationRef.current !== generation) {
					stopTracks(stream);
					return;
				}
				const socket = new WebSocket(PARAKEET_REALTIME_URL);
				let context = null;
				let source = null;
				let processor = null;
				let sink = null;
				let finalTranscript = "";
				let interimTranscript = "";
				let captureStopped = false;
				let settled = false;
				let stopRequested = false;
				const baseDraft = input.draft;
				const publish = () => {
					if (!mountedRef.current || generationRef.current !== generation) return;
					const recognized = appendTranscript(finalTranscript, interimTranscript);
					inputActions.setDraft(appendTranscript(baseDraft, recognized));
				};
				const stopCapture = () => {
					if (captureStopped) return;
					captureStopped = true;
					if (processor !== null) processor.onaudioprocess = null;
					source?.disconnect();
					processor?.disconnect();
					sink?.disconnect();
					stopTracks(stream);
					if (context !== null) context.close();
				};
				const settle = (nextError) => {
					if (settled) return;
					settled = true;
					stopCapture();
					socket.onopen = null;
					socket.onmessage = null;
					socket.onerror = null;
					socket.onclose = null;
					if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) socket.close();
					if (sessionRef.current === session) sessionRef.current = null;
					if (mountedRef.current && generationRef.current === generation) {
						setError(nextError);
						setPhase("idle");
					}
				};
				const session = {
					stop() {
						if (settled || stopRequested) return;
						stopRequested = true;
						stopCapture();
						if (mountedRef.current && generationRef.current === generation) setPhase("finalizing");
						if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
						else settle("error.backend");
					},
					cancel() {
						if (settled) return;
						stopCapture();
						if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: "input_audio_buffer.clear" }));
						settle(null);
					}
				};
				sessionRef.current = session;
				socket.onopen = () => {
					if (settled || generationRef.current !== generation) return;
					try {
						const activeContext = new AudioContextConstructor();
						context = activeContext;
						source = activeContext.createMediaStreamSource(stream);
						processor = activeContext.createScriptProcessor(4096, 1, 1);
						sink = activeContext.createGain();
						sink.gain.value = 0;
						socket.send(JSON.stringify({
							type: "session.update",
							session: {
								sample_rate: activeContext.sampleRate,
								language: "ru",
								automatic_punctuation: true,
								endpointing_ms: 700
							}
						}));
						processor.onaudioprocess = (event) => {
							if (!settled && socket.readyState === WebSocket.OPEN) socket.send(pcm16(event.inputBuffer.getChannelData(0)));
						};
						source.connect(processor);
						processor.connect(sink);
						sink.connect(activeContext.destination);
						activeContext.resume();
						setPhase("listening");
					} catch {
						settle("error.failed");
					}
				};
				socket.onmessage = (event) => {
					let message;
					try {
						message = JSON.parse(String(event.data));
					} catch {
						settle("error.failed");
						return;
					}
					if (message.type === "conversation.item.input_audio_transcription.delta") {
						interimTranscript += message.delta ?? "";
						publish();
					} else if (message.type === "conversation.item.input_audio_transcription.completed") {
						finalTranscript = appendTranscript(finalTranscript, message.transcript ?? "");
						interimTranscript = "";
						publish();
					} else if (message.type === "input_audio_buffer.committed") settle(null);
					else if (message.type === "error") settle("error.failed");
				};
				socket.onerror = () => {
					settle("error.backend");
				};
				socket.onclose = () => {
					settle("error.backend");
				};
			};
			const stop = () => {
				sessionRef.current?.stop();
			};
			(0, react.useEffect)(() => {
				const toggle = (event) => {
					const key = event.key.toLowerCase();
					if (editingShortcut) {
						if (key === "escape") {
							event.preventDefault();
							setEditingShortcut(false);
							setShortcutNotice(null);
							return;
						}
						if (key === "control" || key === "alt" || key === "shift" || key === "meta") return;
						if (!event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
							setShortcutNotice("shortcut.modifier");
							return;
						}
						event.preventDefault();
						const next = {
							ctrl: event.ctrlKey,
							alt: event.altKey,
							shift: event.shiftKey,
							meta: event.metaKey,
							key
						};
						setShortcut(next);
						setEditingShortcut(false);
						setShortcutNotice("shortcut.saved");
						localStorage.setItem("dsh.parakeet.shortcut", JSON.stringify(next));
						return;
					}
					if (event.repeat || key !== shortcut.key || event.ctrlKey !== shortcut.ctrl || event.altKey !== shortcut.alt || event.shiftKey !== shortcut.shift || event.metaKey !== shortcut.meta) return;
					if (phase === "listening") {
						event.preventDefault();
						stop();
					} else if (phase === "idle" && !locked && supported) {
						event.preventDefault();
						start();
					}
				};
				document.addEventListener("keydown", toggle);
				return () => {
					document.removeEventListener("keydown", toggle);
				};
			}, [
				phase,
				locked,
				supported,
				input.draft,
				editingShortcut,
				shortcut
			]);
			const active = phase === "listening" || phase === "finalizing";
			const disabled = locked || !supported || phase === "connecting" || phase === "finalizing";
			const hotkey = shortcutLabel(shortcut);
			const baseLabel = t(phase === "listening" ? "action.stop" : phase === "connecting" ? "state.connecting" : phase === "finalizing" ? "state.finalizing" : "action.start");
			const label = !supported ? t("error.unsupported") : error === null ? `${baseLabel} (${hotkey})` : t(error);
			const status = !supported ? "" : error !== null ? t(error) : shortcutNotice !== null ? `${t(shortcutNotice)}${shortcutNotice === "shortcut.saved" ? `: ${hotkey}` : ""}` : phase === "listening" ? t("state.listening") : phase === "connecting" ? t("state.connecting") : phase === "finalizing" ? t("state.finalizing") : "";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label,
				side: "bottom",
				delayMs: 400,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: `${VoiceInputButton_module_css_default.button}${active ? ` ${VoiceInputButton_module_css_default.listening}` : ""}`,
					"aria-label": label,
					"aria-pressed": active,
					title: `${label} · ${t("shortcut.change")}`,
					disabled,
					onContextMenu: (event) => {
						event.preventDefault();
						if (phase !== "idle" || locked) return;
						setEditingShortcut(true);
						setShortcutNotice("shortcut.capture");
					},
					onClick: phase === "listening" ? stop : () => {
						start();
					},
					"data-voice-input": true,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MicrophoneIcon, { active })
				})
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: VoiceInputButton_module_css_default.status,
				role: "status",
				"aria-live": "polite",
				children: status
			})] });
		}
		//#endregion
		//#region src/client/locales.ts
		/** `voiceInput` namespace dictionaries. */
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"action.start": "使用 Parakeet 开始俄语语音输入",
			"action.stop": "停止语音输入",
			"shortcut.change": "右键点击可更改快捷键",
			"shortcut.capture": "请按新的组合键；Esc 取消",
			"shortcut.modifier": "请添加 Ctrl、Alt、Shift 或 Command",
			"shortcut.saved": "快捷键已保存",
			"state.connecting": "正在连接本地 Parakeet 服务",
			"state.listening": "Parakeet 正在听取俄语语音",
			"state.finalizing": "Parakeet 正在完成识别",
			"error.unsupported": "此浏览器不支持麦克风音频采集",
			"error.permission": "麦克风权限被拒绝",
			"error.backend": "本地 Parakeet 服务不可用",
			"error.failed": "Parakeet 语音识别失败"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"action.start": "Start Russian voice input with Parakeet",
			"action.stop": "Stop voice input",
			"shortcut.change": "Right-click to change the shortcut",
			"shortcut.capture": "Press a new key combination; Escape cancels",
			"shortcut.modifier": "Add Ctrl, Alt, Shift, or Command",
			"shortcut.saved": "Shortcut saved",
			"state.connecting": "Connecting to the local Parakeet service",
			"state.listening": "Parakeet is listening for Russian speech",
			"state.finalizing": "Parakeet is finalizing the transcript",
			"error.unsupported": "Microphone audio capture is unavailable in this browser",
			"error.permission": "Microphone permission was denied",
			"error.backend": "The local Parakeet service is unavailable",
			"error.failed": "Parakeet speech recognition failed"
		};
		//#endregion
		//#region src/client/index.ts
		const NS = "voiceInput";
		/** Required browser services for slot composition and localized copy. */
		const inject = ["slots", "locale"];
		/**
		* Register the Russian voice-input control beside the composer send button.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-voice-input: dictionaries");
			ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
				name: "conversation.input.right",
				id: "voice-input",
				order: 100,
				locale: NS
			}, VoiceInputButton));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
