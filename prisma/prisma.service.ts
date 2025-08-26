import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      await this.$queryRaw`SELECT 1`;
    } catch (e: any) {
      console.error('Prisma init failed.');
      console.error('code:', e.code);
      console.error('message:', e.message);
      try {
        const url = new URL(process.env.DATABASE_URL!);
        console.error(
          'host:',
          url.hostname,
          'db:',
          url.pathname.replace('/', ''),
        );
        console.error('sslmode:', url.searchParams.get('sslmode'));
      } catch {}
      process.exit(1);
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    (this as any).$on('beforeExit', async () => {
      await app.close();
    });
  }
}
