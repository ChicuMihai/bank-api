import { BalanceDto } from './../balance/dto/balance.dto';
import { CreateTransactionDto } from './../transactions/dto/create-transaction.dto';
import { User } from 'src/users/entities/user.entity';
import { TransactionService } from './../transactions/transaction.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { TransformInterceptor } from '../transform.interceptor';
import { UserDto } from './dto/user.dto';
import { AuthenticationGuard } from '../auth/auth-guard';
import { ApiResponse } from '@nestjs/swagger';
import { UserParam } from './decorators/user';
import { BalanceService } from 'src/balance/balance.service';

@Controller('users')
@UseGuards(AuthenticationGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly transactionService: TransactionService,
    private readonly balanceService: BalanceService,
  ) {}

  @Get()
  @ApiResponse({ status: 200, type: [UserDto] })
  @UseInterceptors(new TransformInterceptor(UserDto))
  findAll() {
    return this.usersService.findAll();
  }

  @UseInterceptors(new TransformInterceptor(UserDto))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete()
  async remove(@UserParam() user: User) {
    return this.usersService.remove(user.id);
  }

  @Get('transactions')
  getAllTransactions(@UserParam() user: User) {
    return this.transactionService.findAllTransactions(user.id);
  }

  @Post('transaction')
  addTransaction(@Body() transaction: CreateTransactionDto) {
    return this.transactionService.createTransacition(transaction);
  }

  @Get('transaction/:id')
  getTransaction(@Param('id') id: string) {
    return this.transactionService.getTransactionDetails(id);
  }

  @Get('transaction/:id/status')
  getTransactionStatus(@Param('id') id: string) {
    return this.transactionService.checkTransactionStatus(id);
  }

  @Post('transaction/:id/cancel')
  cancelTransaction(@Param('id') id: string) {
    return this.transactionService.cancelTransaction(id);
  }

  @Get('balance')
  @ApiResponse({ status: 200, type: BalanceDto })
  @UseInterceptors(new TransformInterceptor(BalanceDto))
  checkBalance(@UserParam() user: User) {
    return this.balanceService.getBalanceAmount(user.id);
  }
}
