import { Injectable } from '@nestjs/common';

@Injectable()
export class BotDetectorService {
  isBot(userAgent?: string | null): boolean {
    if (!userAgent) return false;

    const userAgentLower = userAgent.toLowerCase();

    const botPatterns = [
      'bot',
      'crawler',
      'spider',
      'slurp',
      'baiduspider',
      'yandexbot',
      'facebookexternalhit',
      'linkedinbot',
      'twitterbot',
      'slackbot',
      'telegrambot',
      'whatsapp',
      'ahrefsbot',
      'semrushbot',
      'pingdom',
      'googlebot',
      'bingbot',
      'yandex',
      'duckduckbot',
      'ia_archiver',
      'applebot',
      'headlesschrome',
      'lighthouse',
      'pagespeed',
      'ptst',
      'uptimerobot',
      'bitlybot',
      'discordbot',
      'curl',
      'wget',
      'python-requests',
      'axios',
      'postman',
      'insomnia',
      'screaming frog',
      'sitebulb',
      'netcraft',
      'check_http',
      'monitoring',
    ];

    return botPatterns.some((pattern) => userAgentLower.includes(pattern));
  }

  identifyBotType(userAgent?: string | null): string | null {
    if (!userAgent || !this.isBot(userAgent)) return null;

    const userAgentLower = userAgent.toLowerCase();

    const botTypeMap: Record<string, string> = {
      googlebot: 'Googlebot',
      bingbot: 'Bingbot',
      yandexbot: 'Yandexbot',
      baiduspider: 'Baiduspider',
      facebookexternalhit: 'Facebook',
      linkedinbot: 'LinkedIn',
      twitterbot: 'Twitter',
      slackbot: 'Slack',
      telegrambot: 'Telegram',
      whatsapp: 'WhatsApp',
      ahrefsbot: 'Ahrefs',
      semrushbot: 'SEMrush',
      applebot: 'Applebot',
      duckduckbot: 'DuckDuckBot',
      ia_archiver: 'Internet Archive',
      headlesschrome: 'Headless Chrome',
      lighthouse: 'Lighthouse',
      pagespeed: 'PageSpeed',
      uptimerobot: 'UptimeRobot',
      bitlybot: 'Bitly',
      discordbot: 'Discord',
      curl: 'Curl',
      wget: 'Wget',
      'python-requests': 'Python Requests',
      axios: 'Axios',
      postman: 'Postman',
      insomnia: 'Insomnia',
    };

    for (const [pattern, botType] of Object.entries(botTypeMap)) {
      if (userAgentLower.includes(pattern)) {
        return botType;
      }
    }

    if (userAgentLower.includes('spider')) return 'Spider';
    if (userAgentLower.includes('crawler')) return 'Crawler';
    if (userAgentLower.includes('bot')) return 'Bot';

    return 'Unknown Bot';
  }
}
