

import { ObscuraSignal } from './obscuraPatternEngine'
import nodemailer from 'nodemailer'

interface AlertConfig {
  email?: {
    from: string
    to: string[]
    smtpHost: string
    smtpPort: number
    user: string
    pass: string
  }
  webhookUrl?: string
  notifyConsole?: boolean
}

interface AlertMessage {
  subject: string
  body: string
}

export class ObscuraAlertService {
  constructor(private config: AlertConfig) {}

  private formatMessage(signal: ObscuraSignal): AlertMessage {
    const time = new Date(signal.timestamp).toISOString()
    const strength = Math.round(signal.alertStrength * 100)
    const subject = `ObscuraTrace Alert: ${signal.type}`
    const body = `
Time: ${time}
Type: ${signal.type}
Strength: ${strength}%
Details: ${signal.details || 'n/a'}
`.trim()
    return { subject, body }
  }

  private async sendEmail(message: AlertMessage) {
    if (!this.config.email) return
    const { smtpHost, smtpPort, user, pass, from, to } = this.config.email
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user, pass },
    })
    await transporter.sendMail({
      from,
      to,
      subject: message.subject,
      text: message.body,
    })
  }

  private async sendWebhook(signal: ObscuraSignal) {
    if (!this.config.webhookUrl) return
    await fetch(this.config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signal),
    })
  }

  private logToConsole(signal: ObscuraSignal) {
    if (!this.config.notifyConsole) return
    const time = new Date(signal.timestamp).toLocaleTimeString()
    console.log(
      `[ObscuraAlert] ${time} — ${signal.type} (${Math.round(
        signal.alertStrength * 100
      )}%)`
    )
  }

  async dispatch(signals: ObscuraSignal[]) {
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
