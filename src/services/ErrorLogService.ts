import { Repository } from 'typeorm';
import { MysqlDataSource } from '../config/database';
import { ErrorLogs } from '../database/entity/ErrorLogs';

export class ErrorLogService {
  private errorLogRepository: Repository<ErrorLogs>;

  constructor() {
    this.errorLogRepository = MysqlDataSource.getRepository(ErrorLogs);
  }

  public async insertError(error, route): Promise<void> {
    await this.errorLogRepository.insert({
      errorRoute: route,
      errorDescription: error.message
    });
  }
}
