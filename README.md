# Parakeet voice input for DeepSeek Harness

This installable plugin adds Russian browser speech input to the DeepSeek Harness composer. It keeps the recognized text in the draft; sending remains an explicit user action.

The package includes the Windows `nemo-speech.exe` companion. The host plugin starts it on demand, reuses it while the Web UI is running, and stops it when the plugin unloads. The companion listens on `127.0.0.1:8080`.

## Install

From the directory containing the `dsh` profile:

```powershell
dsh plugin --profile desktop add github:vTRKA/voice-dsh
```

The package declares its own `dsh.bundle` patch, so the plugin row is added automatically. Restart `dsh --profile desktop` after installation.

PowerShell users can run the included installer (the profile defaults to `desktop`):

```powershell
.\install.ps1
```

For a local checkout:

```powershell
dsh plugin --profile desktop add D:\path\to\voice-dsh
```

## Verify before publishing

```powershell
node scripts/verify-package.mjs
```

The check rejects a bundle whose loader handoff ID differs from the package name. This prevents the `loaded without registering` startup failure.

## Requirements

- DeepSeek Harness Web profile
- Windows x64 (the included companion is a Windows executable)
- A browser that supports microphone capture and WebSocket

Microphone permission, the local companion, and the model remain local to the user's machine. The plugin does not submit drafts automatically.
