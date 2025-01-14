import { ConfigPlugin } from "@expo/config-plugins";
import { sync as globSync } from "glob";
import path from "path";

import type { Config } from "./config";
import { withPodTargetExtension } from "./withPodTargetExtension";
import withWidget from "./withWidget";
import { withXcodeProjectBetaBaseMod } from "./withXcparse";

export const withTargetsDir: ConfigPlugin<
  {
    appleTeamId?: string;
    match?: string;
    root?: string;
  } | void
> = (config, _props) => {
  const {
    appleTeamId = config?.ios?.appleTeamId,
    root = "./targets",
    match = "*",
  } = _props || {};
  if (!appleTeamId) {
    throw new Error(
      `You must specify an \`appleTeamId\` in your app config to use the \`withTargetsDir\` plugin.`
    );
  }
  const projectRoot = config._internal!.projectRoot;

  const targets = globSync(`${root}/${match}/expo-target.config.@(json|js)`, {
    // const targets = globSync(`./targets/action/expo-target.config.@(json|js)`, {
    cwd: projectRoot,
    absolute: true,
  });

  targets.forEach((configPath) => {
    config = withWidget(config, {
      appleTeamId,
      ...require(configPath),
      directory: path.relative(projectRoot, path.dirname(configPath)),
    });
  });

  withPodTargetExtension(config);

  return withXcodeProjectBetaBaseMod(config);
};

export { Config };

module.exports = withTargetsDir;
