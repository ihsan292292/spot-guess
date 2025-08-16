import { PreviewServer, ViteDevServer, Plugin } from "vite";
import os from 'os';

type Server = PreviewServer | ViteDevServer

const printHostNameUrl = (values: {protocol: string, hostname: string, port: number | undefined, base: string}) => {
  const { protocol, hostname, port, base } = values;
  const networkUrl = `${protocol}://${hostname}:${port}${base}`
    
  const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
  const cyan = (text: string) => `\x1b[36m${text}\x1b[0m`;
  const bold = (text: string) => `\x1b[1m${text}\x1b[22m`;

  console.log(`  ${green("➜")}  ${bold("Network (via Hostname):")} ${cyan(networkUrl)}`);
}

const appendPrintUrlsFn = (server: Server, which: 'server' | 'preview') => {
  const isHostFlagEnabled = server.config[which].host === true || server.config[which].host === '0.0.0.0';
  if(isHostFlagEnabled){
    const originalPrintUrls = server.printUrls;
    server.printUrls = () => {
      originalPrintUrls();
      printHostNameUrl({
        protocol: server.config[which].https ? 'https' : 'http', 
        hostname: os.hostname(), 
        port: server.config[which].port, 
        base: server.config.base || ''
      })
    };
  }
}

export function displayNetworkUrlWithHostnamePlugin(): Plugin {
  return {
    name: 'hostname-display',
    configurePreviewServer(server: PreviewServer){
      appendPrintUrlsFn(server, "preview");
    },
    configureServer(server: ViteDevServer) {
      appendPrintUrlsFn(server, "server");
    },
  };
}