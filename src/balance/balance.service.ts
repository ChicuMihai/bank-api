import { Balance } from './entities/balance.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Balance) private balanceRepository: Repository<Balance>,
  ) {}

  async verifyBalanceForTransaction(amount: number, userId: string) {
    const { amount: balanceAmount } = await this.balanceRepository.findOne({
      where: { user: userId },
    });
    if (amount > balanceAmount) throw new Error('Balance is insufficient');
  }
}
