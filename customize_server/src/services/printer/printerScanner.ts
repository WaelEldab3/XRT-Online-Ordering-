import net from 'net';
import os from 'os';

/**
 * Checks if an IP address is reachable on a given port.
 */
function checkPort(host: string, port: number, timeoutMs: number = 1000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = false;

    socket.on('connect', () => {
      status = true;
      socket.destroy();
    });

    socket.on('timeout', () => {
      status = false;
      socket.destroy();
    });

    socket.on('error', () => {
      status = false;
    });

    socket.on('close', () => {
      resolve(status);
    });

    socket.connect(port, host);
    socket.setTimeout(timeoutMs);
  });
}

/**
 * Returns a list of local IPv4 network interfaces.
 */
function getLocalSubnets(): { address: string; netmask: string }[] {
  const interfaces = os.networkInterfaces();
  const subnets: { address: string; netmask: string }[] = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        subnets.push({ address: iface.address, netmask: iface.netmask });
      }
    }
  }

  return subnets;
}

/**
 * Converts IP to numeric representation.
 */
function ipToNum(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

/**
 * Converts numeric representation to IP.
 */
function numToIp(num: number): string {
  return [num >>> 24, (num >> 16) & 255, (num >> 8) & 255, num & 255].join('.');
}

/**
 * Scans local network subnets for devices listening on a specific port (default 9100 for printers).
 */
export async function scanForPrinters(
  port: number = 9100,
  timeoutMs: number = 2000
): Promise<string[]> {
  const subnets = getLocalSubnets();
  const ipsToScan: string[] = [];

  for (const { address, netmask } of subnets) {
    const ipNum = ipToNum(address);
    const maskNum = ipToNum(netmask);
    const network = ipNum & maskNum;
    const broadcast = network | ~maskNum;

    // Standard /24 scan, to prevent huge scans on larger subnets we limit to /24 equivalent size
    // If it's larger than /24, we just scan the /24 range the IP is in.
    const maxHosts = 254;
    let startIp = network + 1;
    let endIp = broadcast - 1;

    if (endIp - startIp > maxHosts) {
      startIp = ipNum & 0xffffff00; // Force /24 based on the address
      startIp += 1;
      endIp = startIp + 253;
    }

    const startIpNum = startIp >>> 0;
    const endIpNum = endIp >>> 0;

    for (let i = startIpNum; i <= endIpNum; i++) {
      // Skip our own address
      if (i !== ipNum >>> 0) {
        ipsToScan.push(numToIp(i));
      }
    }
  }

  // To avoid exhausting system file descriptors or bandwidth, batch the scans
  const batchSize = 100;
  const foundPrinters: string[] = [];

  for (let i = 0; i < ipsToScan.length; i += batchSize) {
    const batch = ipsToScan.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (ip) => {
        const isPrinter = await checkPort(ip, port, timeoutMs);
        return isPrinter ? ip : null;
      })
    );
    foundPrinters.push(...(results.filter(Boolean) as string[]));
  }

  return foundPrinters;
}

/**
 * Maps to scanForPrinters, alias for LAN connections.
 */
export const scanLAN = scanForPrinters;

import { exec } from 'child_process';

/**
 * Scans for connected Bluetooth devices natively.
 * Supports Windows natively via powershell.
 */
export async function scanBluetooth(): Promise<string[]> {
  return new Promise((resolve) => {
    if (os.platform() === 'win32') {
      // Use PowerShell to get Bluetooth devices. We look for paired COM ports or devices.
      // A common way to find Bluetooth COM ports in Windows is querying Win32_PnPEntity
      const cmd = `powershell -NoProfile -Command "Get-PnpDevice -Class Bluetooth | Where-Object { $_.Status -eq 'OK' } | Select-Object -ExpandProperty Name"`;

      exec(cmd, (error, stdout) => {
        if (error) {
          console.error('Bluetooth scan error:', error);
          return resolve([]);
        }

        const devices = stdout
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        resolve(devices);
      });
    } else {
      // For Linux/Mac, or if unsupported, return empty for now unless hcitool/system_profiler is heavily needed.
      // This covers the generic case safely without crashing.
      console.warn('Bluetooth scanning currently optimized for Windows host in this environment.');
      resolve([]);
    }
  });
}
