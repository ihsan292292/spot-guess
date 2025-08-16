
import { Plugin, ConfigEnv, UserConfig } from "vite";
import fs from 'fs';
import path from 'path';
import { ServerOptions } from "node:https";

type HttpsEnableKeys = 'server' | 'preview';
type EnableSettings = Partial<Record<HttpsEnableKeys, boolean>>;
type ResolveServerCertificateFn = () => SelfSignedServerCertificate;
type SelfSignedHttpsSupportPluginOptions = {
  disable?: boolean;
  settings?: EnableSettings
  resolveServerCertificateFn?: ResolveServerCertificateFn;
};
type SelfSignedServerCertificate =  Pick<ServerOptions, 'key' | 'cert'>;
const defaultResolveServerCertificate: ResolveServerCertificateFn = () => {
  try{
    const certDir = path.resolve(process.cwd(), 'generated/certs'); 
    return {
      key: fs.readFileSync(path.resolve(certDir, 'private.key')),
      cert: fs.readFileSync(path.resolve(certDir, 'certificate.crt')),
    }
  } catch(e){
    const errorCause = e instanceof Error ? e : new Error(String(e));
    throw new Error(`Could not find certificate files for https. Be sure, that you created them before: "${errorCause}"`, {cause: errorCause})
  }
}

const addHttps = <Key extends HttpsEnableKeys>(
  key: Key,
  config: UserConfig, 
  settings: EnableSettings | undefined,
  serverCertificateHttpsOptions: SelfSignedServerCertificate
): typeof config[Key] | undefined => {
  const shouldEnableHttps = settings?.[key] !== false;
  if(!config[key] && !shouldEnableHttps){
    console.info(`Not enabling https for: ${key}, since the user config for this key is empt and the plugin is configured to not add https for this key.`);
    return undefined;
  }

  console.info(`Https is enabled for ${key}`)
  // Build the specific common server options, optionally adding HTTPS if enabled
  return {
    ...(config[key] ?? {}),
    ...(shouldEnableHttps && { https: serverCertificateHttpsOptions }),
  };
}

export const selfSignedHttpsSupportPlugin = (options?: SelfSignedHttpsSupportPluginOptions): Plugin => {
  return {
    name: 'self-signed-https-support',
    config: (config, { mode }: ConfigEnv) => {
      const {
        disable = false,
        settings = {server: true, preview: true},
        resolveServerCertificateFn: resolveServerCertficateFn = defaultResolveServerCertificate,
      } = options ?? {};
      const isHttps = process.env.VITE_HTTPS === 'true';

      if (disable){
        console.debug(`The self-signed-https-support plugin is disabled.`);
        return config;
      }

      if (isHttps) {
        console.info(`Configuring self-signed https plugin for mode: ${mode}`);
        console.info(`Using ${options?.resolveServerCertificateFn ? "a custom" : "the default"} server certificate resolver.`);
        const serverCertificateHttpsOptions = resolveServerCertficateFn();
        return {
          ...config,
          server: addHttps('server', config, settings, serverCertificateHttpsOptions),
          preview: addHttps('preview', config, settings, serverCertificateHttpsOptions),
        };
      }

      return config;
    },
  };
};


