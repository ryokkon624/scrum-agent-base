#!/usr/bin/env bun
/**
 * webhook-channel
 *
 * scrum-agent-base のエージェント間連携用 webhook チャンネル。
 * エージェントが作業完了時に localhost:8788 に POST することで
 * 次のエージェントを起動するトリガーになる。
 *
 * 起動方法:
 *   claude --dangerously-load-development-channels server:webhook
 *
 * エージェントからのトリガー例:
 *   curl -X POST localhost:8788 \
 *     -H "X-Sender: scrum-agent" \
 *     -d "SMモードで動いて。skills/scrum_master.md を読んで Sprint Reviewを実施してください。"
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

// 許可された送信者（エージェント自身 + りょこさんの手動テスト用）
const ALLOWED_SENDERS = new Set(['scrum-agent', 'ryoko'])

const mcp = new Server(
  { name: 'webhook', version: '1.0.0' },
  {
    capabilities: {
      experimental: {
        'claude/channel': {},
      },
    },
    instructions: `
このチャンネルは scrum-agent-base のエージェント間連携用 webhook です。
<channel source="webhook"> タグでイベントが届きます。

イベントの内容は次のエージェントへの指示です。例：
  "SMモードで動いて。skills/scrum_master.md と memory/sm/short_term.md を読んで、Sprint Reviewを実施してください。"

受け取ったらすぐに CLAUDE.md のロール指定方法に従い、指定されたモードで動いてください。
返信は不要です（一方向チャンネル）。
    `.trim(),
  },
)

await mcp.connect(new StdioServerTransport())

let nextId = 1

Bun.serve({
  port: 8788,
  hostname: '127.0.0.1',
  async fetch(req) {
    const url = new URL(req.url)

    // ヘルスチェック
    if (req.method === 'GET' && url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', port: 8788 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // POST: エージェントからの指示を受け取り Claude Code に転送
    if (req.method === 'POST') {
      const sender = req.headers.get('X-Sender') ?? ''

      // 送信者チェック
      if (!ALLOWED_SENDERS.has(sender)) {
        console.error(`[webhook] 未許可の送信者: ${sender}`)
        return new Response('forbidden', { status: 403 })
      }

      const body = await req.text()
      const eventId = String(nextId++)

      console.error(`[webhook] イベント受信 #${eventId} from ${sender}: ${body.slice(0, 80)}...`)

      await mcp.notification({
        method: 'notifications/claude/channel',
        params: {
          content: body,
          meta: {
            event_id: eventId,
            sender,
          },
        },
      })

      return new Response(JSON.stringify({ ok: true, event_id: eventId }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response('not found', { status: 404 })
  },
})

console.error('[webhook] チャンネル起動完了 - localhost:8788 でリッスン中')
