import { TransactionDto } from './../transactions/dto/transaction.dto';
import { BalanceDto } from './../balance/dto/balance.dto';
import { CreateTransactionDto } from './../transactions/dto/create-transaction.dto';
import { User } from 'src/users/entities/user.entity';
import { TransactionService } from './../transactions/transaction.service';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { TransformInterceptor } from '../transform.interceptor';
import { AuthenticationGuard } from '../auth/auth-guard';
import { ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { UserParam } from './decorators/user';
import { BalanceService } from 'src/balance/balance.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
@UseGuards(AuthenticationGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly transactionService: TransactionService,
    private readonly balanceService: BalanceService,
  ) {}

  @Patch('/profile')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 1000000 },
      fileFilter(req, file, callback) {
        if (file.originalname.match(/\.(png|jpg)$/g)) {
          return callback(null, true);
        }
        callback(new Error('Wrong file type.Upload png/jpg files only'), false);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  async update(
    @UserParam() user: User,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    try {
      this.usersService.update(user.id, updateUserDto, avatar);
      return 'User Profile Updates SuccessFully';
    } catch (e) {
      throw new BadRequestException('Something went wrong');
    }
  }

  @Delete()
  async remove(@UserParam() user: User) {
    return this.usersService.remove(user.id);
  }

  @Get('/transactions')
  @ApiResponse({ status: 200, type: [TransactionDto] })
  @UseInterceptors(new TransformInterceptor(TransactionDto))
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

  @Get('export-transactions')
  @Header('Content-Encoding', 'gzip')
  async getTransactionsCsv(@UserParam() user: User) {
    const file = await this.transactionService.exportCSV(user.id);
    return new StreamableFile(file);
  }
}
