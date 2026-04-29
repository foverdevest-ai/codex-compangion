import { CodexAppServerProvider } from "./codex-app-server-provider";

export class GenericResponseProvider extends CodexAppServerProvider {
  // Fallback adapter for model-response flows that do not expose approval-native events yet.
  // It preserves the same app contract so the UI remains approval-aware as providers evolve.
}
