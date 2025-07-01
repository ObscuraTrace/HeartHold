import {
  ADVANCED_ASSISTANT_CAPABILITIES as CAPABILITIES,
  CAPABILITY_FLAGS,
} from "./capabilities"
import {
  ADVANCED_ASSISTANT_DESCRIPTION as DESCRIPTION,
  VERSION_TAG,
} from "./description"
import { ADVANCED_ASSISTANT_ID as BOT_ID } from "./name"
import { ADVANCED_TOOLKIT as TOOLKIT } from "./tools"

import type { AssistantProfile } from "@/ai/agent"

export const ObscuraTraceBotProfile: AssistantProfile = Object.freeze({
  id: BOT_ID,
  version: VERSION_TAG,
  label: "obscura-trace",
  promptBase: DESCRIPTION,
  features: {
    ...CAPABILITIES,
    flags: CAPABILITY_FLAGS,
  },
  extensions: TOOLKIT,
})