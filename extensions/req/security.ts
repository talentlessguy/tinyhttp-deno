import { all, compile, isIP, proxyaddr } from '../../deps.ts'
import type { THRequest } from '../../request.ts'
import type { ConnInfo, Protocol } from '../../types.ts'

export const trustRemoteAddress = (
  conn: ConnInfo,
) => {
  const val = (conn.remoteAddr as Deno.NetAddr).hostname

  if (typeof val === 'function') return val

  if (typeof val === 'boolean' && val === true) return () => true

  if (typeof val === 'number') {
    return (_: unknown, i: number) => (val ? i < val : undefined)
  }

  if (typeof val === 'string') {
    return compile(val.split(',').map((x) => x.trim()))
  }

  return compile(val)
}

export const getProtocol = <Request extends THRequest = THRequest>(
  req: Request,
): 'http' | 'https' => {
  const proto = req._urlObject.protocol?.includes('https') ? 'https' : 'http'

  const header = (req.headers.get('X-Forwarded-Proto') as string) ?? proto
  const index = header.indexOf(',')

  if (!trustRemoteAddress(req.conn)) return proto

  // Note: X-Forwarded-Proto is normally only ever a
  // single value, but this is to be safe.

  return (index !== -1
    ? header.substring(0, index).trim()
    : header.trim()) as Protocol
}

export const getHostname = (req: THRequest): string | undefined => {
  let host: string = req.headers.get('X-Forwarded-Host') as string

  if (!host || !trustRemoteAddress(req.conn)) {
    host = req.headers.get('Host') as string
  }
  if (!host) return req._urlObject.hostname

  // IPv6 literal support
  const index = host.indexOf(':', host[0] === '[' ? host.indexOf(']') + 1 : 0)

  return index !== -1 ? host.substring(0, index) : host
}

export const getIP = <Request extends THRequest = THRequest>(
  req: Request,
) => proxyaddr(req, trustRemoteAddress(req.conn))?.replace(/^.*:/, '') // striping the redundant prefix addeded by OS to IPv4 address

export const getIPs = <Request extends THRequest = THRequest>(
  req: Request,
): string[] => all(req, trustRemoteAddress(req.conn))

export const getSubdomains = <Request extends THRequest = THRequest>(
  req: Request,
  subdomainOffset = 2,
): string[] => {
  const hostname = getHostname(req)

  if (!hostname) return []

  const subdomains = isIP(hostname) ? [hostname] : hostname.split('.').reverse()

  return subdomains.slice(subdomainOffset)
}
