import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { MetricsService } from '../metrics/metrics.service';
import { MetricType } from '@prisma/client';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor(private readonly metricsService: MetricsService) {
    this.transporter = createTransport({
      host: process.env.MAIL_HOST || 'ssl0.ovh.net',
      port: parseInt(process.env.MAIL_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  private compileTemplate(templateName: string, context: any): string {
    const templatePath = path.join(
      process.cwd(),
      'src/mail/templates',
      `${templateName}.hbs`,
    );
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);
    return template(context);
  }

  async sendContactConfirmation(to: string, name: string): Promise<boolean> {
    try {
      const html = this.compileTemplate('contact-confirmation', { name });

      await this.transporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
        to,
        subject: 'Confirmation de votre message',
        html,
      });

      // Track email sent in metrics
      await this.metricsService.createMetric({
        type: MetricType.EMAIL_SENT,
        path: '/contact',
        metadata: { emailType: 'contact-confirmation', recipient: to },
      });

      return true;
    } catch (error) {
      console.error('Error sending contact confirmation email:', error);
      return false;
    }
  }

  async sendContactNotification(contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<boolean> {
    try {
      const html = this.compileTemplate('contact-notification', contactData);

      await this.transporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
        to: process.env.MAIL_ADMIN_ADDRESS,
        subject: `Nouveau message de contact: ${contactData.subject}`,
        html,
        replyTo: contactData.email,
      });

      // Track email sent in metrics
      await this.metricsService.createMetric({
        type: MetricType.EMAIL_SENT,
        path: '/contact',
        metadata: {
          emailType: 'contact-notification',
          sender: contactData.email,
        },
      });

      return true;
    } catch (error) {
      console.error('Error sending contact notification email:', error);
      return false;
    }
  }

  async sendPasswordReset(to: string, resetToken: string): Promise<boolean> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      const html = this.compileTemplate('password-reset', { resetUrl });

      await this.transporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
        to,
        subject: 'Réinitialisation de votre mot de passe',
        html,
      });

      // Track email sent in metrics
      await this.metricsService.createMetric({
        type: MetricType.EMAIL_SENT,
        path: '/auth/reset-password',
        metadata: { emailType: 'password-reset', recipient: to },
      });

      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  async sendPasswordChangeConfirmation(to: string): Promise<boolean> {
    try {
      const html = this.compileTemplate('password-changed', {});

      await this.transporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
        to,
        subject: 'Confirmation de changement de mot de passe',
        html,
      });

      // Track email sent in metrics
      await this.metricsService.createMetric({
        type: MetricType.EMAIL_SENT,
        path: '/auth/change-password',
        metadata: { emailType: 'password-changed', recipient: to },
      });

      return true;
    } catch (error) {
      console.error('Error sending password change confirmation email:', error);
      return false;
    }
  }
}
