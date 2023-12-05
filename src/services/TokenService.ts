import { MysqlDataSource } from '../config/database';
import { Tokens } from '../database/entity/Tokens';
import { Repository } from 'typeorm';

export class TokenService {
  private tokenRepository: Repository<Tokens>;

  constructor() {
    this.tokenRepository = MysqlDataSource.getRepository(Tokens);
  }

  async saveToken(token: string) {
    await this.tokenRepository.save({ token });
  }

  async removeToken(token: string) {
    await this.tokenRepository.delete({ token });
  }

  async getToken(token: string): Promise<Tokens> {
    return await this.tokenRepository.findOneBy({ token });
  }
}
