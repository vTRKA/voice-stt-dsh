# Parakeet voice input for DeepSeek Harness

This plugin adds a local microphone button to the DeepSeek Harness composer.
Audio stays on the user's computer. The plugin never sends a message by itself.

## Quick start

1. Install DeepSeek Harness.
2. Open PowerShell in this folder and run:

   ```powershell
   .\install.ps1
   ```

3. Install the model using [Install the model](#install-the-model).
4. Restart DSH.
5. Click the microphone once, speak, and click it again.
6. Review the transcript in the draft and press **Send**.

You do not need to hold the button or the shortcut.

## Shortcut

The default two-key shortcut is `Ctrl+E` on Windows/Linux and `Command+E` on
macOS. Press it once to start recording and once again to finish.

Right-click the microphone to choose another shortcut. The new shortcut must
include `Ctrl`, `Alt`, `Shift`, or `Command`, and is saved in the browser.

## Install the model

The Parakeet model runs offline. Audio stays on the computer. For safe
installation, provide a trusted download URL and the model publisher's SHA-256
checksum:

```powershell
.\install-model.ps1 `
  -Url 'https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3/resolve/main/parakeet-tdt-0.6b-v3.q8_0.gguf?download=true' `
  -Sha256 '<64-character SHA-256 checksum>'
```

If the model is missing, DSH still starts normally and the microphone remains
disabled. The installer verifies the checksum before replacing the active file.

## How recording works

- The first click starts the local companion and microphone capture.
- The second click stops recording.
- The offline model receives one local WAV file and returns the final transcript.
- The transcript is inserted into the draft; sending remains a separate action.
- The companion stops after recording ends or when the plugin unloads.

Offline models do not show interim words. The final transcript appears after the
second click.

## Update or remove

Update the installed plugin and then restart DSH:

```powershell
dsh plugin --profile desktop update @local/dsh-parakeet-voice-input
```

The update preserves the model under `$DSH_HOME/models`. Remove the plugin with:

```powershell
dsh plugin --profile desktop remove @local/dsh-parakeet-voice-input
```

## Troubleshooting

If the microphone stops immediately:

1. Restart DSH after installing or updating the plugin.
2. Check that the model exists under `$DSH_HOME/models/parakeet-tdt-0.6b-v3`.
3. Check the browser microphone permission.
4. Make sure port `8080` is not used by another process.
5. Click once, wait a second, and then speak.

## Requirements

- DeepSeek Harness Web profile;
- Windows x64 (the package includes a Windows companion);
- a browser with microphone and Web Audio support.

Verify the package before publishing:

```powershell
node scripts/verify-package.mjs
```
