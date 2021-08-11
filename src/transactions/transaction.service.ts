import { BalanceService } from './../balance/balance.service';
import { Status } from './types';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { TrasactionInReviewEvent } from './events/transaction-inreview.event';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private balanceService: BalanceService,
    private eventEmitter: EventEmitter2,
  ) {}

  createTransacition(transactionData: CreateTransactionDto) {
    this.transactionRepository.save({
      ...transactionData,
      status: Status.CREATED,
    });
  }

  @Cron('*/5 * * * *')
  async verifyTransaction() {
    const transactions = await this.transactionRepository.find({
      where: { status: Status.CREATED },
    });
    for (const transaction of transactions) {
      this.transactionRepository.update(transaction, {
        status: Status.IN_REVIEW,
      });
      this.eventEmitter.emit(
        'transaction.inreview',
        new TrasactionInReviewEvent(
          transaction.amount,
          transaction.senderUserId,
        ),
      );
    }
  }

  @OnEvent('transaction.inreview')
  async onInReviewHandler(payload: TrasactionInReviewEvent) {
    const { amount, senderUserId } = payload;
    const isTransactionAmountValid =
      await this.balanceService.verifyBalanceForTransaction(
        amount,
        senderUserId,
      );

    const newTransactionStatus = isTransactionAmountValid
      ? Status.COMPLETE
      : Status.DECLINED;

    const transaction = await this.transactionRepository.findOne({
      where: { senderUserId },
    });

    this.transactionRepository.update(transaction, {
      status: newTransactionStatus,
    });
  }

  async checkTransactionStatus(transactionId: string) {
    const { id, status } = await this.transactionRepository.findOne(
      transactionId,
    );
    if (!id) {
      throw new Error('Transaction not found');
    }
    return status;
  }

  findAllTransactions(userId: string) {
    return this.transactionRepository.find({
      where: { senderUserId: userId },
      order: { created_at: 'ASC' },
    });
  }

  getTransactionDetails(transactionId: string) {
    return this.transactionRepository.findOne(transactionId);
  }

  async cancelTransaction(transactionId: string) {
    const { status, ...rest } = await this.transactionRepository.findOne(
      transactionId,
    );
    if (status === Status.COMPLETE || status === Status.CANCELED) {
      throw new Error('Cannot cancel transaction');
    } else
      this.transactionRepository.save({
        ...rest,
        status: Status.CANCELED,
      });
  }
}
