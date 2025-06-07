import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor() {
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
      'src/features/contact/mail/templates',
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

      return true;
    } catch (error) {
      console.error('Error sending contact notification email:', error);
      return false;
    }
  }
}
