import { Module } from '@nestjs/common';
import { CryptService } from './crypt.service.js';

@Module({
  providers: [CryptService],
  exports: [CryptService],
})

export class CryptModule {}