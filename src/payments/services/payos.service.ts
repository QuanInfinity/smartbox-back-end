import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class PayOSService {
  private readonly clientId: string;
  private readonly apiKey: string;
  private readonly checksumKey: string;
  private readonly partnerCode: string;
  private readonly baseUrl = 'https://api-merchant.payos.vn';

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.getOrThrow('PAYOS_CLIENT_ID');
    this.apiKey = this.configService.getOrThrow('PAYOS_API_KEY');
    this.checksumKey = this.configService.getOrThrow('PAYOS_CHECKSUM_KEY');
    this.partnerCode = this.configService.getOrThrow('PAYOS_PARTNER_CODE');
  }

  async createPaymentLink(orderCode: number, amount: number, description: string) {
    const body = {
      orderCode,
      amount,
      description,
      returnUrl: `${this.configService.get('APP_URL')}/payment/success`,
      cancelUrl: `${this.configService.get('APP_URL')}/payment/cancel`,
    };

    const signature = this.createSignature(body);
    
    try {
      const response = await fetch(`${this.baseUrl}/v2/payment-requests`, {
        method: 'POST',
        headers: {
          'x-client-id': this.clientId,
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...body, signature }),
      });

      const data = await response.json();
      
      if (response.ok && data.code === '00') {
        return {
          checkoutUrl: data.data.checkoutUrl,
          paymentLinkId: data.data.paymentLinkId,
        };
      }
      
      throw new Error(data.desc || 'PayOS payment creation failed');
    } catch (error) {
      throw new Error(`PayOS API Error: ${error.message}`);
    }
  }

  verifyWebhookSignature(webhookBody: any, receivedSignature: string): boolean {
    const expectedSignature = this.createSignature(webhookBody);
    return expectedSignature === receivedSignature;
  }

  private createSignature(data: any): string {
    const sortedKeys = Object.keys(data).sort();
    const signaturePayload = sortedKeys
      .map(key => `${key}=${data[key]}`)
      .join('&');
    
    return CryptoJS.HmacSHA256(signaturePayload, this.checksumKey).toString();
  }
}


