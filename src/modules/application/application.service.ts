import { Injectable } from '@nestjs/common';

@Injectable()
export class ApplicationService {
  public async getAllByOrderId(id: string) {
    return await Promise.resolve(
      `This action returns all applications for order #${id}`,
    );
  }
}
