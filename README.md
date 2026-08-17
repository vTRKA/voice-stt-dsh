# Parakeet voice input for DeepSeek Harness

This plugin adds a local microphone button to the DeepSeek Harness composer.
Audio stays on the user's computer. The plugin never sends a message by itself.

## Quick start

1. Install and start DSH Desktop once.
2. Download this repository (or open its folder in PowerShell).
3. Run the installer:

   ```powershell
   .\install.ps1
   ```

4. Install the model using [Install the model](#install-the-model).
5. Restart DSH Desktop.
6. The microphone button appears in the composer. You can click it, or press
   `Ctrl+E` once, to start recording. Press the same shortcut once more to stop.
7. Review the transcript in the draft and press **Send**.

You do not need to click the button before using the shortcut, and you do not
need to hold either control. The shortcut calls the same local recording action
as the button.

The installer uses the official `dsh plugin` command when it is available. DSH
Desktop users normally do not have that command on `PATH`, so the same script
falls back to the Desktop profile at `$DSH_HOME/profiles/desktop`, registers the
bundle layer, and removes the conflicting built-in voice-input row. It does not
write to the DSH application directory.

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

If `dsh` is not on `PATH`, run `install.ps1` again to update. To remove the
Desktop installation cleanly, use:

```powershell
corepack pnpm --dir "$env:USERPROFILE\.dsh\profiles\desktop" remove @local/dsh-parakeet-voice-input
```

Then remove the two Parakeet rows from that profile's `cordis.patch.yml` and
restart DSH Desktop. The model file is kept so reinstalling does not require a
new download; delete `$DSH_HOME\models\parakeet-tdt-0.6b-v3` only if you also
want to remove the offline model.

## Troubleshooting

If the microphone stops immediately:

1. Restart DSH after installing or updating the plugin.
2. Check that the model exists under `$DSH_HOME/models/parakeet-tdt-0.6b-v3`.
3. Check the browser microphone permission.
4. Make sure port `8080` is not used by another process.
5. Click once, wait a second, and then speak.

If the button is missing after installation, restart DSH Desktop once more. The
installer must have access to the Desktop profile; running `pnpm add` in this
repository alone does not activate a DSH bundle.

If the button is visible but `Ctrl+E` does nothing, click inside the chat once
so the WebView has focus, then press `Ctrl+E`. The listener is installed on the
whole chat window and does not require the microphone button to be focused.

The microphone permission prompt is expected. The chat is rendered in a local
browser/WebView, and browsers require explicit `getUserMedia` permission before
any page can read a microphone. Audio is sent only to the local Parakeet service
at `127.0.0.1`; it is not uploaded to a speech API.

## Requirements

- DeepSeek Harness Web profile;
- Windows x64 (the package includes a Windows companion);
- a browser with microphone and Web Audio support.

Verify the package before publishing:

```powershell
node scripts/verify-package.mjs
```
