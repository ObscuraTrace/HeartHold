import { ObscuraSignal } from './obscuraPatternEngine'
import nodemailer, { Transporter } from 'nodemailer'
import fetch from 'node-fetch'

interface EmailConfig {
  from: string
  to: string[]
  smtpHost: string
  smtpPort: number
  user: string
  pass: string
  secure?: boolean
}

export interface AlertConfig {
  email?: EmailConfig
  webhookUrl?: string
  notifyConsole?: boolean
  retryCount?: number
  retryDelayMs?: number
}

export interface AlertMessage {
  subject: string
  body: string
}

export class ObscuraAlertService {
  private transporter?: Transporter
  private retryCount: number
  private retryDelayMs: number

  constructor(private config: AlertConfig) {
    this.retryCount = config.retryCount ?? 3
    this.retryDelayMs = config.retryDelayMs ?? 500
    if (config.email) {
      const { smtpHost, smtpPort, user, pass, secure } = config.email
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: secure ?? smtpPort === 465,
        auth: { user, pass },
      })
    }
  }

  private formatMessage(signal: ObscuraSignal): AlertMessage {
    const time = new Date(signal.timestamp).toISOString()
    const strength = Math.round(signal.alertStrength * 100)
    const subject = `ObscuraTrace Alert: ${signal.type}`
    const body = [
      `Time: ${time}`,
      `Type: ${signal.type}`,
      `Strength: ${strength}%`,
      `Details: ${signal.details ?? 'n/a'}`
    ].join('\n')
    return { subject, body }
  }

  private async sendEmail(message: AlertMessage): Promise<void> {
    if (!this.transporter || !this.config.email) return
    const { from, to } = this.config.email
    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        await this.transporter.sendMail({
          from,
          to,
          subject: message.subject,
          text: message.body,
        })
        return
      } catch (err: any) {
        if (attempt === this.retryCount) {
          console.error(`[ObscuraAlert][email] Failed after ${attempt} attempts:`, err)
        } else {
          await this.delay(this.retryDelayMs * attempt)
        }
      }
    }
  }

  private async sendWebhook(signal: ObscuraSignal): Promise<void> {
    const url = this.config.webhookUrl
    if (!url) return
    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signal),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return
      } catch (err: any) {
        if (attempt === this.retryCount) {
          console.error(`[ObscuraAlert][webhook] Failed after ${attempt} attempts:`, err)
        } else {
          await this.delay(this.retryDelayMs * attempt)
        }
      }
    }
  }

  private logToConsole(signal: ObscuraSignal): void {
    if (!this.config.notifyConsole) return
    const time = new Date(signal.timestamp).toLocaleTimeString()
    const strength = Math.round(signal.alertStrength * 100)
    console.log(
      `[ObscuraAlert] ${time} — ${signal.type} (${strength}%)`
    )
  }

  private delay(ms: number): Promise<void> {
    return new Promise(res => setTimeout(res, ms))
  }

  /**
   * Dispatch alerts for a batch of signals.
   * Emails and webhooks are sent in parallel per signal, with retries.
   */
  async dispatch(signals: ObscuraSignal[]): Promise<void> {
    for (const signal of signals) {
      const message = this.formatMessage(signal)
      await Promise.all([
        this.sendEmail(message),
        this.sendWebhook(signal),
      ])
      this.logToConsole(signal)
    }
  }
}
